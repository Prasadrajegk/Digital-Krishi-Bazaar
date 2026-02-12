import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userAPI, productAPI, loanAPI } from '../../api/axios';
import {
  FiUsers,
  FiPackage,
  FiDollarSign,
  FiTrendingUp,
  FiArrowUpRight,
  FiArrowDownRight,
  FiPlus,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { GiWheat, GiCorn, GiTomato } from 'react-icons/gi';
import Loader from '../../components/Loader';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalLoans: 0,
    pendingLoans: 0,
    approvedLoans: 0,
    completedLoans: 0,
    totalLoanAmount: 0
  });
  const [recentLoans, setRecentLoans] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [usersRes, productsRes, loansRes] = await Promise.all([
        userAPI.getAll().catch(() => ({ data: [] })),
        productAPI.getAll().catch(() => ({ data: [] })),
        loanAPI.getAll().catch(() => ({ data: [] }))
      ]);

      const users = usersRes.data || [];
      const products = productsRes.data || [];
      const loans = loansRes.data || [];

      console.log('📊 Dashboard - All Loans:', loans);
      console.log('📊 Dashboard - Loan Statuses:', loans.map(l => ({ 
        id: l.loanId, 
        status: l.status,
        amount: l.amount,
        paidAmount: l.paidAmount,
        remainingAmount: l.remainingAmount
      })));

      // FIXED: Use same logic as LenderDashboard
      // Enhanced status checking to handle multiple formats
      const isPending = (status) => {
        const normalized = status?.toUpperCase().trim();
        return ['PENDING', 'PENDING_APPROVAL', 'REQUESTED'].includes(normalized);
      };

      const isApproved = (status) => {
        const normalized = status?.toUpperCase().trim();
        return ['APPROVED', 'ACTIVE'].includes(normalized);
      };

      const isCompleted = (status, loan) => {
        const normalized = status?.toUpperCase().trim();
        
        // Check explicit completed status
        if (['COMPLETED', 'PAID', 'CLOSED'].includes(normalized)) {
          return true;
        }
        
        // Check if loan is fully paid based on amount
        // Support both paidAmount and remainingAmount fields
        if (loan.paidAmount !== undefined && loan.amount) {
          return loan.paidAmount >= loan.amount;
        }
        
        if (loan.remainingAmount !== undefined) {
          return loan.remainingAmount <= 0 && !isPending(status);
        }
        
        return false;
      };

      // Calculate stats with enhanced logic
      const pendingLoans = loans.filter(l => isPending(l.status)).length;
      const approvedLoans = loans.filter(l => isApproved(l.status)).length;
      const completedLoans = loans.filter(l => isCompleted(l.status, l)).length;
      const totalLoanAmount = loans.reduce((sum, l) => sum + (l.amount || 0), 0);

      console.log('📊 Stats Calculated:', {
        total: loans.length,
        pending: pendingLoans,
        approved: approvedLoans,
        completed: completedLoans
      });

      setStats({
        totalUsers: users.length,
        totalProducts: products.length,
        totalLoans: loans.length,
        pendingLoans,
        approvedLoans,
        completedLoans,
        totalLoanAmount
      });

      // Get recent items (last 5)
       setRecentLoans(loans.slice(0, 5));
      setRecentProducts(products.slice(0, 4));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status, remainingAmount) => {
    // Normalize status to uppercase for comparison
    const normalizedStatus = status?.toUpperCase() || 'UNKNOWN';
    
    // Check if loan is actually completed based on remaining amount
    const isActuallyCompleted = remainingAmount !== undefined && remainingAmount <= 0 && normalizedStatus !== 'PENDING';
    
    const displayStatus = isActuallyCompleted ? 'COMPLETED' : normalizedStatus;
    
    const statusConfig = {
      PENDING: { class: 'badge-warning', icon: <FiClock /> },
      APPROVED: { class: 'badge-success', icon: <FiCheckCircle /> },
      ACTIVE: { class: 'badge-info', icon: <FiTrendingUp /> },
      REJECTED: { class: 'badge-danger', icon: <FiXCircle /> },
      COMPLETED: { class: 'badge-success', icon: <FiCheckCircle /> },
      PAID: { class: 'badge-success', icon: <FiCheckCircle /> },
    };
    
    const config = statusConfig[displayStatus] || { class: 'badge-info', icon: <FiAlertCircle /> };
    
    return (
      <span className={`badge ${config.class}`}>
        {config.icon}
        {displayStatus}
      </span>
    );
  };

  if (loading) {
    return <Loader size="large" text="Loading dashboard..." />;
  }

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="dashboard-welcome-section">
        <div className="welcome-text">
          <h1>Welcome back, {user?.userName}! 👋</h1>
          <p>Here's what's happening with your farm today.</p>
        </div>
        <div className="welcome-actions">
          <Link to="/request-loan" className="btn btn-primary">
            <FiPlus />
            Request Loan
          </Link>
          <Link to="/products" className="btn btn-secondary">
            <FiEye />
            View Products
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card-users">
          <div className="stat-icon">
            <FiUsers />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Users</span>
            <h3 className="stat-value">{stats.totalUsers}</h3>
            <span className="stat-change positive">
              <FiArrowUpRight />
              12% from last month
            </span>
          </div>
          <div className="stat-decoration"></div>
        </div>

        <div className="stat-card stat-card-products">
          <div className="stat-icon">
            <FiPackage />
          </div>
          {/* <div className="stat-content">
            <span className="stat-label">Total Products</span>
            <h3 className="stat-value">{stats.totalProducts}</h3>
            <span className="stat-change positive">
              <FiArrowUpRight />
              8% from last month
            </span>
          </div>
          <div className="stat-decoration"></div>
        </div>

        <div className="stat-card stat-card-loans">
          <div className="stat-icon">
            <FiDollarSign />
          </div> */}
          <div className="stat-content">
            <span className="stat-label">Total Loans</span>
            <h3 className="stat-value">{stats.totalLoans}</h3>
            <span className="stat-change positive">
              <FiArrowUpRight />
              23% from last month
            </span>
          </div>
          <div className="stat-decoration"></div>
        </div>

        <div className="stat-card stat-card-amount">
          <div className="stat-icon">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Loan Amount</span>
            <h3 className="stat-value">₹{stats.totalLoanAmount.toLocaleString()}</h3>
            <span className="stat-change negative">
              <FiArrowDownRight />
              5% from last month
            </span>
          </div>
          <div className="stat-decoration"></div>
        </div>

        
      </div>

      {/* Loan Status Cards - FIXED */}
      <div className="loan-status-cards">
        <div className="loan-status-card pending">
          <div className="status-icon">
            <FiClock />
          </div>
          <div className="status-info">
            <h4>{stats.pendingLoans}</h4>
            <span>Pending Loans</span>
          </div>
        </div>
        <div className="loan-status-card approved">
          <div className="status-icon">
            <FiCheckCircle />
          </div>
          <div className="status-info">
            <h4>{stats.approvedLoans}</h4>
            <span>Active Loans</span>
          </div>
        </div>
        <div className="loan-status-card total">
          <div className="status-icon">
            <FiDollarSign />
          </div>
          <div className="status-info">
            <h4>{stats.completedLoans}</h4>
            <span>Completed</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Loans */}
        <div className="dashboard-card recent-loans">
          <div className="card-header">
            <h3>
              <FiDollarSign />
              Recent Loans
            </h3>
            <Link to="/loans" className="view-all-btn">
              View All
              <FiArrowUpRight />
            </Link>
          </div>
          <div className="card-content">
            {recentLoans.length > 0 ? (
              <div className="loans-table-wrapper">
                <table className="loans-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Amount</th>
                      <th>Remaining</th>
                      <th>Tenure</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLoans.map((loan) => (
                      <tr key={loan.loanId}>
                        <td>
                          <span className="loan-id">#{loan.loanId}</span>
                        </td>
                        <td>
                          <span className="loan-amount">₹{(loan.amount || 0).toLocaleString()}</span>
                        </td>
                        <td>
                          <span className="loan-remaining">
                            ₹{(() => {
                              // Calculate remaining amount safely
                              let remaining = 0;
                              if (loan.remainingAmount !== undefined && loan.remainingAmount !== null) {
                                remaining = loan.remainingAmount;
                              } else if (loan.amount !== undefined && loan.amount !== null) {
                                remaining = loan.amount - (loan.paidAmount || 0);
                              }
                              return Math.max(0, remaining).toLocaleString();
                            })()}
                          </span>
                        </td>
                        <td>
                          <span className="loan-tenure">{loan.tenure || 0} months</span>
                        </td>
                        <td>{getStatusBadge(loan.status, loan)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <FiDollarSign />
                <p>No loans found</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Products */}
        <div className="dashboard-card recent-products">
          <div className="card-header">
            <h3>
              <FiPackage />
              Recent Products
            </h3>
            <Link to="/products" className="view-all-btn">
              View All
              <FiArrowUpRight />
            </Link>
          </div>
          <div className="card-content">
            {recentProducts.length > 0 ? (
              <div className="products-grid">
                {recentProducts.map((product) => (
                  <div className="product-mini-card" key={product.productId}>
                    <div className="product-mini-image">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.productName} />
                      ) : (
                        <div className="product-placeholder">
                          <GiWheat />
                        </div>
                      )}
                    </div>
                    <div className="product-mini-info">
                      <h4>{product.productName}</h4>
                      <span className="product-price">₹{product.price}</span>
                      <span className={`product-status ${product.status?.toLowerCase()}`}>
                        {product.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FiPackage />
                <p>No products found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <Link to="/request-loan" className="action-card">
            <div className="action-icon loan">
              <FiDollarSign />
            </div>
            <div className="action-info">
              <h4>Request Loan</h4>
              <p>Apply for a new agricultural loan</p>
            </div>
          </Link>

          <Link to="/products" className="action-card">
            <div className="action-icon product">
              <FiPackage />
            </div>
            <div className="action-info">
              <h4>Browse Products</h4>
              <p>View available farm products</p>
            </div>
          </Link>

          <Link to="/my-borrows" className="action-card">
            <div className="action-icon borrow">
              <FiTrendingUp />
            </div>
            <div className="action-info">
              <h4>My Borrows</h4>
              <p>Check your borrowed loans</p>
            </div>
          </Link>

          <Link to="/my-lends" className="action-card">
            <div className="action-icon lend">
              <GiCorn />
            </div>
            <div className="action-info">
              <h4>My Lends</h4>
              <p>View loans you've given</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Farm Tips Section */}
      <div className="farm-tips">
        <div className="tip-card">
          <div className="tip-icon">🌾</div>
          <div className="tip-content">
            <h4>Crop Season Alert</h4>
            <p>Rabi season is approaching. Consider applying for a crop loan for wheat cultivation.</p>
          </div>
        </div>
        <div className="tip-card">
          <div className="tip-icon">💡</div>
          <div className="tip-content">
            <h4>Loan Tip</h4>
            <p>Repaying loans on time improves your credit score for future borrowings.</p>
          </div>
        </div>
        <div className="tip-card">
          <div className="tip-icon">📊</div>
          <div className="tip-content">
            <h4>Market Update</h4>
            <p>Tomato prices are up 15% this week. Good time to sell if you have stock!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
