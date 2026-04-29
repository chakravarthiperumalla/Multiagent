"""
agent_graph.py — Complete Multi-Agent E-Commerce AI
Features:
  • Full conversation history context for all agents
  • Parallel execution of ProductSearch / CartManager / OrderTracker
  • Structured action events returned to the UI (cart_updated, order_placed, etc.)
  • Robust tool-call loop with retry and error handling
"""

import operator
from typing import TypedDict, Annotated, List, Literal

from langchain_groq import ChatGroq
from langchain_core.messages import (
    BaseMessage, HumanMessage, AIMessage, ToolMessage, SystemMessage
)
from langgraph.graph import StateGraph, END
from langchain_core.tools import tool
from pydantic import BaseModel, Field

try:
    from langgraph.types import Send
except ImportError:
    from langgraph.constants import Send

import agents.tools as agent_tools


# ─────────────────────────────────────────────────────────────────────────────
# Tool Definitions
# ─────────────────────────────────────────────────────────────────────────────

@tool
def search_products(query: str) -> str:
    """
    Search for products by name, keyword, or category.
    Use a short keyword — e.g. 'headphones', 'running shoes', 'electronics'.
    """
    return agent_tools.get_product_list(search=query)


@tool
def browse_catalog(category: str = "") -> str:
    """
    Browse the full product catalog, optionally filtered by category.
    Categories: Electronics, Clothing, Footwear, Accessories, Home, Sports.
    Pass empty string to get all products.
    """
    return agent_tools.get_product_list(category=category if category else None)


@tool
def add_to_cart(product_id: int, quantity: int = 1, user_id: int = 1) -> str:
    """Add a product to the shopping cart by its product ID."""
    return agent_tools.add_item_to_cart(user_id=user_id, product_id=product_id, quantity=quantity)


@tool
def view_cart(user_id: int = 1) -> str:
    """View all items currently in the user's shopping cart with totals."""
    return agent_tools.get_cart_contents(user_id=user_id)


@tool
def checkout(shipping_address: str, user_id: int = 1) -> str:
    """Place an order for all cart items. Requires a shipping address."""
    return agent_tools.perform_checkout(user_id=user_id, shipping_address=shipping_address)


@tool
def get_order_status(user_id: int = 1) -> str:
    """Retrieve the complete order history and delivery status for this user."""
    return agent_tools.get_order_status(user_id=user_id)


# Tool registries — each specialist agent owns its own set
_search_tools = [search_products, browse_catalog]
_cart_tools   = [add_to_cart, view_cart, checkout]
_order_tools  = [get_order_status]

# Tools that must have user_id injected at runtime (never trust LLM-provided user_id)
_USER_SCOPED_TOOLS = {"add_to_cart", "view_cart", "checkout", "get_order_status"}

# Tools that trigger UI refresh actions
_CART_MUTATING_TOOLS  = {"add_to_cart"}
_ORDER_MUTATING_TOOLS = {"checkout"}


# ─────────────────────────────────────────────────────────────────────────────
# Shared State
# ─────────────────────────────────────────────────────────────────────────────

class AgentState(TypedDict):
    messages:      Annotated[List[BaseMessage], operator.add]
    user_id:       int
    current_query: str
    history_str:   str                                         # formatted conversation history
    agent_results: Annotated[List[str], operator.add]
    agents_used:   Annotated[List[str], operator.add]
    actions:       Annotated[List[dict], operator.add]         # UI action events
    intents:       List[str]
    sub_queries:   List[str]


# ─────────────────────────────────────────────────────────────────────────────
# LLM
# ─────────────────────────────────────────────────────────────────────────────

# Main LLM: Groq (Llama 3.3 70B)
llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)


# ─────────────────────────────────────────────────────────────────────────────
# Self-contained agent runner (parallel-safe, synchronous)
# ─────────────────────────────────────────────────────────────────────────────

