import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw, Award, Clock, CheckCircle, XCircle, ArrowRight, Save } from 'lucide-react';
import { submitScore } from '../../services/api';

export default function QuizResult({ resultData, playerInfo, onRestartQuiz, onViewLeaderboard }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const { score, totalQuestions, percentage, details } = resultData;
  const totalTimeTaken = playerInfo?.userAnswers?.reduce((acc, a) => acc + (a.timeTaken || 0), 0) || 30;

  useEffect(() => {
    // Fire confetti for high score!
    if (percentage >= 70) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // Auto save score to leaderboard
    handleSaveScore();
  }, []);

  const handleSaveScore = async () => {
    if (saved || saving) return;
    setSaving(true);
    try {
      await submitScore({
        username: playerInfo.username,
        fullName: playerInfo.fullName,
        score,
        totalQuestions,
        percentage,
        timeTakenSeconds: totalTimeTaken,
        testName: playerInfo.testName || 'General'
      });
      setSaved(true);
    } catch (err) {
      setSaveError('Could not save to leaderboard automatically');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
      {/* Result Hero Card */}
      <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div 
          style={{ 
            display: 'inline-flex',
            padding: '1.25rem',
            borderRadius: '50%',
            background: percentage >= 70 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            border: percentage >= 70 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
            marginBottom: '1rem'
          }}
        >
          <Trophy size={48} color={percentage >= 70 ? '#10B981' : '#F59E0B'} />
        </div>

        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          {percentage >= 80 ? 'Outstanding Performance!' : percentage >= 60 ? 'Great Job!' : 'Keep Practicing!'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '2rem' }}>
          Here is your quiz summary, <strong style={{ color: 'white' }}>{playerInfo.username}</strong>
        </p>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <Award size={24} color="#6366F1" style={{ marginBottom: '0.4rem' }} />
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>{score} / {totalQuestions}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Score</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: percentage >= 70 ? '#10B981' : '#F59E0B', marginBottom: '0.2rem' }}>
              {percentage}%
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Accuracy</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <Clock size={24} color="#06B6D4" style={{ marginBottom: '0.4rem' }} />
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>{totalTimeTaken}s</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Time</div>
          </div>
        </div>

        {/* Leaderboard Status */}
        {saved && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            <CheckCircle size={16} /> Score saved to Leaderboard!
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={onRestartQuiz} className="btn btn-secondary">
            <RefreshCw size={18} />
            Try Again
          </button>
          <button onClick={onViewLeaderboard} className="btn btn-primary">
            <Trophy size={18} />
            View Leaderboard
          </button>
        </div>
      </div>

      {/* Answer Review Section */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Detailed Breakdown
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {details.map((item, idx) => (
            <div 
              key={idx}
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: item.isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.05)',
                border: item.isCorrect ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(244, 63, 94, 0.2)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  {idx + 1}. {item.questionText}
                </span>
                {item.isCorrect ? (
                  <span className="badge badge-easy" style={{ flexShrink: 0 }}>
                    <CheckCircle size={14} /> Correct
                  </span>
                ) : (
                  <span className="badge badge-hard" style={{ flexShrink: 0 }}>
                    <XCircle size={14} /> Incorrect
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-muted)' }}>
                <div>
                  Your choice: {' '}
                  <span style={{ color: item.isCorrect ? '#10B981' : '#F43F5E', fontWeight: 600 }}>
                    {item.userSelectedIndex >= 0 ? item.options[item.userSelectedIndex] : 'Time Expired / No Selection'}
                  </span>
                </div>
                {!item.isCorrect && (
                  <div>
                    Correct answer: {' '}
                    <span style={{ color: '#10B981', fontWeight: 600 }}>
                      {item.options[item.correctAnswerIndex]}
                    </span>
                  </div>
                )}
                {item.explanation && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', background: 'rgba(0, 0, 0, 0.2)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #6366F1' }}>
                    💡 <strong>Explanation:</strong> {item.explanation}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
