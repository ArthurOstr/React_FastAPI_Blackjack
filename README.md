# Operator Blackjack

**[🔴 Live Demo: Play Operator Blackjack](https://react-fastapi-blackjack.onrender.com)**

A production-deployed, containerized full-stack web application featuring a decoupled React frontend and a FastAPI backend, orchestrated via Docker Compose.

## System Architecture

This project operates on a microservice architecture, separating the client interface from the game logic and database layers.

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Backend** | FastAPI (Python) | Stateless REST API — game logic, deck state, validation |
| **Database** | PostgreSQL + SQLAlchemy | Persistent session state and user data |
| **Frontend** | React + TypeScript + Vite | Strictly typed client, async HTTP communication |
| **Auth** | JWT | Secure session and game state tracking |
| **Infrastructure** | Docker + Docker Compose | Full environment containerization |
| **CI/CD** | GitHub Actions | Automated multi-container build verification on every push |

## 🔄 Architectural Evolution

This system was deliberately migrated from a monolithic Flask/Jinja2 application to a decoupled architecture to enforce strict typing, eliminate server-side rendering constraints, and align with modern API design principles.

* **V1:** Monolithic Flask app with Jinja2 server-side templating.
* **V2:** Decoupled FastAPI backend + React frontend, fully containerized, production-deployed.

> *The migration was driven by architectural intent — not framework preference.*

## ⚙️ Tech Stack

* **Languages:** Python 3, TypeScript, HTML/CSS
* **Backend:** FastAPI, Pydantic, SQLAlchemy
* **Frontend:** React, Vite
* **Database:** PostgreSQL
* **DevOps:** Docker, Docker Compose, GitHub Actions
* **Deployment:** Render

## Local Deployment

**Prerequisites:** Docker, Docker Compose

```bash
git clone [https://github.com/ArthurOstr/React_FastAPI_Blackjack](https://github.com/ArthurOstr/React_FastAPI_Blackjack)
cd React_FastAPI_Blackjack
docker compose up --build
