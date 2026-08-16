# Internal Task & Management Dashboard

A professional, real-time frontend application for task and board management built with React and Vite.

## Overview
This project is an Internal Task & Management Dashboard that provides robust features to organize work, manage tasks across different boards, and track progress using a Kanban-style interface. The application features real-time synchronization, drag-and-drop capabilities, and per-column infinite scrolling to ensure a smooth, dynamic user experience.

## Technologies Used

*   **Core:** React (v18), Vite, JavaScript
*   **Styling:** Tailwind CSS, Reactstrap, Bootstrap
*   **Routing:** React Router DOM (v7)
*   **API / Networking:** Axios, Socket.IO Client
*   **Drag & Drop:** `@dnd-kit/core`, `@dnd-kit/sortable`
*   **Icons / UI Enhancements:** React Icons, FontAwesome, SweetAlert2, React Toastify
*   **Other Libraries:** react-hook-form, classnames, date-fns (if utilized for date formatting), react-select, and tinymce-react.

## Features

### Dashboard
*   Summary statistics and general overview (configured via `dashboard.api.js`).

### Kanban Board
*   Multiple distinct boards.
*   Drag and drop functionality for tasks between columns (powered by `@dnd-kit`).
*   Infinite scroll for loading tasks within specific columns.
*   Real-time synchronization of board and task updates.

### Task Management
*   Create, view, update, and delete tasks.
*   Assign tasks to users.
*   Task details view via modals.

### Board Management
*   Create new boards.
*   Edit and delete existing boards.
*   Manage columns/categories within boards.

### Comments
*   Add, edit, and delete comments on individual tasks.

### Real-Time Updates
*   Socket.IO integration for live updates.
*   Board-specific socket rooms for targeted synchronization.

### Responsive Design
*   Fully responsive interface combining Tailwind CSS utility classes and Bootstrap/Reactstrap components.

## Project Structure

```text
src/
├── api/          # API endpoint configurations (Axios client, specific API services)
├── assets/       # Static assets like fonts or base styles
├── components/   # Reusable UI components shared across multiple pages
├── context/      # React contexts (e.g., AuthContext for state management)
├── hooks/        # Custom React hooks
├── images/       # Image assets
├── layout/       # Application layout components (sidebar, header, content wrappers)
├── pages/        # Page-level application screens
│   ├── app/      # Main application pages (Dashboard, Kanban)
│   ├── auth/     # Authentication pages (Login, Register)
│   └── error/    # Error pages (404, etc.)
├── route/        # Routing configuration and route guards (AuthGuard)
├── services/     # Services like SocketService for real-time connection management
├── utils/        # Reusable helper functions and constants
├── App.jsx       # Main application component
├── main.jsx      # Application entry point
└── index.css     # Global styles and Tailwind directives
```

## Architecture

The frontend follows a modern React component-based architecture integrated with RESTful APIs and WebSocket for real-time capabilities.

**Standard Flow:**
```text
User
  ↓
React UI
  ↓
Components / Pages
  ↓
API Services (src/api/*)
  ↓
Backend REST API
```

**Real-Time Flow:**
```text
Backend Socket.IO
  ↓
Socket.IO Client (src/services/socket.service.js)
  ↓
React State / Context
  ↓
UI Update
```

## API Integration

The application uses `axios` configured in `src/api/client.js` as the base API client. Endpoint modules are split by feature.

| Method | Endpoint               | Purpose                       |
|--------|------------------------|-------------------------------|
| POST   | `/auth/login`          | Authenticate user             |
| POST   | `/auth/register`       | Register new user             |
| GET    | `/auth/me`             | Get current authenticated user|
| GET    | `/boards`              | Fetch all boards              |
| POST   | `/boards`              | Create a board                |
| PUT    | `/boards/:id`          | Update a board                |
| DELETE | `/boards/:id`          | Delete a board                |
| GET    | `/tasks`               | Fetch tasks                   |
| POST   | `/tasks`               | Create a task                 |
| PUT    | `/tasks/:id`           | Update a task                 |
| DELETE | `/tasks/:id`           | Delete a task                 |
| GET    | `/tasks/:id/comments`  | Fetch comments for a task     |
| POST   | `/tasks/:id/comments`  | Add a comment to a task       |

## Real-Time Updates (Socket.IO)

Real-time functionality is managed centrally in `src/services/socket.service.js`.

*   **Connection:** Connects securely using the `VITE_SOCKET_URL` and passes the user's token for authentication.
*   **Board Rooms:** Uses `JOIN_BOARD` and `LEAVE_BOARD` events to subscribe the client to updates relevant only to the board they are currently viewing.
*   **Automatic Reconnection:** Configured with fallback polling and reconnection attempts to maintain a stable real-time link.
*   **Cleanup:** Properly disconnects and leaves board rooms when components unmount or boards change.

## Kanban Functionality

The core Kanban board (`src/pages/app/kanban/Kanban.jsx`) implements:
*   **State Management:** Utilizes `@dnd-kit` for complex drag-and-drop interactions across varying lists.
*   **Task Modals:** Detailed task viewing, editing, and deletion using Bootstrap modals (`TaskDetailModal`, `DeleteConfirmationModal`).
*   **Dynamic Loading:** Infinite scrolling is implemented natively using the `IntersectionObserver` API at the bottom of each column to load additional pages of tasks based on column status.

## Pagination / Infinite Scroll

Kanban columns use an infinite scroll approach. 
*   Tasks are queried and loaded per Kanban column based on their status.
*   An `IntersectionObserver` monitors a sentinel element at the bottom of the column list.
*   As the user scrolls and the sentinel becomes visible, additional pages are fetched dynamically, appending to the column's task list.

## Authentication

Authentication state is managed globally via `AuthContext`.
*   **Pages:** Includes Login and Registration flows.
*   **Storage:** JWT access tokens are stored in `localStorage` and attached to API requests via Axios interceptors.
*   **Protected Routes:** `AuthGuard` wraps secure application routes to ensure unauthenticated users are redirected to the login page.

## Environment Variables

The application requires the following environment variables to run properly. A `.env.example` file is provided in the repository.

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```
*Create a `.env` file in the root directory based on `.env.example` and replace the values with your actual backend URLs.*

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd task-management-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy `.env.example` to `.env` and configure your local backend endpoints:

```bash
cp .env.example .env
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173` (or the port specified by Vite).
