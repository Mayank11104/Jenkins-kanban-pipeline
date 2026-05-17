import React from 'react';

function TaskCard({ task, onDragStart, onDragEnd, onDelete }) {
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const priority = task.priority || 'med';
  const tag = task.tag || 'feat';
  const assignee = task.assignee || { initials: 'ME', color: 'av-a' };

  // Show a progress bar for in-progress tasks (stored or derived)
  const showProgress = task.status === 'in-progress' && task.progress != null;
  const progressVal = task.progress;

  return (
    <div
      className="task-card"
      draggable
      onDragStart={(e) => onDragStart(e, task._id)}
      onDragEnd={onDragEnd}
    >
      {/* Top row: title + delete */}
      <div className="card-top">
        <div className="card-title">{task.title}</div>
        <button
          className="card-delete"
          onClick={() => onDelete(task._id)}
          title="Delete task"
          aria-label="Delete task"
        >
          ×
        </button>
      </div>

      {/* Description */}
      {task.description && (
        <div className="card-desc">{task.description}</div>
      )}

      {/* Progress bar (in-progress only) */}
      {showProgress && (
        <div className="progress-bar-wrap">
          <div className="progress-bar" style={{ width: `${progressVal}%` }} />
        </div>
      )}

      {/* Footer: meta + avatar */}
      <div className="card-footer">
        <div className="card-meta">
          <div className={`card-priority prio-${priority}`} title={`Priority: ${priority}`} />
          <span className={`card-tag tag-${tag}`}>{tag}</span>
          <span className="card-time">⏱ {timeAgo(task.createdAt)}</span>
        </div>
        <div className={`card-avatar ${assignee.color}`}>
          {assignee.initials}
        </div>
      </div>
    </div>
  );
}

export default TaskCard;
