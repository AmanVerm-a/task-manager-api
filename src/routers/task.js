const express = require('express');
const router = new express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      owner: req.user._id
    });
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e.message);
  }
})

// GET tasks?completed=true
// GET tasks?limit=10&skip=0
// GET tasks?sortBy=createdAt:desc
router.get('/', auth, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) match.completed = req.query.completed === 'true'

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }

  try {
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
      }
    })

    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send('Error: ' + e);
  }
})

router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    if (!task) return res.status(404).send('Not found...');
    res.send(task);
  } catch (e) {
    res.status(500).send('Error: ' + e);
  }
})

router.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['description', 'completed'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) return res.status(400).send({ Error: 'Invalid updates!', UpdatesAllowed: allowedUpdates });

  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
    if (!task) return res.status(404).send('Task not found...');

    updates.forEach(update => task[update] = req.body[update]);
    await task.save();

    res.send(task);
  } catch (e) {
    res.status(500).send('Error: ' + e);
  }
})

router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!task) return res.status(404).send('Task not found...');
    res.send(task);
  } catch (e) {
    res.status(500).send('Error: ' + e);
  }
})

module.exports = router;