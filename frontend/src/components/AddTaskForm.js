import React, { useState } from 'react';

const ASSIGNEES = [
  { initials: 'AK', color: 'av-a' },
  { initials: 'BL', color: 'av-d' },
  { initials: 'CW', color: 'av-c' },
  { initials: 'DM', color: 'av-b' },
];

const TAG_BY_PRIORITY = { high: 'bug', med: 'feat', low: 'infra' };
const STATUS_MAP = { todo: 'todo', progress: 'in-progress', done: 'done' };

function AddTaskForm({ onAdd, onClose, defaultCol }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [column, setColumn] = useState(defaultCol || 'todo');
  const [priority, setPriority] = useState('med');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const assignee = ASSIGNEES[Math.floor(Math.random() * ASSIGNEES.length)];
    const tag = TAG_BY_PRIORITY[priority] || 'feat';
    onAdd(title.trim(), description.trim(), STATUS_MAP[column], priority, tag, assignee);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="add-form-wrap">
      <div className="add-form-inner">
        <form onSubmit={handleSubmit}>
          <div className="add-form-row">
            <div className="form-col form-col-2">
              <label className="form-label">Task title</label>
              <input
                className="form-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                autoFocus
                maxLength={100}
              />
            </div>
            <div className="form-col">
              <label className="form-label">Column</label>
              <select
                className="form-select"
                value={column}
                onChange={(e) => setColumn(e.target.value)}
              >
                <option value="todo">To Do</option>
                <option value="progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="form-col">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="high">High</option>
                <option value="med">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="add-form-row">
            <div className="form-col">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional details…"
                maxLength={500}
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={!title.trim()}>
              Create Task
            </button>
            <button type="button" className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTaskForm;
