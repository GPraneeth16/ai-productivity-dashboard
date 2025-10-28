const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Note = require('../models/Note');

// Get notes
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch(err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Create
router.post('/', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const note = new Note({ user: req.user.id, content });
    await note.save();
    res.json(note);
  } catch(err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update
router.put('/:id', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { content },
      { new: true }
    );
    if(!note) return res.status(404).json({ message: 'Not found' });
    res.json(note);
  } catch(err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if(!note) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch(err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
