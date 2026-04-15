import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Plus, Loader2, LogOut, Building, X } from 'lucide-react';
import api from '../api';

const Dashboard = () => {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    try {
      const res = await api.get('/organizations');
      setOrgs(res.data.organizations);
    } catch (err) {
      console.error('Failed to fetch orgs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/organization', { title: newTitle, description: newDesc });
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      fetchOrgs();
    } catch (err) {
      alert('Failed to create organization');
    } finally {
      setCreating(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('trello_token');
    navigate('/auth');
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <Link to="/dashboard" className="nav-brand">
          <LayoutDashboard className="icon" />
          <span>TrelloAI</span>
        </Link>
        <div className="nav-actions">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> New Organization
          </button>
          <button className="btn btn-ghost" onClick={logout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <main className="container">
        <div className="page-header" style={{ marginTop: '40px' }}>
          <div>
            <h1 className="page-title">Your Organizations</h1>
            <p className="page-subtitle">Manage your teams and workspaces</p>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
            <Loader2 className="loading-spinner" size={32} />
          </div>
        ) : (
          <div className="cards-grid">
            {orgs.length === 0 ? (
              <div style={{ padding: '40px', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>
                You don't belong to any organizations yet.
              </div>
            ) : (
              orgs.map((org) => (
                <Link to={`/org/${org._id}`} key={org._id} className="card">
                  <div className="card-title">
                    {org.title}
                    <Building size={20} color="var(--primary-color)" />
                  </div>
                  <p className="card-desc">{org.description || 'No description provided.'}</p>
                </Link>
              ))
            )}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create Organization</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateOrg}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input" 
                  rows="3"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                />
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

export default Dashboard;
