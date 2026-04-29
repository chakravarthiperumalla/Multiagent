You are a Senior Full-Stack Engineer and UI/UX Expert.
I will provide you with:
1.	Business Requirement Document (BRD)
2.	UI/UX Wireframes Document
3.	Architectural Design Document

Task:
Build a complete, production-ready Multi-Agent E-commerce Assistant (backend + frontend) and attach it to the existing e-commerce application.

Requirements
1. Architecture & Tech Stack
   
•	Follow the Architecture Design Document strictly
•	Implement multi-agent logic using LangGraph only
•	DO NOT use MCP, MCP client, or MCP server concepts

3. Backend Requirements
•	FastAPI-based REST APIs
•	Python 3.10 / 3.11
•	LangGraph for agent orchestration
•	Clean, modular, well-commented code
•	Database schema, models, and migrations included
•	APIs must be REST-based
•	Agent handles:
o	Conversational shopping
o	Add to cart
o	Checkout initiation
o	Order tracking
4. Code Quality
•	Error-free, complete, and runnable
•	Validate and debug internally
•	Proper project structure
•	Unit tests and integration tests included
5. Frontend Requirements
•	React.js with modern responsive UI
•	Tailwind CSS or equivalent
•	Follow provided wireframes strictly
•	Chat-based shopping experience via Assistant
6. Database Setup
•	Use existing PostgreSQL Neon DB
•	Do not create a new database
•	Create migrations only for agent-related tables
•	Provide migration commands
7. Deployment & Setup
•	README file with:
o	Backend setup
o	Frontend setup
o	Environment variables (.env templates)
o	Deployment steps
•	No Docker
•	No unnecessary code
•	Use .env files for frontend-backend connectivity
IMPORTANT
•	Assistant must be integrated into the existing e-commerce project
•	Do NOT create a new standalone project
•	No dependency-related runtime errors
•	List all dependencies clearly
•	Do not install anything automatically
•	Do not ask for confirmations
Final Output
•	Fully working, bug-free codebase
•	Frontend + Backend + Database + Tests
•	Ready for deployment
