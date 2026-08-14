import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, HelpCircle } from 'lucide-react';

export default function QuestionFormModal({ initialData, onClose, onSubmit, defaultCategory }) {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [category, setCategory] = useState(defaultCategory || 'Web Dev');
  const [difficulty, setDifficulty] = useState('Medium');
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(15);
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');
  const [questionType, setQuestionType] = useState('mcq'); // 'mcq' | 'boolean'

  useEffect(() => {
    if (initialData) {
      setQuestionText(initialData.questionText || '');
      setOptions(initialData.options && initialData.options.length >= 2 ? initialData.options : ['', '', '', '']);
      setCorrectAnswerIndex(initialData.correctAnswerIndex ?? 0);
      setCategory(initialData.category || 'Web Dev');
      setDifficulty(initialData.difficulty || 'Medium');
      setTimeLimitSeconds(initialData.timeLimitSeconds || 15);
      setExplanation(initialData.explanation || '');

      const isBool = initialData.options && initialData.options.length === 2 && initialData.options[0] === 'True' && initialData.options[1] === 'False';
      setQuestionType(isBool ? 'boolean' : 'mcq');
    } else if (defaultCategory) {
      setCategory(defaultCategory);
    }
  }, [initialData, defaultCategory]);

  const handleTypeChange = (type) => {
    setQuestionType(type);
    if (type === 'boolean') {
      setOptions(['True', 'False']);
      if (correctAnswerIndex > 1) {
        setCorrectAnswerIndex(0);
      }
    } else {
      setOptions(['', '', '', '']);
    }
  };

  const handleOptionChange = (idx, value) => {
    const updated = [...options];
    updated[idx] = value;
    setOptions(updated);
  };

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (idx) => {
    if (options.length > 2) {
      const updated = options.filter((_, i) => i !== idx);
      setOptions(updated);
      if (correctAnswerIndex >= updated.length) {
        setCorrectAnswerIndex(updated.length - 1);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setError('Please enter the question text.');
      return;
    }
    const filledOptions = options.map(o => o.trim()).filter(Boolean);
    if (filledOptions.length < 2) {
      setError('Please provide at least 2 non-empty options.');
      return;
    }

    setError('');
    onSubmit({
      questionText: questionText.trim(),
      options: filledOptions,
      correctAnswerIndex: Number(correctAnswerIndex),
      category,
      difficulty,
      timeLimitSeconds: Number(timeLimitSeconds) || 15,
      explanation: explanation.trim()
    });
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>
            {initialData ? 'Edit Quiz Question' : 'Add New Quiz Question'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(244, 63, 94, 0.15)', color: '#F43F5E', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>
              Question Type
            </label>
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', color: 'white', fontWeight: 600 }}>
                <input
                  type="radio"
                  name="questionType"
                  value="mcq"
                  checked={questionType === 'mcq'}
                  onChange={() => handleTypeChange('mcq')}
                  style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
                Multiple Choice (MCQ)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', color: 'white', fontWeight: 600 }}>
                <input
                  type="radio"
                  name="questionType"
                  value="boolean"
                  checked={questionType === 'boolean'}
                  onChange={() => handleTypeChange('boolean')}
                  style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
                True / False
              </label>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>
              Question Text
            </label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="e.g. What is the difference between state and props in React?"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
          </div>

          {/* Options list */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Options & Correct Answer</label>
              {questionType === 'mcq' && options.length < 6 && (
                <button type="button" onClick={handleAddOption} className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>
                  <Plus size={14} /> Add Option
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {options.map((opt, idx) => {
                const isCorrect = correctAnswerIndex === idx;
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setCorrectAnswerIndex(idx)}
                      title={isCorrect ? 'Correct Answer' : 'Mark as Correct Answer'}
                      style={{
                        background: isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: isCorrect ? '2px solid #10B981' : '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.5rem 0.75rem',
                        color: isCorrect ? '#10B981' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                      }}
                    >
                      {isCorrect ? <CheckCircle2 size={16} style={{ verticalAlign: 'middle', marginRight: '0.2rem' }} /> : null}
                      Option {String.fromCharCode(65 + idx)}
                    </button>

                    <input
                      type="text"
                      className="input-field"
                      placeholder={`Option ${idx + 1} text`}
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      disabled={questionType === 'boolean'}
                      style={{ cursor: questionType === 'boolean' ? 'not-allowed' : 'text' }}
                    />

                    {questionType === 'mcq' && options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.4rem' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
              Click on an Option button to select it as the correct answer.
            </p>
          </div>

          {/* Meta Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem' }}>Category</label>
              <select className="select-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Web Dev">Web Dev</option>
                <option value="React">React</option>
                <option value="JavaScript">JavaScript</option>
                <option value="Node.js">Node.js</option>
                <option value="MongoDB">MongoDB</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem' }}>Difficulty</label>
              <select className="select-field" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem' }}>Time Limit (s)</label>
              <input
                type="number"
                className="input-field"
                min={5}
                max={120}
                value={timeLimitSeconds}
                onChange={(e) => setTimeLimitSeconds(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem' }}>
              Explanation (Optional)
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Short explanation shown after completing the test"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">
              {initialData ? 'Update Question' : 'Create Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
