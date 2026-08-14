import React, { useState, useEffect } from 'react';
import { BookOpen, Code, Layers, Database, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import { fetchUserScores, fetchTests } from '../../services/api';

const getIconForTest = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('react')) return { icon: Layers, color: '#6366F1' };
  if (n.includes('javascript') || n.includes('js')) return { icon: Code, color: '#F59E0B' };
  if (n.includes('node')) return { icon: Play, color: '#10B981' };
  if (n.includes('mongo') || n.includes('db') || n.includes('sql')) return { icon: Database, color: '#EC4899' };
  return { icon: BookOpen, color: '#06B6D4' };
};

export default function TestDashboard({ currentUser, onSelectTest }) {
  const [tests, setTests] = useState([]);
  const [completedTests, setCompletedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch dynamic tests
        const testsRes = await fetchTests();
        setTests(testsRes.data || []);

        // Fetch completed tests
        if (currentUser && currentUser.username) {
          const scoresRes = await fetchUserScores(currentUser.username);
          if (scoresRes.data) {
            const completed = scoresRes.data.map(score => score.testName);
            setCompletedTests(completed);
          }
        }
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser]);

  return (
    <div style={{ maxWidth: '950px', margin: '2rem auto' }}>
      
      {/* Welcome Banner */}
      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Sparkles size={24} color="#6366F1" />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Welcome back, {currentUser?.name || 'Developer'}!</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px' }}>
            Select an assessment topic from the dashboard below to test your programming skills. Your score will be saved automatically to the leaderboard.
          </p>
        </div>

        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.8rem 1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Academic Year</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>{currentUser?.year || '1st Year'}</div>
        </div>
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
        Available Assessments
      </h3>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading available tests...
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--accent-rose)' }}>
          {error}
        </div>
      ) : tests.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No tests are currently available. Ask the Admin to create a test!
        </div>
      ) : (
        /* Grid List */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {tests.map((test) => {
            const { icon: IconComp, color: iconColor } = getIconForTest(test.name);
            const isCompleted = completedTests.includes(test.name);
            return (
              <div 
                key={test._id} 
                className="glass-panel" 
                style={{ 
                  padding: '1.75rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%',
                  opacity: isCompleted ? 0.75 : 1,
                  border: isCompleted ? '1px dashed rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                    <IconComp size={26} color={iconColor} />
                  </div>
                  {isCompleted ? (
                    <span className="badge badge-easy" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <CheckCircle2 size={12} /> Completed
                    </span>
                  ) : (
                    <span className={`badge badge-${(test.difficulty || 'Medium').toLowerCase()}`}>
                      {test.difficulty || 'Medium'}
                    </span>
                  )}
                </div>

                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
                  {test.name}
                </h4>
                
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', flex: 1, marginBottom: '1.5rem' }}>
                  {test.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: 'auto' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    Timed Assessment
                  </span>
                  
                  {isCompleted ? (
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', gap: '0.4rem', borderRadius: '10px', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.3)', cursor: 'not-allowed' }}
                      disabled
                    >
                      Attempted <CheckCircle2 size={12} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => onSelectTest(test.name)} 
                      className="btn btn-primary" 
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', gap: '0.4rem', borderRadius: '10px' }}
                    >
                      Start Test <Play size={12} fill="white" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
