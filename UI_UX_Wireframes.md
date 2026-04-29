# UI/UX Wireframes: Multi-Agent E-commerce Assistant

## 1. Overview
The user interface is designed to facilitate a "Delegated Shopping" experience. The core component is a state-aware **Multi-Agent Chat Widget** that dynamically reflects the specialized workers (Search Agent, Cart Agent) as they perform tasks on behalf of the user.

## 2. User Flows

### Flow: Multi-Agent Collaborative Task
1.  **Start**: User clicks the Chat Widget.
2.  **Request**: User: "Find me blue shoes and add them to my cart if they are under $60."
3.  **Handoff 1 (Search)**: Widget shows status: `[ ProductSearch Agent is scanning catalog... ]`.
4.  **Display**: Agent shows 2-3 matched products as interactive cards.
5.  **Handoff 2 (Cart)**: Widget shows status: `[ CartManager Agent is updating your cart... ]`.
6.  **Confirmation**: Agent: "I've added the Nike Blue Runners ($55) to your cart. Ready to checkout?"

## 3. Screen List
-   **Persistent UI**: Floating Chat Widget (Bottom-Right).
-   **Storefront Integration**: Navbar Cart Badge (Syncs with Agent actions).
-   **Agent Response Views**:
    -   Natural Language Bubbles.
    -   Structured Product Rich-Cards.
    -   Status Progress Indicators (Agent Handoffs).

## 4. Wireframe Descriptions (ASCII)

### 4.1 Multi-Agent Chat Widget (Active State)
**Purpose**: Displays the real-time handoffs between specialized agents.

```
+------------------------------------------------+
| [O] Assistant: Ready to Help               [X] |
+------------------------------------------------+
| (User) Find running shoes and checkout.        |
|                                                |
| [ SEARCH AGENT ] <---------------------------+ |
| * Scanning inventory for 'running shoes'...    | | [Status]
|                                                | |
| (Bot) I found these matches:                   | |
| +--------------------------------------------+ |
| | [Img] Velocity Pro - $49.00  [Add to Cart] | |
| +--------------------------------------------+ |
|                                                |
| [ CART AGENT ] <-----------------------------+ |
| * Injecting user_id: 101...                    | | [Status]
| * Adding Velocity Pro to secure cart...        | |
|                                                |
| (Bot) Velocity Pro added. Your total is $49.00.|
| Should I proceed to the checkout page?         |
|                                                |
| [ Yes, Proceed ]         [ No, Keep Shopping ] |
|                                                |
| [ Type your request... ]                [Send] |
+------------------------------------------------+
```

### 4.2 Integrated Product Card (Inside Chat)
**Purpose**: Allow users to interact with agent-discovered items without leaving the chat.

```
+--------------------------------------+
| [IMG: SHOE]   Velocity Pro Elite     |
| Price: $49.00  |  Stock: 5 left      |
|                                      |
| [ Select & Add ]  [ View Details ]   |
+--------------------------------------+
```

### 4.3 Agent Status Indicators
**Purpose**: Provide transparency during multi-node transitions in LangGraph.

-   **Searching**: `[ ProductSearch: Analyzing Query... ]`
-   **Carting**: `[ CartManager: Authenticating Session... ]`
-   **Tracking**: `[ OrderTracker: Fetching Order #123... ]`

## 5. Mobile Considerations
-   The chat widget expands to full-screen on mobile devices.
-   Rich-cards stack vertically for easier thumb-selection.
-   Voice-to-Text integration for hands-free "Do-It-For-Me" requests.

---

# Recreation Prompt: UI / UX Wireframes

> **Role**: You are a UI/UX Designer.
> **Requirement**: I will provide you with a Business Requirement Document (BRD).
> **Task**: Based on the BRD, create a clear and simple UI/UX Wireframes Document with sample wireframes for the E-commerce Assistant.
> **Sections Required**: Overview, User flows (step-by-step), Screen list, Wireframe descriptions (Name, Purpose, Layout/Sections, Functionalities).
> **Guidelines**: Keep language simple, use bullet points, and provide sample wireframes in ASCII format only.

