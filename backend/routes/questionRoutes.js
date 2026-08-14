import express from 'express';
import Question from '../models/Question.js';
import { initialQuestions } from '../seed.js';

const router = express.Router();

// Memory store fallback if MongoDB is not connected
let memoryQuestions = [...initialQuestions.map((q, idx) => ({ ...q, _id: `mem_q_${idx + 1}` }))];

export const isMongoConnected = (mongooseInstance) => {
  return mongooseInstance && mongooseInstance.connection && mongooseInstance.connection.readyState === 1;
};

// GET /api/questions - Get all public questions (hides correctAnswerIndex for security)
router.get('/', async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    let questions;

    if (Question.db && Question.db.readyState === 1) {
      let query = {};
      if (category && category !== 'All') query.category = category;
      if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
      
      const dbQuestions = await Question.find(query);
      questions = dbQuestions.length > 0 ? dbQuestions : [];
    } else {
      questions = memoryQuestions.filter(q => {
        if (category && category !== 'All' && q.category !== category) return false;
        if (difficulty && difficulty !== 'All' && q.difficulty !== difficulty) return false;
        return true;
      });
    }

    // Hide correct answers in client quiz payload
    const safeQuestions = questions.map(q => {
      const obj = q.toObject ? q.toObject() : { ...q };
      delete obj.correctAnswerIndex;
      return obj;
    });

    res.json({ success: true, count: safeQuestions.length, data: safeQuestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/questions/admin - Get full questions including answer key for admin view
router.get('/admin', async (req, res) => {
  try {
    let questions;
    if (Question.db && Question.db.readyState === 1) {
      questions = await Question.find().sort({ createdAt: -1 });
    } else {
      questions = [...memoryQuestions];
    }
    res.json({ success: true, count: questions.length, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/questions - Create a new question (Admin)
router.post('/', async (req, res) => {
  try {
    const { questionText, options, correctAnswerIndex, category, difficulty, timeLimitSeconds, explanation } = req.body;

    if (!questionText || !options || options.length < 2 || correctAnswerIndex === undefined) {
      return res.status(400).json({ success: false, message: "Please provide questionText, at least 2 options, and correctAnswerIndex" });
    }

    if (Question.db && Question.db.readyState === 1) {
      const newQuestion = await Question.create({
        questionText,
        options,
        correctAnswerIndex,
        category: category || 'General',
        difficulty: difficulty || 'Medium',
        timeLimitSeconds: timeLimitSeconds || 15,
        explanation: explanation || ''
      });
      return res.status(201).json({ success: true, data: newQuestion });
    } else {
      const newMemQuestion = {
        _id: `mem_q_${Date.now()}`,
        questionText,
        options,
        correctAnswerIndex: Number(correctAnswerIndex),
        category: category || 'General',
        difficulty: difficulty || 'Medium',
        timeLimitSeconds: Number(timeLimitSeconds) || 15,
        explanation: explanation || '',
        createdAt: new Date().toISOString()
      };
      memoryQuestions.unshift(newMemQuestion);
      return res.status(201).json({ success: true, data: newMemQuestion });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/questions/:id - Update an existing question (Admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { questionText, options, correctAnswerIndex, category, difficulty, timeLimitSeconds, explanation } = req.body;

    if (Question.db && Question.db.readyState === 1) {
      const updated = await Question.findByIdAndUpdate(
        id,
        { questionText, options, correctAnswerIndex, category, difficulty, timeLimitSeconds, explanation },
        { new: true, runValidators: true }
      );
      if (!updated) return res.status(404).json({ success: false, message: "Question not found" });
      return res.json({ success: true, data: updated });
    } else {
      const idx = memoryQuestions.findIndex(q => String(q._id) === String(id));
      if (idx === -1) return res.status(404).json({ success: false, message: "Question not found" });
      
      memoryQuestions[idx] = {
        ...memoryQuestions[idx],
        questionText,
        options,
        correctAnswerIndex: Number(correctAnswerIndex),
        category: category || memoryQuestions[idx].category,
        difficulty: difficulty || memoryQuestions[idx].difficulty,
        timeLimitSeconds: Number(timeLimitSeconds) || memoryQuestions[idx].timeLimitSeconds,
        explanation: explanation !== undefined ? explanation : memoryQuestions[idx].explanation
      };
      return res.json({ success: true, data: memoryQuestions[idx] });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/questions/:id - Delete question (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (Question.db && Question.db.readyState === 1) {
      const deleted = await Question.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, message: "Question not found" });
      return res.json({ success: true, message: "Question deleted successfully" });
    } else {
      const initialLength = memoryQuestions.length;
      memoryQuestions = memoryQuestions.filter(q => String(q._id) !== String(id));
      if (memoryQuestions.length === initialLength) {
        return res.status(404).json({ success: false, message: "Question not found" });
      }
      return res.json({ success: true, message: "Question deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/questions/evaluate - Verify user answers securely on backend
router.post('/evaluate', async (req, res) => {
  try {
    const { userAnswers } = req.body; // Array of { questionId, selectedIndex, timeTaken }
    if (!Array.isArray(userAnswers)) {
      return res.status(400).json({ success: false, message: "Invalid payload format" });
    }

    let allQuestions;
    if (Question.db && Question.db.readyState === 1) {
      allQuestions = await Question.find();
    } else {
      allQuestions = [...memoryQuestions];
    }

    const questionMap = new Map(allQuestions.map(q => [String(q._id), q]));

    let correctCount = 0;
    let details = [];

    userAnswers.forEach(ans => {
      const q = questionMap.get(String(ans.questionId));
      if (q) {
        const isCorrect = ans.selectedIndex === q.correctAnswerIndex;
        if (isCorrect) correctCount++;
        details.push({
          questionId: q._id,
          questionText: q.questionText,
          options: q.options,
          userSelectedIndex: ans.selectedIndex,
          correctAnswerIndex: q.correctAnswerIndex,
          isCorrect,
          explanation: q.explanation || ''
        });
      }
    });

    const totalQuestions = userAnswers.length;
    const percentage = Math.round((correctCount / (totalQuestions || 1)) * 100);

    res.json({
      success: true,
      score: correctCount,
      totalQuestions,
      percentage,
      details
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
