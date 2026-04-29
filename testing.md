# Testing Guide: E-commerce Multi-Agent Platform

This document outlines the testing strategies to ensure the stability of the platform.

## 1. Backend API Testing
Use `pytest` and `httpx` to verify core REST endpoints:
- **Auth**: Test `/register` and `/token` (login) to ensure JWTs are issued.
- **Products**: Verify `/products` returns the catalog and supports search filters.
- **Cart**: Ensure `/cart` operations correctly persist for the authenticated user.

## 2. Multi-Agent Logic Testing
Testing the LangGraph in `agent_graph.py` requires checking intent and routing:
- **Supervisor Routing**:
    - Input: "Search for laptops" -> Expected: Routes to `ProductSearch`.
    - Input: "What is in my cart?" -> Expected: Routes to `CartManager`.
- **Tool Injection**:
    - Verify that when the `CartManager` calls `add_to_cart`, the `user_id` from the state is correctly injected into the tool arguments.
- **Terminal Condition**:
    - Ensure the agent eventually returns a `FINISH` state or a final `AIMessage` content.

## 3. Frontend Integration
- **Socket/API Calls**: Verify `AIWidget.jsx` sends the correct payload to `/chat`.
- **State Updates**: Check that adding an item via the AI Assistant triggers a state update in the UI (or requires a refresh to sync with the backend).

## 4. Manual Verification Checklist
1. Register a new user and login.
2. Search for "Smartphone" in the AI Assistant.
3. Tell the assistant: "Add the first one to my cart."
4. Ask the assistant: "Show me my cart."
5. Command the assistant: "Checkout this order to 123 Main St."
6. Verify the order appears in the user's "Order History" in the web UI.

## 5. Automated Test Suite (Example)
Run the following command in the `backend/` directory:
```bash
pytest
```
*(Note: Ensure your `.env` is configured for a test database if running automated DB tests.)*

---

# Recreation Prompt: API Testing & Validation

> **Task**: Create a separate testing and validation document (`assistant_api_testing.md`) that explains:
> **Sections Required**: API testing strategy for the Assistant Chat feature, Validation steps (Chat input/output, Cart updates, Checkout triggers, Order tracking responses), Tools and approach (manual + automated testing).
> **Guidelines**: Only include Assistant-related APIs.