def _run_agent(
    tools: list,
    system_prompt: str,
    query: str,
    user_id: int,
    history_str: str = "",
) -> tuple[str, list[dict]]:
    """
    Run a single specialist agent with its own tool-calling loop.
    Returns (response_text, actions_list).
    Safe to call from parallel graph nodes — no shared mutable state.
    """
    llm_with_tools = llm.bind_tools(tools)
    tool_map = {t.name: t for t in tools}
    actions: list[dict] = []

    # Build the message list: system + history context + current query
    messages: List = [SystemMessage(content=system_prompt)]

    if history_str:
        messages.append(SystemMessage(
            content=f"CONVERSATION HISTORY (use this for context):\n{history_str}"
        ))

    messages.append(HumanMessage(content=query))

    for iteration in range(6):  # max tool-calling iterations
        response = llm_with_tools.invoke(messages)
        messages.append(response)

        # No tool calls → agent is done
        if not getattr(response, "tool_calls", None):
            return response.content or "I couldn't find relevant information.", actions

        # Execute every tool call and feed results back
        for tc in response.tool_calls:
            args = dict(tc["args"])

            # Always inject authenticated user_id for user-scoped tools
            if tc["name"] in _USER_SCOPED_TOOLS:
                args["user_id"] = user_id

            try:
                tool_result = tool_map[tc["name"]].invoke(args)
            except Exception as exc:
                tool_result = f"Tool error: {exc}"

            tool_result_str = str(tool_result)

            messages.append(
                ToolMessage(content=tool_result_str, tool_call_id=tc["id"])
            )

            # Emit action events for UI to react to
            if tc["name"] in _CART_MUTATING_TOOLS and "✓" in tool_result_str:
                actions.append({
                    "type": "cart_updated",
                    "message": tool_result_str,
                    "icon": "🛒",
                })
            elif tc["name"] in _ORDER_MUTATING_TOOLS and "✓" in tool_result_str:
                actions.append({
                    "type": "order_placed",
                    "message": tool_result_str,
                    "icon": "📦",
                })

    return "I wasn't able to complete the request after several attempts. Please try rephrasing.", actions


# ─────────────────────────────────────────────────────────────────────────────
# Supervisor — detects ALL intents, routes to agents in parallel
# ─────────────────────────────────────────────────────────────────────────────

_SUPERVISOR_SYSTEM = """\
You are the Supervisor of an E-commerce AI multi-agent system for ShopEasy.
You have three specialist agents:
  • ProductSearch — finds and lists products from the catalog.
  • CartManager   — manages cart (view, add items, checkout/order).
  • OrderTracker  — retrieves order history and delivery status.

Your job: Analyse the user's LATEST message (considering conversation history) 
and identify EVERY intent. When the user asks about multiple things at once, 
return ALL matching agents so they run in parallel.

ROUTING RULES:
- Contains "search", "find", "show", "what", "list", "any" + product keyword → ProductSearch
- Contains "add", "put", "cart", "buy", "purchase", "checkout", "order now" → CartManager
- Contains "my order", "order status", "delivery", "shipped", "order history", "track" → OrderTracker  
- "What's in my cart" / "view cart" / "show cart" → CartManager
- Can match multiple agents if user asks multiple things at once.
"""


class Router(BaseModel):
    intents: List[Literal["ProductSearch", "CartManager", "OrderTracker"]] = Field(
        description="All specialist agents needed. Multiple entries run in parallel."
    )
    sub_queries: List[str] = Field(
        description="One focused, clean sub-query per intent (same order as intents)."
    )


_router_chain = llm.with_structured_output(Router)


def supervisor_node(state: AgentState) -> dict:
    system_msg = SystemMessage(content=_SUPERVISOR_SYSTEM)
    routing_q  = HumanMessage(
        content="Identify which agents are needed and the focused sub-query for each."
    )
    try:
        result: Router = _router_chain.invoke(
            [system_msg] + list(state["messages"]) + [routing_q]
        )
        intents     = list(result.intents)     or ["ProductSearch"]
        sub_queries = list(result.sub_queries) or [state["messages"][-1].content]
    except Exception:
        intents     = ["ProductSearch"]
        sub_queries = [state["messages"][-1].content]

    return {"intents": intents, "sub_queries": sub_queries}


