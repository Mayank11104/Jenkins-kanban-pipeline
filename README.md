# Kanban Board — Real-Time Task Management Board

A simple, real-time Kanban board built with React, Node.js, Express, MongoDB, and Socket.io. Fully containerized with Docker Compose.

## Features

- Drag-and-drop task management across 3 columns (To Do, In Progress, Done)
- Add new tasks with title and description
- Delete tasks
- Real-time updates via Socket.io (changes sync across tabs instantly)


## Tech Stack

| Layer     | Technology             |
|-----------|------------------------|
| Frontend  | React.js               |
| Backend   | Node.js + Express.js   |
| Database  | MongoDB (Mongoose ODM) |
| Real-time | Socket.io              |
| DevOps    | Docker + Docker Compose|

## Project Structure

```
project-root/
├── frontend/             
│   ├── Dockerfile
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── AddTaskForm.js
│       │   └── TaskCard.js
│       ├── App.js
│       ├── index.js
│       └── index.css
├── backend/               # Express API
│   ├── Dockerfile
│   ├── models/
│   │   └── Task.js
│   ├── routes/
│   │   └── tasks.js
│   └── server.js
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites
- Docker and Docker Compose installed

### Run the App

```bash
docker-compose up --build
```

Once running:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/tasks
- Health Check: http://localhost:5000/api/health

### Stop the App

```bash
docker-compose down
```

To remove stored data:

```bash
docker-compose down -v
```

## API Endpoints

| Method | Endpoint          | Description       |
|--------|-------------------|-------------------|
| GET    | /api/tasks        | Get all tasks     |
| POST   | /api/tasks        | Create a task     |
| PUT    | /api/tasks/:id    | Update a task     |
| DELETE | /api/tasks/:id    | Delete a task     |
| GET    | /api/health       | Health check      |

## Environment Variables

### Backend
| Variable   | Default                          | Description         |
|------------|----------------------------------|---------------------|
| MONGO_URI  | mongodb://localhost:27017/kanban  | MongoDB connection  |
| PORT       | 5000                             | Server port         |

### Frontend
| Variable           | Default               | Description          |
|--------------------|-----------------------|----------------------|
| REACT_APP_API_URL  | http://localhost:5000  | Backend API URL      |

## Author

Mayank Chaudhari
