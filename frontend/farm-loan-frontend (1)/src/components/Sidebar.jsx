import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, 
  FiUsers, 
  FiPackage, 
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiPlusCircle,
  FiList,
  FiUserCheck  // Add this
} from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';
import UserSelector from './UserSelector';
import './Sidebar.css';

const Sidebar = () => {
  const { user, hasRole } = useAuth();

  // Menu items for all users
const menuItems = [
  { path: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
  { path: '/lenders', icon: <FiUserCheck />, label: 'Find Lenders' },  // Add this
  // { path: '/products', icon: <FiPackage />, label: 'Products' },
  // { path: '/loans', icon: <FiDollarSign />, label: 'All Loans' },
  { path: '/borrower-dashboard', icon: <FiTrendingDown />, label: 'My Borrows' },
  { path: '/my-lends', icon: <FiTrendingUp />, label: 'My Lends' },
  // { path: '/request-loan', icon: <FiPlusCircle />, label: 'Request Loan' },
];
  // Admin only menu items
  const adminMenuItems = [
    { path: '/users', icon: <FiUsers />, label: 'Manage Users' },
    { path: '/admin/products', icon: <FiList />, label: 'Manage Products' },
  ];

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <GiWheat />
        </div>
        <div className="logo-text">
          <h1>FarmLoan</h1>
          <span>Management System</span>
        </div>
      </div>

      {/* User Selector - Fetches from Backend */}
      <UserSelector />

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-section-title">Main Menu</span>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Admin Section - Only visible if user has ADMIN role */}
        {hasRole('ADMIN') && (
          <div className="nav-section">
            <span className="nav-section-title">Administration</span>
            {adminMenuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="app-version">
          <GiWheat />
          <span>Version 1.0.0</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;