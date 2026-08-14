import express from 'express';
import Test from '../models/Test.js';
import Question from '../models/Question.js';
import Score from '../models/Score.js';
import { deleteMemoryScoresForTest } from './leaderboardRoutes.js';

const router = express.Router();

export const initialTests = [
  {
    name: 'Web Dev',
    description: 'Test your understanding of basic web technologies including HTML, CSS, and modern web standards.',
    difficulty: 'Easy'
  },
  {
    name: 'JavaScript',
    description: 'Assess your skills in scoping, arrays, asynchronous programming, closures, ES6+, and OOP.',
    difficulty: 'Medium'
  },
  {
    name: 'React',
    description: 'Verify your core React capabilities in state, hooks (useState, useEffect), props, context, and optimization.',
    difficulty: 'Medium'
  },
  {
    name: 'Node.js',
    description: 'Evaluate your expertise in backend runtimes, Event Loop, file system, streams, and Express APIs.',
    difficulty: 'Hard'
  },
  {
    name: 'MongoDB',
    description: 'Test your grasp on document design, basic querying, operators, Mongoose schemas, and indexes.',
    difficulty: 'Medium'
  }
];

// Fallback memory tests store
let memoryTests = [...initialTests.map((t, idx) => ({ ...t, _id: `mem_t_${idx + 1}` }))];

// GET /api/tests - Retrieve all tests
router.get('/', async (req, res) => {
  try {
    let tests;
    if (Test.db && Test.db.readyState === 1) {
      tests = await Test.find();
    } else {
      tests = [...memoryTests];
    }
    res.json({ success: true, count: tests.length, data: tests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/tests - Create a new test (Admin)
router.post('/', async (req, res) => {
  try {
    const { name, description, difficulty } = req.body;

    if (!name || !description) {
      return res.status(400).json({ success: false, message: "Please provide test name and description." });
    }

    const cleanName = name.trim();

    if (Test.db && Test.db.readyState === 1) {
      const existing = await Test.findOne({ name: cleanName });
      if (existing) {
        return res.status(400).json({ success: false, message: "Test with this name already exists." });
      }
      const newTest = await Test.create({ name: cleanName, description, difficulty: difficulty || 'Medium' });
      return res.status(201).json({ success: true, data: newTest });
    } else {
      const existing = memoryTests.find(t => t.name.toLowerCase() === cleanName.toLowerCase());
      if (existing) {
        return res.status(400).json({ success: false, message: "Test with this name already exists." });
      }
      const newTest = {
        _id: `mem_t_${Date.now()}`,
        name: cleanName,
        description,
        difficulty: difficulty || 'Medium',
        createdAt: new Date().toISOString()
      };
      memoryTests.push(newTest);
      return res.status(201).json({ success: true, data: newTest });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/tests/:id - Delete test and associated questions and scores (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (Test.db && Test.db.readyState === 1) {
      const test = await Test.findById(id);
      if (!test) return res.status(404).json({ success: false, message: "Test not found." });
      
      // Delete associated questions and scores
      await Question.deleteMany({ category: test.name });
      await Score.deleteMany({ testName: test.name });
      await Test.findByIdAndDelete(id);
      return res.json({ success: true, message: "Test and all associated records deleted successfully." });
    } else {
      const idx = memoryTests.findIndex(t => String(t._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Test not found." });
      
      const testName = memoryTests[idx].name;
      // In-Memory deletion of test and scores
      deleteMemoryScoresForTest(testName);
      memoryTests = memoryTests.filter(t => String(t._id) !== String(id));
      return res.json({ success: true, message: "Test and all associated records deleted successfully." });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
