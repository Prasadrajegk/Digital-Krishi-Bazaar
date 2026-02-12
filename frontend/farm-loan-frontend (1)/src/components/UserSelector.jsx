import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api/axios';
import { FiUser, FiRefreshCw, FiCheck } from 'react-icons/fi';
import './UserSelector.css';

const UserSelector = () => {
  const { user, switchUserById, loading } = useAuth();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await userAPI.getAll();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSelectUser = async (userId) => {
    await switchUserById(userId);
    setIsOpen(false);
  };

  const getRoleBadges = (roles) => {
    if (!roles || roles.length === 0) return null;
    return roles.map(role => (
      <span key={role.roleId} className={`role-badge ${role.roleName?.toLowerCase()}`}>
        {role.roleName}
      </span>
    ));
  };

  return (
    <div className="user-selector">
      <button 
        className="selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="current-user-avatar">
          {user?.userName?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="current-user-info">
          <span className="current-user-name">{user?.userName || 'Select User'}</span>
          <span className="current-user-roles">
            {user?.roles?.map(r => r.roleName).join(', ') || 'No roles'}
          </span>
        </div>
        <FiRefreshCw className={loading ? 'spin' : ''} />
      </button>

      {isOpen && (
        <>
          <div className="selector-overlay" onClick={() => setIsOpen(false)} />
          <div className="selector-dropdown">
            <div className="dropdown-header">
              <h4>Switch User</h4>
              <button className="refresh-btn" onClick={fetchUsers}>
                <FiRefreshCw className={loadingUsers ? 'spin' : ''} />
              </button>
            </div>
            
            <div className="users-list">
              {loadingUsers ? (
                <div className="loading-users">Loading users...</div>
              ) : users.length > 0 ? (
                users.map(u => (
                  <div 
                    key={u.userId}
                    className={`user-option ${user?.userId === u.userId ? 'active' : ''}`}
                    onClick={() => handleSelectUser(u.userId)}
                  >
                    <div className="user-option-avatar">
                      {u.userName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-option-info">
                      <span className="user-option-name">
                        {u.userName}
                        {user?.userId === u.userId && <FiCheck className="check-icon" />}
                      </span>
                      <span className="user-option-email">{u.email}</span>
                      <div className="user-option-roles">
                        {getRoleBadges(u.roles)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-users">No users found</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserSelector;