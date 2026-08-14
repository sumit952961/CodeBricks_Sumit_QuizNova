import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Edit2, Trash2, Search, RefreshCw, CheckCircle, ClipboardList, BookOpen, Clock, Users, Key } from 'lucide-react';
import { fetchAdminQuestions, createQuestion, updateQuestion, deleteQuestion, fetchTests, createTest, deleteTest, fetchAdminLeaderboard, fetchResetRequests, resetPasswordAdmin } from '../../services/api';
import QuestionFormModal from './QuestionFormModal';

export default function AdminView() {
  const [activeSubTab, setActiveSubTab] = useState('tests'); // 'tests' | 'results' | 'requests'
  
  // Test management states
  const [tests, setTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [newTestName, setNewTestName] = useState('');
  const [newTestDesc, setNewTestDesc] = useState('');
  const [newTestDiff, setNewTestDiff] = useState('Medium');
  const [showAddTestForm, setShowAddTestForm] = useState(false);

  // Question management states
  const [selectedTestName, setSelectedTestName] = useState(null); // Filter questions by this test
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  // Student attempts stats states
  const [attempts, setAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [attemptsSearch, setAttemptsSearch] = useState('');

  // Password resets states
  const [resetRequests, setResetRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [tempPasswords, setTempPasswords] = useState({}); // { username: 'newPass' }

  // General notification states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadTestsData = async () => {
    setLoadingTests(true);
    try {
      const res = await fetchTests();
      setTests(res.data || []);
    } catch (err) {
      setErrorMsg('Failed to load tests.');
    } finally {
      setLoadingTests(false);
    }
  };

  const loadQuestionsData = async () => {
    setLoadingQuestions(true);
    try {
      const res = await fetchAdminQuestions();
      setQuestions(res.data || []);
    } catch (err) {
      setErrorMsg('Failed to load questions.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const loadAttemptsData = async () => {
    setLoadingAttempts(true);
    try {
      const res = await fetchAdminLeaderboard();
      setAttempts(res.data || []);
    } catch (err) {
      setErrorMsg('Failed to load student results.');
    } finally {
      setLoadingAttempts(false);
    }
  };

  const loadResetRequestsData = async () => {
    setLoadingRequests(true);
    try {
      const res = await fetchResetRequests();
      setResetRequests(res.data || []);
    } catch (err) {
      setErrorMsg('Failed to load reset requests.');
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    loadTestsData();
    loadQuestionsData();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'results') {
      loadAttemptsData();
    } else if (activeSubTab === 'requests') {
      loadResetRequestsData();
    }
  }, [activeSubTab]);

  const handleCreateTest = async (e) => {
    e.preventDefault();
    if (!newTestName.trim() || !newTestDesc.trim()) {
      alert('Please fill in test name and description.');
      return;
    }
    try {
      await createTest({ name: newTestName.trim(), description: newTestDesc.trim(), difficulty: newTestDiff });
      setNewTestName('');
      setNewTestDesc('');
      setShowAddTestForm(false);
      setSuccessMsg('Test category created successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadTestsData();
    } catch (err) {
      alert(err.message || 'Failed to create test.');
    }
  };

  const handleDeleteTest = async (id) => {
    if (!window.confirm('Warning: Deleting this test will also delete all associated questions. Do you want to proceed?')) return;
    try {
      await deleteTest(id);
      setSuccessMsg('Test and questions deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
      setSelectedTestName(null);
      loadTestsData();
      loadQuestionsData();
    } catch (err) {
      setErrorMsg('Failed to delete test.');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await deleteQuestion(id);
      setSuccessMsg('Question deleted.');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadQuestionsData();
    } catch (err) {
      setErrorMsg('Failed to delete question.');
    }
  };

  const handleQuestionFormSubmit = async (formData) => {
    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion._id, formData);
        setSuccessMsg('Question updated successfully!');
      } else {
        await createQuestion(formData);
        setSuccessMsg('New question added!');
      }
      setIsQuestionModalOpen(false);
      setTimeout(() => setSuccessMsg(''), 3000);
      loadQuestionsData();
    } catch (err) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleOpenAddQuestion = () => {
    setEditingQuestion(null);
    setIsQuestionModalOpen(true);
  };

  const handleOverridePassword = async (username) => {
    const password = tempPasswords[username];
    if (!password || password.trim().length < 4) {
      alert('Password must be at least 4 characters long.');
      return;
    }
    try {
      const res = await resetPasswordAdmin(username, password.trim());
      setSuccessMsg(res.message);
      setTempPasswords(prev => {
        const copy = { ...prev };
        delete copy[username];
        return copy;
      });
      setTimeout(() => setSuccessMsg(''), 5000);
      loadResetRequestsData();
    } catch (err) {
      alert(err.message || 'Failed to reset password');
    }
  };

  const handleTempPasswordChange = (username, val) => {
    setTempPasswords(prev => ({ ...prev, [username]: val }));
  };

  // Filtered lists
  const filteredQuestions = questions.filter(q => {
    const matchesTest = selectedTestName ? q.category === selectedTestName : true;
    const matchesQuery = q.questionText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTest && matchesQuery;
  });

  const filteredAttempts = attempts.filter(a =>
    (a.fullName || '').toLowerCase().includes(attemptsSearch.toLowerCase()) ||
    (a.testName || '').toLowerCase().includes(attemptsSearch.toLowerCase()) ||
    (a.username || '').toLowerCase().includes(attemptsSearch.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto' }}>
      
      {/* Header Panel */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <ShieldCheck size={28} color="#6366F1" />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Admin Management View</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Configure test modules, upload questions, track student scores, and reset user credentials.
          </p>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '0.9rem 1.2rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {/* Admin Tab Switching */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeSubTab === 'tests' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('tests')}
        >
          <ClipboardList size={18} /> Manage Tests & Questions
        </button>
        <button
          className={`btn ${activeSubTab === 'results' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('results')}
        >
          <Users size={18} /> Student Results
        </button>
        <button
          className={`btn ${activeSubTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveSubTab('requests')}
        >
          <Key size={18} /> Password Requests {resetRequests.length > 0 && <span style={{ background: '#F43F5E', color: 'white', fontSize: '0.75rem', padding: '0.1rem 0.4rem', borderRadius: '10px', marginLeft: '0.3rem' }}>{resetRequests.length}</span>}
        </button>
      </div>

      {/* Sub-Tab 1: Manage Tests & Questions */}
      {activeSubTab === 'tests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Test Creator Section */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Test Modules</h3>
              <button onClick={() => setShowAddTestForm(!showAddTestForm)} className="btn btn-emerald" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                <Plus size={16} /> {showAddTestForm ? 'Hide Form' : 'Add New Test'}
              </button>
            </div>

            {showAddTestForm && (
              <form onSubmit={handleCreateTest} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(0,0,0,0.15)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Test Name</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Python Programming"
                      value={newTestName}
                      onChange={(e) => setNewTestName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Difficulty</label>
                    <select className="select-field" value={newTestDiff} onChange={(e) => setNewTestDiff(e.target.value)}>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Description</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Short description of the test"
                    value={newTestDesc}
                    onChange={(e) => setNewTestDesc(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn btn-emerald" style={{ padding: '0.6rem 1.25rem' }}>Save Test Category</button>
                </div>
              </form>
            )}

            {/* Test Cards List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
              {tests.map(t => (
                <div key={t._id} className="glass-panel" style={{ padding: '1.25rem', border: selectedTestName === t.name ? '2px solid #6366F1' : '1px solid var(--border-color)', background: selectedTestName === t.name ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, color: 'white' }}>{t.name}</span>
                    <span className={`badge badge-${(t.difficulty || 'Medium').toLowerCase()}`}>{t.difficulty}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', minHeight: '36px', marginBottom: '1rem' }}>{t.description}</p>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
                    <button
                      onClick={() => setSelectedTestName(selectedTestName === t.name ? null : t.name)}
                      className={`btn ${selectedTestName === t.name ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', flex: 1 }}
                    >
                      <BookOpen size={14} /> {selectedTestName === t.name ? 'Show All' : 'Manage Questions'}
                    </button>
                    <button onClick={() => handleDeleteTest(t._id)} className="btn btn-danger" style={{ padding: '0.4rem' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Question List Section */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                  {selectedTestName ? `Questions in "${selectedTestName}"` : 'All Questions'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Select a test above to filter questions or add new ones.
                </p>
              </div>

              {selectedTestName && (
                <button onClick={handleOpenAddQuestion} className="btn btn-emerald">
                  <Plus size={18} /> Add Question to {selectedTestName}
                </button>
              )}
            </div>

            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="input-field"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>

            {loadingQuestions ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
            ) : filteredQuestions.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                {selectedTestName ? 'No questions in this test. Click "Add Question" to create one.' : 'No questions found.'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredQuestions.map((q, idx) => (
                  <div key={q._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', color: 'white', fontWeight: 600 }}>{idx + 1}. {q.questionText}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                        Test: <strong style={{ color: 'var(--primary)' }}>{q.category}</strong> | Options: {q.options.length} | Answer: {String.fromCharCode(65 + q.correctAnswerIndex)} | Time: {q.timeLimitSeconds}s
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => { setEditingQuestion(q); setIsQuestionModalOpen(true); }} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDeleteQuestion(q._id)} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Student Results dashboard */}
      {activeSubTab === 'results' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Student Attempts & Scores</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Overview of all submissions sorted by best percentage score and completion speed.
              </p>
            </div>
            <button onClick={loadAttemptsData} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              <RefreshCw size={14} className={loadingAttempts ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search by student name or test name..."
              value={attemptsSearch}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.75rem' }}
            />
          </div>

          {loadingAttempts ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading attempts...</div>
          ) : filteredAttempts.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>No student results recorded yet.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '1rem 1.25rem' }}>Student</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Test Name</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Score</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Accuracy</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Time Taken</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Attempt Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttempts.map((att, idx) => (
                    <tr key={att._id || idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 600, color: 'white' }}>{att.fullName || att.username}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>@{att.username}</div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#6366F1' }}>
                          {att.testName}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>{att.score} / {att.totalQuestions}</td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span className={`badge ${att.percentage >= 80 ? 'badge-easy' : att.percentage >= 50 ? 'badge-medium' : 'badge-hard'}`}>
                          {att.percentage}%
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: 'white', fontWeight: 600 }}>
                        <Clock size={13} style={{ verticalAlign: 'middle', marginRight: '0.3rem', color: '#06B6D4' }} />
                        {att.timeTakenSeconds || 0} seconds
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                        {att.createdAt ? new Date(att.createdAt).toLocaleString() : 'Recent'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 3: Password requests table */}
      {activeSubTab === 'requests' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Password Reset Requests</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Verify and resolve password requests. Enter a new temporary password for the user and override it.
              </p>
            </div>
            <button onClick={loadResetRequestsData} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              <RefreshCw size={14} className={loadingRequests ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          {loadingRequests ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading requests...</div>
          ) : resetRequests.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>No pending password reset requests.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '1rem 1.25rem' }}>Student Name</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Username</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Registered Email</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Requested Date</th>
                    <th style={{ padding: '1rem 1.25rem', width: '320px' }}>Override Password Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resetRequests.map((req, idx) => (
                    <tr key={req._id || idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '1rem 1.25rem', color: 'white', fontWeight: 600 }}>{req.fullName}</td>
                      <td style={{ padding: '1rem 1.25rem' }}>@{req.username}</td>
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--primary)', fontWeight: 600 }}>{req.email}</td>
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                        {new Date(req.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="text"
                            placeholder="New temp password"
                            className="input-field"
                            value={tempPasswords[req.username] || ''}
                            onChange={(e) => handleTempPasswordChange(req.username, e.target.value)}
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                          />
                          <button
                            onClick={() => handleOverridePassword(req.username)}
                            className="btn btn-primary"
                            style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                          >
                            Reset
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {isQuestionModalOpen && (
        <QuestionFormModal
          initialData={editingQuestion}
          onClose={() => setIsQuestionModalOpen(false)}
          onSubmit={handleQuestionFormSubmit}
          // Pre-populate category field in form with selected test name if creating
          defaultCategory={selectedTestName}
        />
      )}
    </div>
  );
}
