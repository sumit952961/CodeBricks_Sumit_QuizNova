import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Clock, Search, RefreshCw, BookOpen } from 'lucide-react';
import { fetchLeaderboard, fetchTests } from '../../services/api';

export default function LeaderboardView() {
  const [scores, setScores] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTest, setSelectedTest] = useState('All');
  const [error, setError] = useState('');

  const loadLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchLeaderboard(selectedTest);
      setScores(res.data || []);
    } catch (err) {
      setError('Unable to load leaderboard scores');
    } finally {
      setLoading(false);
    }
  };

  const loadTests = async () => {
    try {
      const res = await fetchTests();
      setTests(res.data || []);
    } catch (err) {
      console.error('Failed to load tests for leaderboard filter:', err);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [selectedTest]);

  useEffect(() => {
    loadTests();
  }, []);

  const filteredScores = scores.filter(item =>
    (item.fullName || item.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRankBadge = (index) => {
    if (index === 0) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#F59E0B', fontWeight: 800 }}>
          <Medal size={22} color="#F59E0B" /> #1
        </span>
      );
    }
    if (index === 1) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#94A3B8', fontWeight: 800 }}>
          <Medal size={20} color="#94A3B8" /> #2
        </span>
      );
    }
    if (index === 2) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#B45309', fontWeight: 800 }}>
          <Medal size={18} color="#B45309" /> #3
        </span>
      );
    }
    return <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>#{index + 1}</span>;
  };

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <Trophy size={28} color="#F59E0B" />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Leaderboard Hall of Fame</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Top performers ranked by highest accuracy and fastest time.
          </p>
        </div>

        <button onClick={loadLeaderboard} className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem' }}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search player name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.75rem' }}
          />
        </div>

        <div style={{ width: '220px' }}>
          <select
            className="select-field"
            value={selectedTest}
            onChange={(e) => setSelectedTest(e.target.value)}
          >
            <option value="All">All Tests</option>
            {tests.map(t => (
              <option key={t._id} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading top scores...
          </div>
        ) : error ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--accent-rose)' }}>
            {error}
          </div>
        ) : filteredScores.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No scores recorded yet for this test. Be the first to play and claim #1!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '1rem 1.5rem' }}>Rank</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Player</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Test</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Score</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Accuracy</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Time</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredScores.map((item, idx) => (
                  <tr
                    key={item._id || idx}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      background: idx === 0 ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <td style={{ padding: '1rem 1.5rem' }}>{getRankBadge(idx)}</td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'white' }}>
                      {item.fullName || item.username}
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 400 }}>
                        @{item.username}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#6366F1', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
                        {item.testName}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ fontWeight: 700 }}>{item.score}</span> / {item.totalQuestions}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span className={`badge ${item.percentage >= 80 ? 'badge-easy' : item.percentage >= 50 ? 'badge-medium' : 'badge-hard'}`}>
                        {item.percentage}%
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>
                      <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                      {item.timeTakenSeconds || 0}s
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
