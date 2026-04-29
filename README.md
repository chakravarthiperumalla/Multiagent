# E-commerce Platform with Multi-Agent Assistant

A modern full-stack e-commerce application featuring an AI shopping assistant powered by LangGraph.

## Features

- **Core E-commerce:** Browse products, cart management, secure checkout.
- **AI Assistant:** Conversational agent that can search items and automate checkout using LangGraph.
- **Admin Section:** Simple order management (via API).
- **Modern UI:** Responsive design built with React and Tailwind CSS.


## Setup Instructions

### Backend (FastAPI)
1. Navigate to `/backend`.
2. Install dependencies: `pip install -r requirements.txt`.
3. Create a `.env` file based on `.env.example`.
4. Seed the database: `python seed.py`.
5. Run server: `uvicorn main:app --reload`.

### Frontend (React)
1. Navigate to `/frontend`.
2. Install dependencies: `npm install`.
3. Create a `.env` file: `VITE_API_URL=http://localhost:8000`.
4. Run dev server: `npm run dev`.

## Test Credentials
- **Admin:** `admin@shop.com` / `admin123`
- **Customer:** `user@shop.com` / `user123`

## Technology Stack
- **Frontend:** React, Vite, Tailwind CSS, Axios, Context API.
- **Backend:** FastAPI, SQLAlchemy, PostgreSQL.
- **AI:** LangGraph, LangChain.

---

# Recreation Prompt: Core Implementation (Coding)

> **Role**: You are a Senior Full-Stack Engineer and UI/UX Expert.
> **Task**: Build a complete, production-ready Multi-Agent E-commerce Assistant (backend + frontend) and attach it to the existing e-commerce application.
> **Requirements**:
> 1. **Architecture**: Strictly follow the Supervisor-Worker pattern using LangGraph. NO MCP.
> 2. **Backend**: FastAPI (Python 3.10/3.11), REST-based APIs, modular code. Agent handles conversational shopping, carting, checkout, and tracking.
> 3. **Frontend**: React.js with modern responsive UI (Tailwind), chat-based experience.
> 4. **Database**: Use existing PostgreSQL Neon DB. Create migrations for agent-specific only.
> 5. **Quality**: Error-free, complete, runnable, and includes unit/integration tests.
> **Output**: Fully working, bug-free codebase integrated into the existing project.

