const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['high', 'med', 'low'],
      default: 'med',
    },
    tag: {
      type: String,
      enum: ['feat', 'bug', 'design', 'infra', 'review'],
      default: 'feat',
    },
    assignee: {
      initials: { type: String, default: 'ME' },
      color: { type: String, default: 'av-a' },
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
