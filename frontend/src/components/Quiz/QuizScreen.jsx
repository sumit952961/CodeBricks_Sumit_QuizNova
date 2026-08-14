import React, { useState, useEffect } from 'react';
import { Clock, ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react';

export default function QuizScreen({ questions, onCompleteQuiz, playerInfo }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]); // [{ questionId, selectedIndex, timeTaken }]
  
  const currentQuestion = questions[currentIndex];
  const timeLimit = currentQuestion?.timeLimitSeconds || 15;
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [startTime, setStartTime] = useState(Date.now());

  // Reset timer on question change
  useEffect(() => {
    setTimeLeft(currentQuestion?.timeLimitSeconds || 15);
    setStartTime(Date.now());
    setSelectedOption(null);
  }, [currentIndex, currentQuestion]);

  // Countdown effect
  useEffect(() => {
    if (timeLeft <= 0) {
      handleNextQuestion(true); // Auto submit current choice or null if time expired
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleNextQuestion = (isTimeExpired = false) => {
    const timeSpent = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const answerEntry = {
      questionId: currentQuestion._id,
      selectedIndex: isTimeExpired && selectedOption === null ? -1 : selectedOption,
      timeTaken: timeSpent
    };

    const updatedAnswers = [...userAnswers, answerEntry];
    setUserAnswers(updatedAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onCompleteQuiz(updatedAnswers);
    }
  };

  const progressPercentage = Math.round(((currentIndex + 1) / questions.length) * 100);
  const strokeDashoffset = 283 - (283 * timeLeft) / timeLimit;
  const isUrgent = timeLeft <= 5;

  return (
    <div style={{ maxWidth: '750px', margin: '2rem auto' }}>
      {/* Quiz Header Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem 2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className={`badge badge-${(currentQuestion.difficulty || 'medium').toLowerCase()}`}>
              {currentQuestion.difficulty || 'Medium'}
            </span>
            <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366F1', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              {currentQuestion.category || 'General'}
            </span>
          </div>
          <div style={{ width: '200px', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '10px', overflow: 'hidden', marginTop: '0.4rem' }}>
            <div style={{ width: `${progressPercentage}%`, height: '100%', background: 'linear-gradient(90deg, #6366F1, #06B6D4)', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>

        {/* Circular Countdown Timer */}
        <div style={{ position: 'relative', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="64" height="64" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
            <circle cx="50" cy="50" r="45" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="8" fill="none" />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke={isUrgent ? '#F43F5E' : '#06B6D4'}
              strokeWidth="8"
              fill="none"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
            />
          </svg>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: isUrgent ? '#F43F5E' : 'white' }}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '2rem', lineHeight: '1.5' }}>
          {currentQuestion.questionText}
        </h3>

        {/* Multiple Choice Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          {currentQuestion.options.map((optText, index) => {
            const isSelected = selectedOption === index;
            return (
              <button
                key={index}
                onClick={() => setSelectedOption(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.1rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '2px solid #6366F1' : '1px solid var(--border-color)',
                  boxShadow: isSelected ? '0 0 20px rgba(99, 102, 241, 0.3)' : 'none',
                  color: isSelected ? '#ffffff' : 'var(--text-main)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontSize: '1rem',
                  fontWeight: isSelected ? 600 : 400
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isSelected ? '#6366F1' : 'rgba(255, 255, 255, 0.08)',
                    border: isSelected ? 'none' : '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    flexShrink: 0
                  }}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <span style={{ flex: 1 }}>{optText}</span>
                {isSelected && <CheckCircle2 size={20} color="#6366F1" />}
              </button>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            Player: <strong style={{ color: 'white' }}>{playerInfo?.username || 'Guest'}</strong>
          </span>

          <button
            onClick={() => handleNextQuestion(false)}
            className="btn btn-primary"
            disabled={selectedOption === null}
            style={{ padding: '0.8rem 1.75rem' }}
          >
            <span>{currentIndex + 1 === questions.length ? 'Submit Quiz' : 'Next Question'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
