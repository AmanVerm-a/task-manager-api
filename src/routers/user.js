const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth');
const User = require('../models/user');

router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();

    const token = await user.genAuthToken();

    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e.message);
  }
})

router.post('/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.genAuthToken();

    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e.message);
  }
})

router.post('/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
    await req.user.save();

    res.send('Logged out.');
  } catch (e) {
    res.status(500).send('Error: ' + e);
  }
})

router.post('/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send('Logged out of all devices');
  } catch (e) {
    res.status(500).send('Error: ' + e);
  }
})

router.get('/me', auth, async (req, res) => {
  res.send(req.user);
})

router.patch('/me', auth, async (req, res) => {
  const user = req.user;
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'age', 'email', 'password'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) return res.status(400).send({ Error: 'Invalid updates!', UpdatesAllowed: allowedUpdates });

  try {

    updates.forEach(update => user[update] = req.body[update]);
    await user.save();

    res.send(user);
  } catch (e) {
    res.status(500).send('Error: ' + e);
  }
})

router.delete('/me', auth, async (req, res) => {
  try {
    await req.user.deleteOne();
    res.send(req.user);
  } catch (e) {
    res.status(500).send('Error: ' + e);
  }
})

module.exports = router;