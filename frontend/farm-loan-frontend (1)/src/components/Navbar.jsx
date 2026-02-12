import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiBell, FiChevronDown, FiUser } from 'react-icons/fi';
import './Navbar.css';

const Navbar = ({ title }) => {
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">{title || 'Dashboard'}</h1>
      </div>

      <div className="navbar-right">
        {/* Search */}
        {/* <div className="navbar-search">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="search-input"
          />
        </div> */}

        {/* Notifications
        <button className="navbar-icon-btn">
          <FiBell />
          <span className="notification-badge">3</span>
        </button> */}

        {/* User Dropdown */}
        <div className="navbar-user">
          <button 
            className="user-dropdown-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="user-avatar-small">
              {user?.userName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="user-name">{user?.userName || 'User'}</span>
            <FiChevronDown className={`dropdown-arrow ${showDropdown ? 'rotate' : ''}`} />
          </button>

          {showDropdown && (
            <>
              <div className="dropdown-overlay" onClick={() => setShowDropdown(false)}></div>
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    {user?.userName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="dropdown-user-info">
                    <strong>{user?.userName}</strong>
                    <span>{user?.email}</span>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <a href="/profile" className="dropdown-item">
                  <FiUser />
                  <span>My Profile</span>
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;