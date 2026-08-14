import React, { useState } from 'react';
import { Play, User, Sparkles, Clock, Target, Award } from 'lucide-react';

export default function QuizSetup({ onStartQuiz, currentUser }) {
  const [username, setUsername] = useState(currentUser || '');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalName = username.trim() || currentUser;
    if (!finalName) {
      setError('Please enter your name to start the quiz');
      return;
    }
    setError('');
    onStartQuiz({ username: finalName, category, difficulty });
  };

  return (
    <div style={{ maxWidth: '650px', margin: '2rem auto' }}>
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div 
            style={{ 
              display: 'inline-flex',
              padding: '1rem',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              marginBottom: '1rem'
            }}
          >
            <Sparkles size={36} color="#6366F1" />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Ready to Test Your Knowledge?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Answer questions against the clock and climb the global MERN leaderboard!
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <User size={16} style={{ verticalAlign: 'middle', marginRight: '0.4rem', color: '#6366F1' }} />
              Player Name
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Alex Dev"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={25}
              readOnly={!!currentUser}
              style={{ background: currentUser ? 'rgba(255,255,255,0.03)' : undefined, cursor: currentUser ? 'not-allowed' : undefined }}
            />
            {error && <p style={{ color: 'var(--accent-rose)', fontSize: '0.85rem', marginTop: '0.4rem' }}>{error}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Category
              </label>
              <select
                className="select-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Web Dev">Web Dev</option>
                <option value="React">React</option>
                <option value="JavaScript">JavaScript</option>
                <option value="Node.js">Node.js</option>
                <option value="MongoDB">MongoDB</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Difficulty
              </label>
              <select
                className="select-field"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div 
            style={{ 
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              border: '1px solid var(--border-color)',
              margin: '0.5rem 0'
            }}
          >
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quiz Highlights
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <Clock size={20} color="#06B6D4" style={{ marginBottom: '0.25rem' }} />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Timed Questions</div>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <Target size={20} color="#8B5CF6" style={{ marginBottom: '0.25rem' }} />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Score Tracking</div>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <Award size={20} color="#F59E0B" style={{ marginBottom: '0.25rem' }} />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Live Ranks</div>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
            <Play size={22} fill="white" />
            Start Timed Quiz Now
          </button>
        </form>
      </div>
    </div>
  );
}