def route_to_agents(state: AgentState) -> list:
    sends = [
        Send(intent, {**state, "current_query": sub_query})
        for intent, sub_query in zip(
            state.get("intents", []), state.get("sub_queries", [])
        )
    ]
    if not sends:
        sends = [Send("ProductSearch", {**state, "current_query": state["messages"][-1].content})]
    return sends


# ─────────────────────────────────────────────────────────────────────────────
# Worker Nodes (each runs its own tool loop — parallel-safe)
# ─────────────────────────────────────────────────────────────────────────────

def product_search_node(state: AgentState) -> dict:
    query = state.get("current_query") or state["messages"][-1].content
    result, actions = _run_agent(
        tools=_search_tools,
        system_prompt=(
            "You are the Product Search Agent for ShopEasy e-commerce platform.\n"
            "Your ONLY job: search the product catalog and present results clearly.\n\n"
            "STRICT RULES:\n"
            "1. ALWAYS call search_products or browse_catalog FIRST — never answer from memory.\n"
            "2. Extract the core keyword: 'Show me headphones' → search_products(query='headphones').\n"
            "3. If 'browse', 'all products', or a category is mentioned → use browse_catalog.\n"
            "4. Present results in a list: product name, price, ID, stock status.\n"
            "5. If a product has an ID, always show it (the user may want to add it to cart).\n"
            "6. NEVER say 'no products found' without calling the tool first.\n"
            "7. Be concise, friendly, and helpful."
        ),
        query=query,
        user_id=state["user_id"],
        history_str=state.get("history_str", ""),
    )
    return {
        "agent_results": [f"🛍️ **Product Search**\n{result}"],
        "agents_used":   ["ProductSearch"],
        "actions":       actions,
    }


def cart_manager_node(state: AgentState) -> dict:
    query = state.get("current_query") or state["messages"][-1].content
    result, actions = _run_agent(
        tools=_cart_tools,
        system_prompt=(
            f"You are the Cart Manager Agent for ShopEasy, serving User #{state['user_id']}.\n"
            "Your job: manage the shopping cart and handle checkout/ordering.\n\n"
            "STRICT RULES:\n"
            "1. To VIEW the cart → call view_cart(). Summarize the contents clearly.\n"
            "2. To ADD an item → call add_to_cart(product_id=<ID>, quantity=<N>).\n"
            "   If the user says 'add headphones' and mentioned ID in history, use that ID.\n"
            "3. To CHECKOUT/ORDER → call checkout(shipping_address='<address>').\n"
            "   If no address given, ask the user for one.\n"
            "4. NEVER guess cart contents — always call view_cart first.\n"
            "5. If cart is empty, say so clearly and suggest browsing products.\n"
            "6. Respond concisely and confirm every action with its result.\n"
            "7. Use conversation history to extract product IDs if the user referenced a previous search."
        ),
        query=query,
        user_id=state["user_id"],
        history_str=state.get("history_str", ""),
    )
    return {
        "agent_results": [f"🛒 **Cart & Checkout**\n{result}"],
        "agents_used":   ["CartManager"],
        "actions":       actions,
    }


