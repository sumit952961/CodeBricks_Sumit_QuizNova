import React from 'react';
import { Brain, Trophy, ShieldCheck, PlayCircle, LogOut, User } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentUser, onLogout }) {
  return (
    <nav className="glass-panel navbar" style={{ flexWrap: 'wrap', gap: '1rem' }}>
      <a href="#" className="brand-logo" onClick={(e) => { e.preventDefault(); if (currentUser) setActiveTab('quiz'); }}>
        <img src="/logo.png" alt="Logo" className="animate-float" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
        <span>QuizNova <span style={{ fontSize: '0.7rem', verticalAlign: 'super', color: '#06B6D4', fontWeight: 600 }}>MERN</span></span>
      </a>

      {currentUser && (
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {currentUser.role !== 'admin' && (
            <>
              <button
                className={`nav-item ${activeTab === 'quiz' ? 'active' : ''}`}
                onClick={() => setActiveTab('quiz')}
              >
                <PlayCircle size={18} />
                <span>Play Quiz</span>
              </button>

              <button
                className={`nav-item ${activeTab === 'leaderboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('leaderboard')}
              >
                <Trophy size={18} />
                <span>Leaderboard</span>
              </button>
            </>
          )}

          {currentUser.role === 'admin' && (
            <button
              className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              <ShieldCheck size={18} />
              <span>Admin Portal</span>
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              {currentUser?.profilePhoto ? (
                <img src={currentUser.profilePhoto} alt="Avatar" style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--primary)' }} />
              ) : (
                <User size={15} color="#06B6D4" />
              )}
              {currentUser.name || currentUser}
            </span>
            <button
              onClick={onLogout}
              title="Log Out"
              style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                color: '#F43F5E',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)'}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
