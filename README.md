# Operator Blackjack

A containerized full-stack web application featuring a decoupled React frontend and a FastAPI backend, managed via Docker Compose.

## System Architecture
This project operates on a microservice architecture, separating the client interface from the game logic and database layers.

* **Backend:** A stateless REST API built with Python and FastAPI. It handles game logic, deck state, and validation.
* **Database:** PostgreSQL, integrated via SQLAlchemy ORM for persistent session state and user data storage.
* **Frontend:** A strictly typed React application built with TypeScript and bundled with Vite. It communicates with the backend via asynchronous HTTP requests, utilizing a Vite reverse-proxy during local development to bypass CORS restrictions.
* **Authentication:** User sessions and game states are secured and tracked using JWTs (JSON Web Tokens).
* **Infrastructure:** The entire stack is containerized using Docker and orchestrated with Docker Compose, ensuring environment parity across different machines.
* **CI/CD:** Automated build pipelines configured via GitHub Actions to verify multi-container compilation on every push.

## Tech Stack
* **Languages:** Python 3, TypeScript, HTML/CSS
* **Backend Framework:** FastAPI
* **Frontend Framework:** React
* **Database Engine:** PostgreSQL
* **DevOps:** Docker, Docker Compose, GitHub Actions

## Evolution & Migration
This system was originally developed as a monolithic Flask application utilizing Jinja server-side templating. It was actively refactored into its current state—a decoupled FastAPI backend and React frontend—to enforce strict typing, improve asynchronous state management, and align with modern enterprise API architecture.

## Local Deployment

**Prerequisites:** * Docker
* Docker Compose

**Execution:**
1. Clone the repository.
2. Navigate to the project root directory.
3. Run the following command to build and attach the containers:
   `docker compose up --build`

**Access Points:**
* Frontend UI: `http://localhost:5173`
* Backend API Documentation (Swagger UI): `http://localhost:8000/docs`