def order_tracker_node(state: AgentState) -> dict:
    query = state.get("current_query") or state["messages"][-1].content
    result, actions = _run_agent(
        tools=_order_tools,
        system_prompt=(
            f"You are the Order Tracker Agent for ShopEasy, serving User #{state['user_id']}.\n"
            "Your job: retrieve and clearly present the user's order history and status.\n\n"
            "STRICT RULES:\n"
            "1. ALWAYS call get_order_status first — never answer from memory.\n"
            "2. Present each order: Order ID, status, total amount, items, date, shipping address.\n"
            "3. If no orders exist, tell the user clearly.\n"
            "4. Respond in a friendly, reassuring tone."
        ),
        query=query,
        user_id=state["user_id"],
        history_str=state.get("history_str", ""),
    )
    return {
        "agent_results": [f"📦 **Order Status**\n{result}"],
        "agents_used":   ["OrderTracker"],
        "actions":       actions,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Result Merger — combines parallel agent outputs into one coherent reply
# ─────────────────────────────────────────────────────────────────────────────

def result_merger_node(state: AgentState) -> dict:
    results = state.get("agent_results", [])

    if not results:
        final = "I'm sorry, I couldn't process your request. Please try again."
    elif len(results) == 1:
        final = results[0].strip()
    else:
        # Multiple parallel agents — join with clear visual separator
        final = "\n\n---\n\n".join(r.strip() for r in results)

    return {"messages": [AIMessage(content=final)]}


# ─────────────────────────────────────────────────────────────────────────────
# Graph Construction
# ─────────────────────────────────────────────────────────────────────────────

workflow = StateGraph(AgentState)

workflow.add_node("Supervisor",    supervisor_node)
workflow.add_node("ProductSearch", product_search_node)
workflow.add_node("CartManager",   cart_manager_node)
workflow.add_node("OrderTracker",  order_tracker_node)
workflow.add_node("ResultMerger",  result_merger_node)

workflow.set_entry_point("Supervisor")

workflow.add_conditional_edges(
    "Supervisor",
    route_to_agents,
    ["ProductSearch", "CartManager", "OrderTracker"],
)

workflow.add_edge("ProductSearch", "ResultMerger")
workflow.add_edge("CartManager",   "ResultMerger")
workflow.add_edge("OrderTracker",  "ResultMerger")
workflow.add_edge("ResultMerger",  END)

graph = workflow.compile()


# ─────────────────────────────────────────────────────────────────────────────
# Public API — called by FastAPI /chat endpoint
# ─────────────────────────────────────────────────────────────────────────────

def _build_history_str(history: list[dict]) -> str:
    """Convert list of {role, content} dicts into a readable string for agents."""
    if not history:
        return ""
    lines = []
    for msg in history[-10:]:  # last 10 turns max (keep context window reasonable)
        role = "Customer" if msg.get("role") == "user" else "Assistant"
        lines.append(f"{role}: {msg.get('content', '')}")
    return "\n".join(lines)


def _build_langchain_history(history: list[dict]) -> list[BaseMessage]:
    """Convert conversation history into LangChain message objects."""
    msgs = []
    for msg in history[-10:]:
        role    = msg.get("role", "user")
        content = msg.get("content", "")
        if role == "user":
            msgs.append(HumanMessage(content=content))
        else:
            msgs.append(AIMessage(content=content))
    return msgs


async def run_agent(
    query: str,
    user_id: int,
    history: list[dict] | None = None,
) -> tuple[str, list[str], list[dict]]:
    """
    Run the full multi-agent graph.
    Returns: (response_text, agents_used_list, actions_list)

    history: list of {"role": "user"|"assistant", "content": "..."} dicts
    """
    history = history or []
    history_str = _build_history_str(history)
    lc_history  = _build_langchain_history(history)

    # The messages list = history + current user query
    all_messages = lc_history + [HumanMessage(content=query)]

    inputs: AgentState = {
        "messages":      all_messages,
        "user_id":       user_id,
        "current_query": query,
        "history_str":   history_str,
        "agent_results": [],
        "agents_used":   [],
        "actions":       [],
        "intents":       [],
        "sub_queries":   [],
    }

    result = await graph.ainvoke(inputs)

    agents_used = result.get("agents_used", [])
    actions     = result.get("actions", [])

    # Return the last AIMessage produced by ResultMerger
    for msg in reversed(result.get("messages", [])):
        if isinstance(msg, AIMessage) and msg.content:
            return msg.content, agents_used, actions

    return "How else can I help you with your shopping today?", agents_used, actions
