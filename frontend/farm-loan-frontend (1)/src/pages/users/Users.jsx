import { useState, useEffect } from 'react';
import { userAPI } from '../../api/axios';
import { 
  FiUsers, 
  FiPlus, 
  FiSearch, 
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiX,
  FiRefreshCw,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShield,
  FiCheck,
  FiUserPlus,
  FiUserCheck,
  FiUserX,
  FiGrid,
  FiList
} from 'react-icons/fi';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import './Users.css';

const Users = () => {
  // State Management
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid');
  
  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form State
  const [userForm, setUserForm] = useState({
    userName: '',
    email: '',
    password: '',
    mobile: '',
    address: '',
    status: 'ACTIVE'
  });

  // Role Assignment State
  const [selectedRoles, setSelectedRoles] = useState([]);

  // Available Roles
  const availableRoles = [
    { roleId: 1, roleName: 'ADMIN', description: 'Full system access' },
    { roleId: 2, roleName: 'FARMER', description: 'Can borrow loans and sell products' },
    { roleId: 3, roleName: 'LENDER', description: 'Can lend money to farmers' },
    { roleId: 4, roleName: 'BUYER', description: 'Can purchase products' },
  ];

  const statuses = ['ALL', 'ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED'];

  // Effects
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter]);

  // API Calls
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAll();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    // Validation
    if (!userForm.userName || !userForm.email || !userForm.password) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!validateEmail(userForm.email)) {
      toast.error('Please enter a valid email');
      return;
    }

    try {
      setActionLoading('create');
      await userAPI.create(userForm);
      toast.success('🎉 User created successfully!');
      closeCreateModal();
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    if (!userForm.userName || !userForm.email) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setActionLoading('update');
      await userAPI.update(selectedUser.userId, userForm);
      toast.success('User updated successfully!');
      closeEditModal();
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setActionLoading('delete');
      await userAPI.delete(selectedUser.userId);
      toast.success('User deleted successfully');
      closeDeleteModal();
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAssignRoles = async () => {
    if (selectedRoles.length === 0) {
      toast.error('Please select at least one role');
      return;
    }

    try {
      setActionLoading('roles');
      await userAPI.assignRoles(selectedUser.userId, selectedRoles);
      toast.success('Roles assigned successfully!');
      closeRoleModal();
      fetchUsers();
    } catch (error) {
      console.error('Error assigning roles:', error);
      toast.error(error.response?.data?.message || 'Failed to assign roles');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter Logic
  const filterUsers = () => {
    let result = [...users];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(user =>
        user.userName?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.mobile?.includes(search) ||
        user.address?.toLowerCase().includes(search)
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(result);
  };

  // Modal Handlers
  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    resetForm();
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setUserForm({
      userName: user.userName || '',
      email: user.email || '',
      password: '',
      mobile: user.mobile || '',
      address: user.address || '',
      status: user.status || 'ACTIVE'
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedUser(null);
    resetForm();
  };

  const openDetailModal = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedUser(null);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles?.map(r => r.roleId) || []);
    setShowRoleModal(true);
  };

  const closeRoleModal = () => {
    setShowRoleModal(false);
    setSelectedUser(null);
    setSelectedRoles([]);
  };

  const resetForm = () => {
    setUserForm({
      userName: '',
      email: '',
      password: '',
      mobile: '',
      address: '',
      status: 'ACTIVE'
    });
  };

  // Utility Functions
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getStatusConfig = (status) => {
    const configs = {
      ACTIVE: { class: 'status-active', icon: <FiUserCheck />, color: '#10b981' },
      INACTIVE: { class: 'status-inactive', icon: <FiUserX />, color: '#6b7280' },
      PENDING: { class: 'status-pending', icon: <FiUsers />, color: '#f59e0b' },
      BLOCKED: { class: 'status-blocked', icon: <FiUserX />, color: '#ef4444' },
    };
    return configs[status] || configs.ACTIVE;
  };

  const getRoleColor = (roleName) => {
    const colors = {
      ADMIN: { bg: '#fee2e2', color: '#dc2626' },
      FARMER: { bg: '#d1fae5', color: '#059669' },
      LENDER: { bg: '#dbeafe', color: '#2563eb' },
      BUYER: { bg: '#fef3c7', color: '#d97706' },
    };
    return colors[roleName] || { bg: '#f3f4f6', color: '#6b7280' };
  };

  const toggleRole = (roleId) => {
    setSelectedRoles(prev => 
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  // Stats
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'ACTIVE').length,
    inactive: users.filter(u => u.status === 'INACTIVE').length,
    pending: users.filter(u => u.status === 'PENDING').length,
  };

  // Loading State
  if (loading) {
    return <Loader size="large" text="Loading users..." />;
  }

  return (
    <div className="users-page">
      {/* Page Header */}
      <div className="users-header">
        <div className="header-left">
          <h1>👥 Users Management</h1>
          <p>Manage system users and their roles</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchUsers}>
            <FiRefreshCw />
            Refresh
          </button>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <FiUserPlus />
            Add User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="user-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <FiUsers />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Users</span>
            <h3>{stats.total}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <FiUserCheck />
          </div>
          <div className="stat-info">
            <span className="stat-label">Active</span>
            <h3>{stats.active}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon inactive">
            <FiUserX />
          </div>
          <div className="stat-info">
            <span className="stat-label">Inactive</span>
            <h3>{stats.inactive}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <FiUsers />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pending</span>
            <h3>{stats.pending}</h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="users-filters">
        <div className="filters-left">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Search by name, email, mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-btn" onClick={() => setSearchTerm('')}>
                <FiX />
              </button>
            )}
          </div>

          <div className="filter-dropdown">
            <FiFilter />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'ALL' ? 'All Status' : status}
                </option>
              ))}
            </select>
          </div>

          {(searchTerm || statusFilter !== 'ALL') && (
            <button 
              className="clear-all-btn"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
              }}
            >
              <FiX />
              Clear
            </button>
          )}
        </div>

        <div className="filters-right">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <FiGrid />
            </button>
            <button
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <FiList />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-count">
        Showing {filteredUsers.length} of {users.length} users
      </div>

      {/* Users Grid/List */}
      {filteredUsers.length > 0 ? (
        <div className={`users-container ${viewMode}`}>
          {filteredUsers.map(user => {
            const statusConfig = getStatusConfig(user.status);
            
            return (
              <div key={user.userId} className={`user-card ${viewMode}`}>
                {/* User Avatar */}
                <div className="user-avatar-section">
                  <div className="user-avatar large">
                    {user.userName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className={`user-status-badge ${statusConfig.class}`}>
                    {statusConfig.icon}
                    {user.status}
                  </span>
                </div>

                {/* User Info */}
                <div className="user-info">
                  <h3 className="user-name">{user.userName}</h3>
                  
                  <div className="user-details">
                    <div className="detail-item">
                      <FiMail />
                      <span>{user.email}</span>
                    </div>
                    {user.mobile && (
                      <div className="detail-item">
                        <FiPhone />
                        <span>{user.mobile}</span>
                      </div>
                    )}
                    {user.address && (
                      <div className="detail-item">
                        <FiMapPin />
                        <span>{user.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Roles */}
                  <div className="user-roles">
                    {user.roles && user.roles.length > 0 ? (
                      user.roles.map(role => {
                        const roleColor = getRoleColor(role.roleName);
                        return (
                          <span 
                            key={role.roleId} 
                            className="role-badge"
                            style={{ 
                              background: roleColor.bg, 
                              color: roleColor.color 
                            }}
                          >
                            <FiShield />
                            {role.roleName}
                          </span>
                        );
                      })
                    ) : (
                      <span className="no-roles">No roles assigned</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="user-actions">
                  <button 
                    className="action-btn view"
                    onClick={() => openDetailModal(user)}
                    title="View Details"
                  >
                    <FiEye />
                  </button>
                  <button 
                    className="action-btn edit"
                    onClick={() => openEditModal(user)}
                    title="Edit User"
                  >
                    <FiEdit2 />
                  </button>
                  <button 
                    className="action-btn roles"
                    onClick={() => openRoleModal(user)}
                    title="Assign Roles"
                  >
                    <FiShield />
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => openDeleteModal(user)}
                    title="Delete User"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-users">
          <div className="empty-icon">
            <FiUsers />
          </div>
          <h3>No Users Found</h3>
          <p>
            {searchTerm || statusFilter !== 'ALL'
              ? 'No users match your search criteria'
              : 'No users available in the system'}
          </p>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <FiUserPlus />
            Add First User
          </button>
        </div>
      )}

      {/* ===================== CREATE USER MODAL ===================== */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={closeCreateModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <FiUserPlus />
                Create New User
              </h2>
              <button className="modal-close" onClick={closeCreateModal}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter full name"
                    value={userForm.userName}
                    onChange={(e) => setUserForm({ ...userForm, userName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="Enter email address"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Password <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    required
                    minLength={6}
                  />
                  <p className="form-hint">Minimum 6 characters</p>
                </div>
              </div>

              <div className="form-row two-cols">
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="Enter mobile number"
                    value={userForm.mobile}
                    onChange={(e) => setUserForm({ ...userForm, mobile: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-input"
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="PENDING">Pending</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-input textarea"
                    placeholder="Enter address"
                    value={userForm.address}
                    onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={closeCreateModal}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={actionLoading === 'create'}
                >
                  {actionLoading === 'create' ? (
                    <>
                      <FiRefreshCw className="spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FiUserPlus />
                      Create User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== EDIT USER MODAL ===================== */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <FiEdit2 />
                Edit User
              </h2>
              <button className="modal-close" onClick={closeEditModal}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="modal-body">
              <div className="edit-user-header">
                <div className="user-avatar large">
                  {selectedUser.userName?.charAt(0).toUpperCase()}
                </div>
                <div className="edit-user-info">
                  <h3>{selectedUser.userName}</h3>
                  <p>ID: #{selectedUser.userId}</p>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={userForm.userName}
                    onChange={(e) => setUserForm({ ...userForm, userName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    New Password <span className="optional">(leave blank to keep current)</span>
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter new password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    minLength={6}
                  />
                </div>
              </div>

              <div className="form-row two-cols">
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={userForm.mobile}
                    onChange={(e) => setUserForm({ ...userForm, mobile: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-input"
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="PENDING">Pending</option>
                    <option value="BLOCKED">Blocked</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-input textarea"
                    value={userForm.address}
                    onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={actionLoading === 'update'}
                >
                  {actionLoading === 'update' ? (
                    <>
                      <FiRefreshCw className="spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <FiCheck />
                      Update User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== USER DETAIL MODAL ===================== */}
      {showDetailModal && selectedUser && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div className="modal detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <FiEye />
                User Details
              </h2>
              <button className="modal-close" onClick={closeDetailModal}>
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              {/* User Profile Header */}
              <div className="detail-profile">
                <div className="user-avatar xlarge">
                  {selectedUser.userName?.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                  <h2>{selectedUser.userName}</h2>
                  <p className="user-id">User ID: #{selectedUser.userId}</p>
                  <span className={`user-status-badge large ${getStatusConfig(selectedUser.status).class}`}>
                    {getStatusConfig(selectedUser.status).icon}
                    {selectedUser.status}
                  </span>
                </div>
              </div>

              {/* User Details Grid */}
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-icon">
                    <FiMail />
                  </div>
                  <div className="detail-content">
                    <span className="label">Email Address</span>
                    <span className="value">{selectedUser.email}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon">
                    <FiPhone />
                  </div>
                  <div className="detail-content">
                    <span className="label">Mobile Number</span>
                    <span className="value">{selectedUser.mobile || 'Not provided'}</span>
                  </div>
                </div>

                <div className="detail-item full-width">
                  <div className="detail-icon">
                    <FiMapPin />
                  </div>
                  <div className="detail-content">
                    <span className="label">Address</span>
                    <span className="value">{selectedUser.address || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Roles Section */}
              <div className="detail-section">
                <h4>
                  <FiShield />
                  Assigned Roles
                </h4>
                <div className="roles-list">
                  {selectedUser.roles && selectedUser.roles.length > 0 ? (
                    selectedUser.roles.map(role => {
                      const roleColor = getRoleColor(role.roleName);
                      return (
                        <div 
                          key={role.roleId} 
                          className="role-item"
                          style={{ 
                            background: roleColor.bg, 
                            borderColor: roleColor.color 
                          }}
                        >
                          <FiShield style={{ color: roleColor.color }} />
                          <span style={{ color: roleColor.color }}>{role.roleName}</span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="no-data">No roles assigned to this user</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="detail-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    closeDetailModal();
                    openEditModal(selectedUser);
                  }}
                >
                  <FiEdit2 />
                  Edit User
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    closeDetailModal();
                    openRoleModal(selectedUser);
                  }}
                >
                  <FiShield />
                  Manage Roles
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== DELETE CONFIRMATION MODAL ===================== */}
      {showDeleteModal && selectedUser && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header danger">
              <h2>
                <FiTrash2 />
                Delete User
              </h2>
              <button className="modal-close" onClick={closeDeleteModal}>
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <div className="delete-warning">
                <div className="warning-icon">
                  <FiTrash2 />
                </div>
                <h3>Are you sure?</h3>
                <p>
                  You are about to delete the user <strong>{selectedUser.userName}</strong>. 
                  This action cannot be undone.
                </p>

                <div className="user-to-delete">
                  <div className="user-avatar">
                    {selectedUser.userName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <span className="name">{selectedUser.userName}</span>
                    <span className="email">{selectedUser.email}</span>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={closeDeleteModal}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={handleDeleteUser}
                  disabled={actionLoading === 'delete'}
                >
                  {actionLoading === 'delete' ? (
                    <>
                      <FiRefreshCw className="spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FiTrash2 />
                      Yes, Delete User
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== ASSIGN ROLES MODAL ===================== */}
      {showRoleModal && selectedUser && (
        <div className="modal-overlay" onClick={closeRoleModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <FiShield />
                Assign Roles
              </h2>
              <button className="modal-close" onClick={closeRoleModal}>
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <div className="role-user-info">
                <div className="user-avatar">
                  {selectedUser.userName?.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <h4>{selectedUser.userName}</h4>
                  <p>{selectedUser.email}</p>
                </div>
              </div>

              <div className="roles-section">
                <h4>Select Roles</h4>
                <p className="roles-hint">Choose one or more roles for this user</p>

                <div className="role-options">
                  {availableRoles.map(role => {
                    const isSelected = selectedRoles.includes(role.roleId);
                    const roleColor = getRoleColor(role.roleName);
                    
                    return (
                      <div 
                        key={role.roleId}
                        className={`role-option ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleRole(role.roleId)}
                        style={{
                          borderColor: isSelected ? roleColor.color : '#e5e7eb',
                          background: isSelected ? roleColor.bg : '#fff'
                        }}
                      >
                        <div className="role-checkbox">
                          {isSelected && <FiCheck />}
                        </div>
                        <div className="role-content">
                          <span className="role-name" style={{ color: isSelected ? roleColor.color : '#1f2937' }}>
                            {role.roleName}
                          </span>
                          <span className="role-desc">{role.description}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={closeRoleModal}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleAssignRoles}
                  disabled={actionLoading === 'roles' || selectedRoles.length === 0}
                >
                  {actionLoading === 'roles' ? (
                    <>
                      <FiRefreshCw className="spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <FiCheck />
                      Assign Roles ({selectedRoles.length})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;