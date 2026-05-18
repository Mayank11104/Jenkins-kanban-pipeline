import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import TaskCard from './components/TaskCard';
import AddTaskForm from './components/AddTaskForm';

// Derive backend URL at runtime so it works on any server (EC2, localhost, etc.)
// REACT_APP_API_URL overrides if explicitly set at build time.
const API_URL =
  process.env.REACT_APP_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:5000`;

const socket = io(API_URL);

// Column config — colKey maps to API status
const COLUMNS = [
  {
    id: 'todo',
    apiStatus: 'todo',
    title: 'To Do',
    dotClass: 'todo',
    emptyIcon: '○',
    emptyMsg: 'No tasks yet.\nDrop cards here or add a new one.',
  },
  {
    id: 'progress',
    apiStatus: 'in-progress',
    title: 'In Progress',
    dotClass: 'progress',
    emptyIcon: '◎',
    emptyMsg: 'Nothing in flight.\nStart a task to track progress.',
  },
  {
    id: 'done',
    apiStatus: 'done',
    title: 'Done',
    dotClass: 'done',
    emptyIcon: '✓',
    emptyMsg: 'No completed tasks.\nFinish something great!',
  },
];

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formDefaultCol, setFormDefaultCol] = useState('todo');

  // ── Fetch all tasks ───────────────────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/tasks`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Socket.io ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchTasks();

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('task:created', (task) => {
      setTasks((prev) => {
        if (prev.find((t) => t._id === task._id)) return prev;
        return [...prev, task];
      });
    });

    socket.on('task:updated', (updatedTask) => {
      setTasks((prev) =>
        prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
      );
    });

    socket.on('task:deleted', ({ _id }) => {
      setTasks((prev) => prev.filter((t) => t._id !== _id));
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:deleted');
    };
  }, [fetchTasks]);

  // ── Add task ──────────────────────────────────────────────────────────────
  const handleAddTask = async (title, description, status, priority, tag, assignee) => {
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, status, priority, tag, assignee }),
      });
      const task = await res.json();
      setTasks((prev) => {
        if (prev.find((t) => t._id === task._id)) return prev;
        return [...prev, task];
      });
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  // ── Move task ─────────────────────────────────────────────────────────────
  const handleMoveTask = async (taskId, newApiStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newApiStatus } : t))
    );
    try {
      await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newApiStatus }),
      });
    } catch (err) {
      console.error('Failed to move task:', err);
      fetchTasks();
    }
  };

  // ── Delete task ───────────────────────────────────────────────────────────
  const handleDeleteTask = async (taskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    try {
      await fetch(`${API_URL}/api/tasks/${taskId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete task:', err);
      fetchTasks();
    }
  };

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.target.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    setDragOverCol(null);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(colId);
  };

  const handleDragLeave = (e, colId) => {
    // Only clear if leaving the column entirely (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverCol(null);
    }
  };

  const handleDrop = (e, col) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;
    const task = tasks.find((t) => t._id === taskId);
    if (task && task.status !== col.apiStatus) {
      handleMoveTask(taskId, col.apiStatus);
    }
  };

  const getColumnTasks = (apiStatus) => tasks.filter((t) => t.status === apiStatus);

  // ── Open form to a specific column ────────────────────────────────────────
  const openFormForCol = (colId) => {
    setFormDefaultCol(colId);
    setFormOpen(true);
  };

  const openFormGeneral = () => {
    setFormDefaultCol('todo');
    setFormOpen(true);
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        Loading board…
      </div>
    );
  }

  return (
    <div className="kb-root">
      {/* Decorative background blobs */}
      <div className="bg-blob blob1" />
      <div className="bg-blob blob2" />
      <div className="bg-blob blob3" />

      {/* ── Header ── */}
      <header className="kb-header">
        <div className="kb-header-left">
          <div className="kb-logo">K</div>
          <div>
            <div className="kb-title">KanbanFlow</div>
            <div className="kb-breadcrumb">Projects / Sprint 12 / Board</div>
          </div>
        </div>

        <div className={`status-pill${connected ? '' : ' disconnected'}`}>
          <div className="pulse-dot" />
          {connected ? 'Connected' : 'Reconnecting…'}
        </div>

        <div className="kb-header-right">
          <button className="hdr-btn">⚙ Settings</button>
          <button className="hdr-btn">👥 Team</button>
          <button className="hdr-btn">⚡ Filter</button>
        </div>
      </header>

      {/* ── Toolbar ── */}
      <div className="kb-toolbar">
        <div className="kb-meta">
          <span className="meta-tag">📅 Sprint 12 · May 12–26</span>
          <span className="meta-tag">⎇ main</span>
          <span className="meta-tag">👥 {tasks.length} tasks</span>
        </div>
        <button className="add-btn" onClick={openFormGeneral}>
          + Add Task
        </button>
      </div>

      {/* ── Add Task Form (shown inline below toolbar) ── */}
      {formOpen && (
        <AddTaskForm
          key={formDefaultCol}
          onAdd={(...args) => {
            handleAddTask(...args);
            setFormOpen(false);
          }}
          defaultCol={formDefaultCol}
          onClose={() => setFormOpen(false)}
        />
      )}

      {/* ── Board ── */}
      <div className="kb-board">
        {COLUMNS.map((col) => {
          const colTasks = getColumnTasks(col.apiStatus);
          const dragClass = dragOverCol === col.id ? `drag-over-${col.id}` : '';

          return (
            <div
              key={col.id}
              className={`kb-col ${dragClass}`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col)}
            >
              {/* Column Header */}
              <div className="col-header">
                <div className="col-header-left">
                  <div className={`col-dot ${col.dotClass}`} />
                  <span className="col-title">{col.title}</span>
                  <span className={`col-count ${col.dotClass}`}>{colTasks.length}</span>
                </div>
                <button className="col-menu-icon" title="Column options" aria-label="Column options">
                  ···
                </button>
              </div>

              {/* Column Body */}
              <div className="col-body">
                {colTasks.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-state-icon">{col.emptyIcon}</span>
                    <p>{col.emptyMsg}</p>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDelete={handleDeleteTask}
                    />
                  ))
                )}
              </div>

              {/* Per-column Add Item button */}
              <button
                className="col-add-btn"
                onClick={() => openFormForCol(col.id)}
              >
                + Add item
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
