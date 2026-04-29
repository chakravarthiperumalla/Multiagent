# Architectural Design: Multi-Agent E-commerce Assistant

## 1. Introduction

### 1.1 Purpose of the System
This document defines the architecture of a **Multi-Agent Orchestration Layer** built on top of an existing e-commerce platform. It enables automated shopping workflows via specialized AI actors.

### 1.2 High-Level Description
The system uses **LangGraph** to manage a cyclic state machine. A **Supervisor** model determines which specialized **Worker Agent** should handle the current turn based on the user's intent. All tools are executed in the context of a dynamically injected `user_id`.

---

## 2. Architecture Overview

### 2.1 Multi-Agent State Machine (LangGraph)
The core logic resides in a graph-based orchestration:
1.  **Supervisor Node**: Analyzes text to choose the `next` agent or `FINISH`.
2.  **Worker Nodes**: specialized prompts with access to specific toolsets.
3.  **Tool Nodes**: Execute Python functions (SQL queries, Cart CRUD) and return results to the workers.

### 2.2 Orchestration Diagram (ASCII)

```
       +-----------------------+
       |   User Input (Chat)   |
       +-----------+-----------+
                   |
        +----------v----------+
        |  Supervisor Engine  | <---------------+
        | (GPT-4o-mini Router)|                 |
        +----------+----------+                 |
                   |                            |
      +------------+------------+               |
      |            |            |               |
+-----v-----+ +----v----+ +-----v-----+         |
| Product   | | Cart    | | Order     |         |
| SearchER  | | Manager | | Tracker   |         |
+-----+-----+ +----+----+ +-----+-----+         |
      |            |            |               |
      |      +-----v-----+      |               |
      +------> Tool Node <------+               |
             | Handler   |                      |
             +-----+-----+                      |
                   |                            |
                   +----------------------------+
                    (Update State & Loop)
```

---

## 3. Application Architecture

### 3.1 Backend: FastAPI + LangGraph
-   **Framework**: FastAPI for RESTful endpoints (`/chat`, `/auth`).
-   **Intelligence Layer**:
    -   **`AgentState`**: A TypedDict containing `messages`, `next_worker`, and `user_id`.
    -   **Supervisor**: Uses a Pydantic "Router" model to output the name of the next node.
    -   **Worker Agents**: `Search` (Catalog tools), `Cart` (Transactional tools), `System` (Support).

### 3.2 Security: User Context Injection
A critical architectural pattern is used to ensure security:
-   **Inbound**: The `/chat` endpoint extracts `user_id` from the JWT.
-   **Execution**: The `user_id` is passed into the `AgentState`.
-   **Tool Execution**: Before calling a Cart tool, the system programmatically injects the `user_id` into the tool's arguments, preventing agents from modifying other users' carts.

### 3.3 Data Layer: PostgreSQL (Neon DB)
-   The assistant directly consumes the existing DB schema (`Products`, `Carts`, `Orders`).
-   It uses SQLAlchemy for ORM interactions within the Agent Tools.

---

## 4. Deployment & Infrastructure
-   **Platform**: Render (Horizontal Scaling enabled).
-   **Memory**: Each agent invocation is stateless and persisted via the `AgentState` within the FastAPI request cycle.
-   **Environment**: Python 3.11+.

## 5. Non-Functional Considerations
-   **Observability**: Agent handoffs are logged to track "Routing Failure" rates.
-   **Scalability**: The Supervisor pattern allows adding new specialized agents (e.g., "RefundAgent") without refactoring the core logic.
-   **Robustness**: If the Supervisor is unsure, it defaults to a general support worker for human-like clarification.

---

# Recreation Prompt: Architectural Design

> **Role**: You are a Software Solution Architect.
> **Requirement**: Provide the BRD and UI/UX Wireframes.
> **Task**: Create a complete Architectural Design Document in ASCII format for the Multi-Agent E-commerce Assistant.
> **Sections Required**: Introduction, Architecture Overview (Diagram in ASCII), Application Architecture (React.js Frontend, FastAPI Backend with Python 3.10/3.11, REST APIs, PostgreSQL Neon DB, LangGraph for orchestration), Deployment Architecture, Non-Functional Considerations.
> **Guidelines**: Clear, structured, and easy to understand for developers and stakeholders.

