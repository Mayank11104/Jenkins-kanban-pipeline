const express = require('express');
const Task = require('../models/Task');

const router = express.Router();

// GET all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ order: 1, createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a new task
router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority, tag, assignee } = req.body;
    const count = await Task.countDocuments({ status: status || 'todo' });
    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'med',
      tag: tag || 'feat',
      assignee: assignee || { initials: 'ME', color: 'av-a' },
      order: count,
    });

    // Emit real-time event
    const io = req.app.get('io');
    io.emit('task:created', task);

    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update task (move between columns or update fields)
router.put('/:id', async (req, res) => {
  try {
    const { status, order, priority, tag } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status, order, priority, tag },
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Emit real-time event
    const io = req.app.get('io');
    io.emit('task:updated', task);

    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a task
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Emit real-time event
    const io = req.app.get('io');
    io.emit('task:deleted', { _id: req.params.id });

    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
