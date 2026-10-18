const express = require('express');
const router = express.Router();
const QuestionBank = require('../models/QuestionBank');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/questions - List question bank
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    const filter = { user: req.userId };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty;
    }

    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { answerKey: { $regex: search, $options: 'i' } }
      ];
    }

    const questions = await QuestionBank.find(filter).sort({ updatedAt: -1 });
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Error fetching question bank', error: error.message });
  }
});

// POST /api/questions
router.post('/', async (req, res) => {
  try {
    const { question, company, role, category, difficulty, answerKey, keyTakeaways } = req.body;
    if (!question) {
      return res.status(400).json({ message: 'Question content is required' });
    }

    const item = new QuestionBank({
      user: req.userId,
      question,
      company: company || 'General',
      role: role || 'Software Engineer',
      category: category || 'Technical',
      difficulty: difficulty || 'Medium',
      answerKey: answerKey || '',
      keyTakeaways: Array.isArray(keyTakeaways) ? keyTakeaways : (keyTakeaways ? keyTakeaways.split('\n') : [])
    });

    await item.save();
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ message: 'Error creating question', error: error.message });
  }
});

// PUT /api/questions/:id
router.put('/:id', async (req, res) => {
  try {
    const item = await QuestionBank.findOne({ _id: req.params.id, user: req.userId });
    if (!item) {
      return res.status(404).json({ message: 'Question not found' });
    }

    Object.assign(item, req.body);
    await item.save();
    res.json(item);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Error updating question', error: error.message });
  }
});

// POST /api/questions/:id/practice
router.post('/:id/practice', async (req, res) => {
  try {
    const item = await QuestionBank.findOne({ _id: req.params.id, user: req.userId });
    if (!item) {
      return res.status(404).json({ message: 'Question not found' });
    }

    item.timesPracticed = (item.timesPracticed || 0) + 1;
    item.lastPracticedDate = new Date();
    await item.save();

    res.json(item);
  } catch (error) {
    console.error('Error recording practice:', error);
    res.status(500).json({ message: 'Error recording practice', error: error.message });
  }
});

// DELETE /api/questions/:id
router.delete('/:id', async (req, res) => {
  try {
    const item = await QuestionBank.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!item) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json({ message: 'Question deleted' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Error deleting question', error: error.message });
  }
});

module.exports = router;
