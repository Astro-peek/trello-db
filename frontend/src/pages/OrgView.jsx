import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { LayoutDashboard, Plus, Loader2, LogOut, ArrowLeft, Presentation, Users, X, Trash2 } from 'lucide-react';
import api from '../api';

const OrgView = () => {
  const { orgId } = useParams();
  const [org, setOrg] = useState(null);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [creatingBoard, setCreatingBoard] = useState(false);

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberUsername, setNewMemberUsername] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [orgId]);

  const fetchData = async () => {
    try {
      const [orgRes, boardsRes] = await Promise.all([
        api.get(`/organization?organizationId=${orgId}`),
        api.get(`/boards?organizationId=${orgId}`)
      ]);
      setOrg(orgRes.data.organization);
      setBoards(boardsRes.data.boards);
    } catch (err) {
      console.error('Failed to fetch data');
      // maybe not admin or wrong id
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    setCreatingBoard(true);
    try {
      await api.post('/board', { title: newBoardTitle, organizationId: orgId });
      setShowCreateModal(false);
      setNewBoardTitle('');
      fetchData();
    } catch (err) {
      alert('Failed to create board');
    } finally {
      setCreatingBoard(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddingMember(true);
    try {
      await api.post('/add-member-to-organization', { organizationId: orgId, memberUserUsername: newMemberUsername });
      setShowAddMemberModal(false);
      setNewMemberUsername('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (username) => {
    try {
      await api.delete('/members', { data: { organizationId: orgId, memberUserUsername: username } });
      fetchData();
    } catch (err) {
      alert('Failed to remove member');
    }
  };

  const logout = () => {
    localStorage.removeItem('trello_token');
    navigate('/auth');
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}><Loader2 className="loading-spinner" size={32} /></div>;
  if (!org) return <div>Failed to load organization</div>;

  return (
    <div className="app-container">
      <nav className="navbar">
        <Link to="/dashboard" className="nav-brand">
          <LayoutDashboard className="icon" />
          <span>TrelloAI</span>
        </Link>
        <div className="nav-actions">
           <button className="btn btn-ghost" onClick={logout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <main className="container">
        <div className="page-header" style={{ marginTop: '40px' }}>
          <div>
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '16px', fontSize: '0.875rem' }}>
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="page-title">{org.title}</h1>
            <p className="page-subtitle">{org.description}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={() => setShowAddMemberModal(true)}>
              <Users size={16} /> Add Member
            </button>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} /> New Board
            </button>
          </div>
        </div>

        {/* Boards Section */}
        <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', marginTop: '32px' }}>Boards</h2>
        <div className="cards-grid">
          {boards.length === 0 ? (
            <div style={{ padding: '24px', color: 'var(--text-muted)' }}>No boards yet.</div>
          ) : (
             boards.map(board => (
              <Link to={`/board/${board._id}?orgId=${orgId}`} key={board._id} className="card">
                <div className="card-title">
                  {board.title}
                  <Presentation size={20} color="var(--accent-color)" />
                </div>
              </Link>
             ))
          )}
        </div>

        {/* Members Section */}
        <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', marginTop: '48px' }}>Members</h2>
        <div style={{ background: 'var(--bg-color-softer)', borderRadius: 'var(--radius-lg)', padding: '16px' }}>
          {org.members.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>No members yet.</div>
          ) : (
            <ul style={{ listStyle: 'none' }}>
              {org.members.map(m => (
                <li key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
                  <span>{m.username}</span>
                  <button className="btn btn-ghost" style={{ padding: '4px 8px', color: 'var(--danger-color)' }} onClick={() => handleRemoveMember(m.username)}>
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {/* Modals */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create Board</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateBoard}>
              <div className="form-group">
                <label className="form-label">Board Title</label>
                <input type="text" className="form-input" value={newBoardTitle} onChange={e => setNewBoardTitle(e.target.value)} required />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creatingBoard}>
                  {creatingBoard ? <Loader2 className="loading-spinner" size={16} /> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddMemberModal && (
        <div className="modal-overlay" onClick={() => setShowAddMemberModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Member</h2>
              <button className="modal-close" onClick={() => setShowAddMemberModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input type="text" className="form-input" value={newMemberUsername} onChange={e => setNewMemberUsername(e.target.value)} required />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={addingMember}>
                  {addingMember ? <Loader2 className="loading-spinner" size={16} /> : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgView;
