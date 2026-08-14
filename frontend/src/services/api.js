const API_BASE = '/api';

export const loginUser = async (credentials) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Login failed');
  }
  return res.json();
};

export const registerUser = async (credentials) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Registration failed');
  }
  return res.json();
};

export const verifyAdminPasscode = async (passcode) => {
  const res = await fetch(`${API_BASE}/auth/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Invalid admin passcode');
  }
  return res.json();
};

export const fetchQuestions = async (category = 'All', difficulty = 'All') => {
  const query = new URLSearchParams();
  if (category && category !== 'All') query.append('category', category);
  if (difficulty && difficulty !== 'All') query.append('difficulty', difficulty);

  const res = await fetch(`${API_BASE}/questions?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch questions');
  return res.json();
};

export const fetchAdminQuestions = async () => {
  const res = await fetch(`${API_BASE}/questions/admin`);
  if (!res.ok) throw new Error('Failed to fetch admin questions');
  return res.json();
};

export const createQuestion = async (questionData) => {
  const res = await fetch(`${API_BASE}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(questionData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to create question');
  }
  return res.json();
};

export const updateQuestion = async (id, questionData) => {
  const res = await fetch(`${API_BASE}/questions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(questionData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to update question');
  }
  return res.json();
};

export const deleteQuestion = async (id) => {
  const res = await fetch(`${API_BASE}/questions/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete question');
  return res.json();
};

export const evaluateQuiz = async (userAnswers) => {
  const res = await fetch(`${API_BASE}/questions/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userAnswers })
  });
  if (!res.ok) throw new Error('Failed to evaluate quiz results');
  return res.json();
};

export const fetchLeaderboard = async (testName = 'All') => {
  const query = new URLSearchParams();
  if (testName && testName !== 'All') query.append('testName', testName);
  const res = await fetch(`${API_BASE}/leaderboard?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
};

export const submitScore = async (scoreData) => {
  const res = await fetch(`${API_BASE}/leaderboard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scoreData)
  });
  if (!res.ok) throw new Error('Failed to submit score');
  return res.json();
};

export const fetchUserScores = async (username) => {
  const res = await fetch(`${API_BASE}/leaderboard/user/${username}`);
  if (!res.ok) throw new Error('Failed to fetch user scores');
  return res.json();
};

export const fetchTests = async () => {
  const res = await fetch(`${API_BASE}/tests`);
  if (!res.ok) throw new Error('Failed to fetch tests list');
  return res.json();
};

export const createTest = async (testData) => {
  const res = await fetch(`${API_BASE}/tests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to create test');
  }
  return res.json();
};

export const deleteTest = async (id) => {
  const res = await fetch(`${API_BASE}/tests/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete test');
  return res.json();
};

export const fetchAdminLeaderboard = async () => {
  const res = await fetch(`${API_BASE}/leaderboard/admin`);
  if (!res.ok) throw new Error('Failed to fetch admin leaderboard');
  return res.json();
};

export const forgotPassword = async (usernameOrEmail) => {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernameOrEmail })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Verification failed');
  }
  return res.json();
};

export const fetchResetRequests = async () => {
  const res = await fetch(`${API_BASE}/auth/reset-requests`);
  if (!res.ok) throw new Error('Failed to fetch reset requests');
  return res.json();
};

export const resetPasswordAdmin = async (username, newPassword) => {
  const res = await fetch(`${API_BASE}/auth/reset-password-admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, newPassword })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Reset failed');
  }
  return res.json();
};

export const updateProfile = async (profileData) => {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to update profile');
  }
  return res.json();
};
