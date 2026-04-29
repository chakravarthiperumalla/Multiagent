# Deployment Guide: Multi-Agent E-commerce Extension

This guide details the deployment of the Multi-Agent Assistant into your existing E-commerce infrastructure on Render.

## 1. Environment Configuration

You'll need to set up the following environment variables for your application. Gather these before proceeding:
-   `GOOGLE_API_KEY`: Production key for Google Gemini (gemini-2.0-flash).
-   `DATABASE_URL`: Connection string for your managed PostgreSQL database (e.g., Neon).
-   `DEBUG`: Set to `False` to prevent sensitive trace leakage.

## 2. Deploying the Backend (FastAPI)

1. **Log in to Render** and click on **New +** -> **Web Service**.
2. Connect your Git repository.
3. Configure the Web Service settings as follows:
    - **Language / Environment**: `Python`
    - **Root Directory**: Leave blank (or set to `./` if prompted)
    - **Build Command**: `pip install -r backend/requirements.txt`
    - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Expand **Advanced** -> **Environment Variables** and add:
    - `GOOGLE_API_KEY` = `<your_google_api_key_here>`
    - `DATABASE_URL` = `<your_neon_db_url_here>`
    - `PYTHONVERSION` = `3.10` (or your appropriate Python version)
5. Click **Deploy Web Service**. Wait for the build to pass.

## 3. Applying Database Migrations

The database and agent-specific tables need to exist before the app functions fully.

1. Once the Backend Web Service is running, navigate to the **Shell** tab in your Render Web Service dashboard.
2. Run the seeding tool to initialize the tables and seed mock data:
    ```bash
    PYTHONPATH=$(pwd) python -m backend.seed
    ```
*(Note: SQLAlchemy `create_all` in `main.py` actually runs on startup, so core tables might already exist. This script seeds the environment).*

## 4. Deploying the Frontend (React / Vite)

1. Create a **New +** -> **Static Site** on Render.
2. Connect the existing Git repository.
3. Configure the Static Site settings:
    - **Root Directory**: `frontend`
    - **Build Command**: `npm install && npm run build`
    - **Publish Directory**: `dist`

> ⚠️ **Important**: Do NOT mix settings. If **Root Directory** is `frontend`, then Publish Directory must be `dist` (not `frontend/dist`). Setting Root Directory changes the base path Render uses for all other paths.
4. (Optional) In Advanced settings, set up a Rewrite rule for React Router (if you encounter 404s on page reload):
    - **Source**: `/*`
    - **Destination**: `/index.html`
    - **Action**: `Rewrite`
5. Map the backend URL required by the frontend API client. Usually, this means adding `VITE_API_URL` to the Environment Variables:
    - `VITE_API_URL` = `<your_backend_render_url>`
6. Click **Create Static Site** and wait for publication.

## 5. Scaling & Security

- **Scaling**: Render allows spinning up multiple instances of web services. The LangGraph state is kept in the database, allowing for seamless handoffs across instances.
- **Security Check**:
  - [ ] Verify that all tool calls in production are strictly scoped by `user_id`.
  - [ ] Ensure the `/chat` endpoint is protected by the `get_current_user` dependency.
  - [ ] Configure `allow_origins` in `backend/main.py` CORSMiddleware to exactly match your Render frontend domain instead of `["*"]`.
