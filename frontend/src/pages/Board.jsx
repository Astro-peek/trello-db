import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { LayoutDashboard, ArrowLeft, LogOut, Plus, Loader2, X, MoreVertical } from 'lucide-react';
import api from '../api';

const COLUMNS = [
  { id: 'to-do', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' }
];

const Board = () => {
  const { boardId } = useParams();
  const [searchParams] = useSearchParams();
  const orgId = searchParams.get('orgId');
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchIssues();
  }, [boardId]);

  const fetchIssues = async () => {
    try {
      const res = await api.get(`/issues?boardId=${boardId}`);
      setIssues(res.data.issues);
    } catch (err) {
      console.error('Failed to fetch issues', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/issue', { title: newTitle, description: newDesc, boardId });
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      fetchIssues();
    } catch (err) {
      alert('Failed to create issue');
    } finally {
      setCreating(false);
    }
  };

  const updateIssueStatus = async (issueId, newStatus) => {
    // Optimistic update
    setIssues(prev => prev.map(issue => issue._id === issueId ? { ...issue, status: newStatus } : issue));
    try {
      await api.put('/issues', { issueId, status: newStatus });
    } catch (err) {
      alert('Failed to update status');
      fetchIssues(); // Revert
    }
  };

  const logout = () => {
    localStorage.removeItem('trello_token');
    navigate('/auth');
  };

  const getIssuesByStatus = (status) => issues.filter(issue => issue.status === status);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}><Loader2 className="loading-spinner" size={32} /></div>;

  return (
    <div className="app-container">
      <nav className="navbar">
        <Link to="/dashboard" className="nav-brand">
          <LayoutDashboard className="icon" />
          <span>TrelloAI Board</span>
        </Link>
        <div className="nav-actions">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> New Issue
          </button>
          <button className="btn btn-ghost" onClick={logout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div style={{ padding: '24px 24px 0 24px' }}>
        <Link to={`/org/${orgId}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Back to Organization
        </Link>
      </div>

      <div className="board-container">
        {COLUMNS.map(col => {
          const colIssues = getIssuesByStatus(col.id);
          return (
            <div key={col.id} className="board-column">
              <div className="column-header">
                {col.title}
                <span className="column-count">{colIssues.length}</span>
              </div>
              <div className="column-body">
                {colIssues.map(issue => (
                  <div key={issue._id} className="issue-card">
                    <div className="issue-title">{issue.title}</div>
                    <div className="issue-desc">{issue.description}</div>
                    <div className="issue-actions">
                      <select
                        value={issue.status}
                        onChange={(e) => updateIssueStatus(issue._id, e.target.value)}
                        style={{ background: 'rgba(0,0,0,0.5)', color: 'var(--text-color)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', width: '100%', outline: 'none', cursor: 'pointer', appearance: 'none' }}
                      >
                        {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create Issue</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateIssue}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input type="text" className="form-input" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="3" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? <Loader2 className="loading-spinner" size={16} /> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Board;
