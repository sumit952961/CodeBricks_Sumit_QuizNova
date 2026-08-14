import express from 'express';
import Score from '../models/Score.js';
import { initialScores } from '../seed.js';

const router = express.Router();

// Fallback memory leaderboard
export let memoryScores = [];

export const deleteMemoryScoresForTest = (testName) => {
  // Clear array elements in-place to preserve reference
  const filtered = memoryScores.filter(s => s.testName !== testName);
  memoryScores.splice(0, memoryScores.length, ...filtered);
};

// GET /api/leaderboard - Retrieve top scores
router.get('/', async (req, res) => {
  try {
    const { testName } = req.query;
    let scores;

    let query = {};
    if (testName && testName !== 'All') {
      query.testName = testName;
    }

    if (Score.db && Score.db.readyState === 1) {
      // Aggregate pipeline: Match -> Sort by score desc/time asc -> Group by username + testName -> Keep best record -> Sort & Limit
      scores = await Score.aggregate([
        { $match: query },
        { $sort: { percentage: -1, timeTakenSeconds: 1 } },
        {
          $group: {
            _id: { username: "$username", testName: "$testName" },
            bestScore: { $first: "$$ROOT" }
          }
        },
        { $replaceRoot: { newRoot: "$bestScore" } },
        { $sort: { percentage: -1, timeTakenSeconds: 1 } },
        { $limit: 25 }
      ]);
    } else {
      // In-Memory grouping logic by username + testName
      const grouped = {};
      memoryScores
        .filter(s => !testName || testName === 'All' || s.testName === testName)
        .sort((a, b) => {
          if (b.percentage !== a.percentage) return b.percentage - a.percentage;
          return a.timeTakenSeconds - b.timeTakenSeconds;
        })
        .forEach(s => {
          const key = `${s.username}_${s.testName}`;
          if (!grouped[key]) {
            grouped[key] = s;
          }
        });
      
      scores = Object.values(grouped)
        .sort((a, b) => {
          if (b.percentage !== a.percentage) return b.percentage - a.percentage;
          return a.timeTakenSeconds - b.timeTakenSeconds;
        })
        .slice(0, 25);
    }

    res.json({ success: true, count: scores.length, data: scores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/leaderboard - Save score entry
router.post('/', async (req, res) => {
  try {
    const { username, fullName, score, totalQuestions, percentage, timeTakenSeconds, testName } = req.body;

    if (!username || !fullName || score === undefined || !totalQuestions) {
      return res.status(400).json({ success: false, message: "Username, fullName, score, and totalQuestions are required" });
    }

    const calcPercentage = percentage !== undefined ? percentage : Math.round((score / totalQuestions) * 100);

    if (Score.db && Score.db.readyState === 1) {
      const newScore = await Score.create({
        username: username.trim(),
        fullName: fullName.trim(),
        score,
        totalQuestions,
        percentage: calcPercentage,
        timeTakenSeconds: timeTakenSeconds || 0,
        testName: testName || 'General'
      });
      return res.status(201).json({ success: true, data: newScore });
    } else {
      const newMemScore = {
        _id: `mem_score_${Date.now()}`,
        username: username.trim(),
        fullName: fullName.trim(),
        score,
        totalQuestions,
        percentage: calcPercentage,
        timeTakenSeconds: timeTakenSeconds || 0,
        testName: testName || 'General',
        createdAt: new Date().toISOString()
      };
      memoryScores.push(newMemScore);
      return res.status(201).json({ success: true, data: newMemScore });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/leaderboard/admin - Retrieve all scores (without deduplication) sorted for admin tracking
router.get('/admin', async (req, res) => {
  try {
    let scores;
    if (Score.db && Score.db.readyState === 1) {
      scores = await Score.find().sort({ percentage: -1, timeTakenSeconds: 1 });
    } else {
      scores = [...memoryScores].sort((a, b) => {
        if (b.percentage !== a.percentage) return b.percentage - a.percentage;
        return a.timeTakenSeconds - b.timeTakenSeconds;
      });
    }
    res.json({ success: true, count: scores.length, data: scores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/leaderboard/user/:username - Retrieve scores for a specific user
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    let scores;

    if (Score.db && Score.db.readyState === 1) {
      scores = await Score.find({ username });
    } else {
      scores = memoryScores.filter(s => s.username === username);
    }

    res.json({ success: true, count: scores.length, data: scores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
