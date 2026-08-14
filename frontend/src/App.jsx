import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthScreen from './components/Auth/AuthScreen';
import TestDashboard from './components/Dashboard/TestDashboard';
import QuizScreen from './components/Quiz/QuizScreen';
import QuizResult from './components/Quiz/QuizResult';
import LeaderboardView from './components/Leaderboard/LeaderboardView';
import AdminView from './components/Admin/AdminView';
import { fetchQuestions, evaluateQuiz } from './services/api';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('quiz_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const stored = localStorage.getItem('quiz_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.role === 'admin') return 'admin';
      }
    } catch {}
    return 'quiz';
  });
  const [quizState, setQuizState] = useState('setup'); // 'setup' | 'active' | 'result'
  
  const [playerInfo, setPlayerInfo] = useState({ username: '', fullName: '', testName: '', category: 'All', difficulty: 'All' });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quizResult, setQuizResult] = useState(null);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (tabName === 'quiz') {
      setQuizState('setup');
      setQuizResult(null);
      setQuestions([]);
    }
  };

  const handleAuthSuccess = (userData) => {
    localStorage.setItem('quiz_user', JSON.stringify(userData));
    setCurrentUser(userData);
    setQuizState('setup');
    if (userData.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('quiz');
    }
  };

  const handleProfileUpdated = (updatedData) => {
    localStorage.setItem('quiz_user', JSON.stringify(updatedData));
    setCurrentUser(updatedData);
  };

  const handleLogout = () => {
    localStorage.removeItem('quiz_user');
    setCurrentUser(null);
    setQuestions([]);
    setQuizResult(null);
    setQuizState('setup');
  };

  const handleSelectTest = async (categoryName) => {
    setLoading(true);
    setError('');
    const config = {
      username: currentUser.username,
      fullName: currentUser.name,
      testName: categoryName,
      category: categoryName,
      difficulty: 'All'
    };
    setPlayerInfo(config);

    try {
      const res = await fetchQuestions(categoryName, 'All');
      if (!res.data || res.data.length === 0) {
        setError('No questions found for the selected test.');
        setLoading(false);
        return;
      }
      setQuestions(res.data);
      setQuizState('active');
    } catch (err) {
      setError('Unable to load quiz questions from backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteQuiz = async (userAnswers) => {
    setLoading(true);
    try {
      const res = await evaluateQuiz(userAnswers);
      setQuizResult(res);
      setPlayerInfo(prev => ({ ...prev, userAnswers }));
      setQuizState('result');
    } catch (err) {
      setError('Failed to evaluate quiz results.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestartQuiz = () => {
    setQuizState('setup');
    setQuizResult(null);
  };

  if (showSplash) {
    return (
      <div className="splash-overlay">
        <div className="splash-orb"></div>
        <div className="splash-content">
          <img src="/logo.png" alt="Logo" className="animate-float" style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '1rem', border: '3px solid var(--accent-cyan)', boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)', objectFit: 'cover' }} />
          <h1 className="splash-logo">QuizNova Hub</h1>
          <p className="splash-text">Initializing Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout animate-fade-in">
      <div className="container">
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
          currentUser={currentUser} 
          onLogout={handleLogout} 
        />

        <main style={{ paddingBottom: '3rem' }}>
          {!currentUser ? (
            <AuthScreen onAuthSuccess={handleAuthSuccess} />
          ) : (
            <>
              {activeTab === 'quiz' && (
                <>
                  {loading && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                      <div className="animate-float" style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
                      Loading quiz questions from server...
                    </div>
                  )}

                  {error && !loading && (
                    <div className="glass-panel" style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', textAlign: 'center' }}>
                      <div style={{ color: '#F43F5E', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>{error}</div>
                      <button onClick={() => setError('')} className="btn btn-secondary">Try Again</button>
                    </div>
                  )}

                  {!loading && !error && quizState === 'setup' && (
                    <TestDashboard currentUser={currentUser} onSelectTest={handleSelectTest} onProfileUpdated={handleProfileUpdated} />
                  )}

                  {!loading && !error && quizState === 'active' && questions.length > 0 && (
                    <QuizScreen
                      questions={questions}
                      onCompleteQuiz={handleCompleteQuiz}
                      playerInfo={playerInfo}
                    />
                  )}

                  {!loading && !error && quizState === 'result' && quizResult && (
                    <QuizResult
                      resultData={quizResult}
                      playerInfo={playerInfo}
                      onRestartQuiz={handleRestartQuiz}
                      onViewLeaderboard={() => setActiveTab('leaderboard')}
                    />
                  )}
                </>
              )}

              {activeTab === 'leaderboard' && <LeaderboardView />}

              {activeTab === 'admin' && <AdminView />}
            </>
          )}
        </main>

        <footer style={{ textAlign: 'center', padding: '1.5rem 1rem', borderTop: '1px solid var(--border-color)', marginTop: '3rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          © 2026 QuizNova. All Rights Reserved.
        </footer>
      </div>
    </div>
  );
}
