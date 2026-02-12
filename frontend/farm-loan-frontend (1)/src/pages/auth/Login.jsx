import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { loanAPI, userAPI } from '../../api/axios';
import { 
  FiDollarSign, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiRefreshCw,
  FiFilter,
  FiSearch,
  FiPlus,
  FiX,
  FiAlertCircle,
  FiUser,
  FiCalendar,
  FiPercent
} from 'react-icons/fi';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import './Loans.css';

const Loans = () => {
  const { user, userId } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Modal states
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  
  // Request loan form
  const [lenders, setLenders] = useState([]);
  const [loanForm, setLoanForm] = useState({
    lenderId: '',
    amount: '',
    tenure: ''
  });
  
  // Repay form
  const [repayAmount, setRepayAmount] = useState('');

  const tabs = [
    { id: 'all', label: 'All Loans', icon: <FiDollarSign /> },
    { id: 'borrows', label: 'My Borrows', icon: <FiTrendingDown /> },
    { id: 'lends', label: 'My Lends', icon: <FiTrendingUp /> },
  ];

  const statuses = ['ALL', 'PENDING', 'APPROVED', 'ACTIVE', 'REJECTED', 'COMPLETED'];

  useEffect(() => {
    fetchLoans();
    fetchLenders();
  }, [activeTab, userId]);

  useEffect(() => {
    filterLoans();
  }, [loans, searchTerm, statusFilter]);

  const fetchLoans = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      let response;
      
      switch (activeTab) {
        case 'borrows':
          response = await loanAPI.getMyBorrows(userId);
          break;
        case 'lends':
          response = await loanAPI.getMyLends(userId);
          break;
        default:
          response = await loanAPI.getByUser(userId);
      }
      
      setLoans(response.data || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
      toast.error('Failed to fetch loans');
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLenders = async () => {
    try {
      const response = await userAPI.getAll();
      // Filter out current user from lenders list
      const availableLenders = (response.data || []).filter(u => u.userId !== userId);
      setLenders(availableLenders);
    } catch (error) {
      console.error('Error fetching lenders:', error);
    }
  };

  const filterLoans = () => {
    let result = [...loans];

    if (searchTerm) {
      result = result.filter(loan =>
        loan.loanId?.toString().includes(searchTerm) ||
        loan.borrower?.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.lender?.userName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(loan => loan.status === statusFilter);
    }

    setFilteredLoans(result);
  };

  // Accept Loan (Lender action)
  const handleAcceptLoan = async (loanId) => {
    try {
      setActionLoading(loanId);
      await loanAPI.accept(loanId);
      toast.success('Loan accepted successfully!');
      fetchLoans();
    } catch (error) {
      console.error('Error accepting loan:', error);
      toast.error('Failed to accept loan');
    } finally {
      setActionLoading(null);
    }
  };

  // Reject Loan (Lender action)
  const handleRejectLoan = async (loanId) => {
    try {
      setActionLoading(loanId);
      await loanAPI.reject(loanId);
      toast.success('Loan rejected');
      fetchLoans();
    } catch (error) {
      console.error('Error rejecting loan:', error);
      toast.error('Failed to reject loan');
    } finally {
      setActionLoading(null);
    }
  };

  // Request New Loan
  const handleRequestLoan = async (e) => {
    e.preventDefault();
    
    if (!loanForm.lenderId || !loanForm.amount || !loanForm.tenure) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setActionLoading('request');
      await loanAPI.request(
        userId,
        parseInt(loanForm.lenderId),
        parseFloat(loanForm.amount),
        parseInt(loanForm.tenure)
      );
      toast.success('Loan request submitted successfully!');
      setShowRequestModal(false);
      setLoanForm({ lenderId: '', amount: '', tenure: '' });
      fetchLoans();
    } catch (error) {
      console.error('Error requesting loan:', error);
      toast.error('Failed to submit loan request');
    } finally {
      setActionLoading(null);
    }
  };

  // Repay Loan
  const handleRepayLoan = async (e) => {
    e.preventDefault();
    
    if (!repayAmount || parseFloat(repayAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setActionLoading('repay');
      await loanAPI.repay(
        selectedLoan.loanId,
        userId,
        parseFloat(repayAmount)
      );
      toast.success('Repayment successful!');
      setShowRepayModal(false);
      setSelectedLoan(null);
      setRepayAmount('');
      fetchLoans();
    } catch (error) {
      console.error('Error repaying loan:', error);
      toast.error('Failed to process repayment');
    } finally {
      setActionLoading(null);
    }
  };

  const openRepayModal = (loan) => {
    setSelectedLoan(loan);
    setRepayAmount('');
    setShowRepayModal(true);
  };

  const getStatusConfig = (status) => {
    const configs = {
      PENDING: { class: 'status-pending', icon: <FiClock />, color: '#f59e0b' },
      APPROVED: { class: 'status-approved', icon: <FiCheckCircle />, color: '#10b981' },
      ACTIVE: { class: 'status-active', icon: <FiTrendingUp />, color: '#3b82f6' },
      REJECTED: { class: 'status-rejected', icon: <FiXCircle />, color: '#ef4444' },
      COMPLETED: { class: 'status-completed', icon: <FiCheckCircle />, color: '#059669' },
    };
    return configs[status] || { class: 'status-default', icon: <FiAlertCircle />, color: '#6b7280' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Calculate loan stats
  const loanStats = {
    total: loans.length,
    pending: loans.filter(l => l.status === 'PENDING').length,
    active: loans.filter(l => l.status === 'ACTIVE' || l.status === 'APPROVED').length,
    totalAmount: loans.reduce((sum, l) => sum + (l.amount || 0), 0),
  };

  if (loading) {
    return <Loader size="large" text="Loading loans..." />;
  }

  return (
    <div className="loans-page">
      {/* Page Header */}
      <div className="loans-header">
        <div className="header-left">
          <h1>Loan Management</h1>
          <p>Manage your loans, borrowings and lendings</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchLoans}>
            <FiRefreshCw />
            Refresh
          </button>
          <button className="btn btn-primary" onClick={() => setShowRequestModal(true)}>
            <FiPlus />
            Request Loan
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="loan-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <FiDollarSign />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Loans</span>
            <h3>{loanStats.total}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <FiClock />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pending</span>
            <h3>{loanStats.pending}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <FiTrendingUp />
          </div>
          <div className="stat-info">
            <span className="stat-label">Active</span>
            <h3>{loanStats.active}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amount">
            <FiDollarSign />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Amount</span>
            <h3>{formatCurrency(loanStats.totalAmount)}</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="loans-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="loans-filters">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by ID, borrower or lender..."
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
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'ALL' ? 'All Status' : status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loans List */}
      {filteredLoans.length > 0 ? (
        <div className="loans-list">
          {filteredLoans.map(loan => {
            const statusConfig = getStatusConfig(loan.status);
            const isBorrower = loan.borrower?.userId === userId;
            const isLender = loan.lender?.userId === userId;
            const canAcceptReject = isLender && loan.status === 'PENDING';
            const canRepay = isBorrower && (loan.status === 'ACTIVE' || loan.status === 'APPROVED');

            return (
              <div key={loan.loanId} className="loan-card">
                <div className="loan-card-header">
                  <div className="loan-id">
                    <span className="id-label">Loan ID</span>
                    <span className="id-value">#{loan.loanId}</span>
                  </div>
                  <span className={`loan-status ${statusConfig.class}`}>
                    {statusConfig.icon}
                    {loan.status}
                  </span>
                </div>

                <div className="loan-card-body">
                  <div className="loan-amount-section">
                    <span className="amount-label">Loan Amount</span>
                    <h2 className="amount-value">{formatCurrency(loan.amount)}</h2>
                    <div className="loan-tenure">
                      <FiCalendar />
                      <span>{loan.tenure} months tenure</span>
                    </div>
                  </div>

                  <div className="loan-parties">
                    <div className="party borrower">
                      <span className="party-label">Borrower</span>
                      <div className="party-info">
                        <div className="party-avatar">
                          {loan.borrower?.userName?.charAt(0) || 'B'}
                        </div>
                        <div className="party-details">
                          <span className="party-name">
                            {loan.borrower?.userName || 'Unknown'}
                            {isBorrower && <span className="you-badge">You</span>}
                          </span>
                          <span className="party-email">{loan.borrower?.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="party-arrow">→</div>

                    <div className="party lender">
                      <span className="party-label">Lender</span>
                      <div className="party-info">
                        <div className="party-avatar lender">
                          {loan.lender?.userName?.charAt(0) || 'L'}
                        </div>
                        <div className="party-details">
                          <span className="party-name">
                            {loan.lender?.userName || 'Unknown'}
                            {isLender && <span className="you-badge">You</span>}
                          </span>
                          <span className="party-email">{loan.lender?.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Loan Progress (for active loans) */}
                  {(loan.status === 'ACTIVE' || loan.status === 'APPROVED') && loan.paidAmount !== undefined && (
                    <div className="loan-progress">
                      <div className="progress-header">
                        <span>Repayment Progress</span>
                        <span>{formatCurrency(loan.paidAmount || 0)} / {formatCurrency(loan.amount)}</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${((loan.paidAmount || 0) / loan.amount) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Interest Rate if available */}
                  {loan.interestRate && (
                    <div className="loan-interest">
                      <FiPercent />
                      <span>{loan.interestRate}% Interest Rate</span>
                    </div>
                  )}
                </div>

                <div className="loan-card-footer">
                  <div className="loan-date">
                    <FiCalendar />
                    <span>Created: {formatDate(loan.createdAt)}</span>
                  </div>

                  <div className="loan-actions">
                    {/* Lender Actions */}
                    {canAcceptReject && (
                      <>
                        <button
                          className="action-btn accept"
                          onClick={() => handleAcceptLoan(loan.loanId)}
                          disabled={actionLoading === loan.loanId}
                        >
                          {actionLoading === loan.loanId ? (
                            <FiRefreshCw className="spin" />
                          ) : (
                            <FiCheckCircle />
                          )}
                          Accept
                        </button>
                        <button
                          className="action-btn reject"
                          onClick={() => handleRejectLoan(loan.loanId)}
                          disabled={actionLoading === loan.loanId}
                        >
                          <FiXCircle />
                          Reject
                        </button>
                      </>
                    )}

                    {/* Borrower Actions */}
                    {canRepay && (
                      <button
                        className="action-btn repay"
                        onClick={() => openRepayModal(loan)}
                      >
                        <FiDollarSign />
                        Repay
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-loans">
          <div className="empty-icon">
            <FiDollarSign />
          </div>
          <h3>No Loans Found</h3>
          <p>
            {activeTab === 'borrows' 
              ? "You haven't borrowed any loans yet" 
              : activeTab === 'lends' 
                ? "You haven't lent any loans yet" 
                : "No loans match your criteria"}
          </p>
          <button className="btn btn-primary" onClick={() => setShowRequestModal(true)}>
            <FiPlus />
            Request a Loan
          </button>
        </div>
      )}

      {/* Request Loan Modal */}
      {showRequestModal && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <FiPlus />
                Request New Loan
              </h2>
              <button className="modal-close" onClick={() => setShowRequestModal(false)}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleRequestLoan} className="modal-body">
              <div className="form-group">
                <label className="form-label">Select Lender</label>
                <select
                  className="form-input"
                  value={loanForm.lenderId}
                  onChange={(e) => setLoanForm({ ...loanForm, lenderId: e.target.value })}
                  required
                >
                  <option value="">Choose a lender...</option>
                  {lenders.map(lender => (
                    <option key={lender.userId} value={lender.userId}>
                      {lender.userName} ({lender.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Loan Amount (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Enter amount"
                  value={loanForm.amount}
                  onChange={(e) => setLoanForm({ ...loanForm, amount: e.target.value })}
                  min="1000"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tenure (Months)</label>
                <select
                  className="form-input"
                  value={loanForm.tenure}
                  onChange={(e) => setLoanForm({ ...loanForm, tenure: e.target.value })}
                  required
                >
                  <option value="">Select tenure...</option>
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                  <option value="18">18 Months</option>
                  <option value="24">24 Months</option>
                  <option value="36">36 Months</option>
                </select>
              </div>

              {loanForm.amount && loanForm.tenure && (
                <div className="loan-summary">
                  <h4>Loan Summary</h4>
                  <div className="summary-row">
                    <span>Principal Amount</span>
                    <span>{formatCurrency(loanForm.amount)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tenure</span>
                    <span>{loanForm.tenure} months</span>
                  </div>
                  <div className="summary-row">
                    <span>Monthly EMI (approx.)</span>
                    <span>{formatCurrency(loanForm.amount / loanForm.tenure)}</span>
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowRequestModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={actionLoading === 'request'}
                >
                  {actionLoading === 'request' ? (
                    <>
                      <FiRefreshCw className="spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FiPlus />
                      Submit Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Repay Modal */}
      {showRepayModal && selectedLoan && (
        <div className="modal-overlay" onClick={() => setShowRepayModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <FiDollarSign />
                Repay Loan #{selectedLoan.loanId}
              </h2>
              <button className="modal-close" onClick={() => setShowRepayModal(false)}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleRepayLoan} className="modal-body">
              <div className="repay-info">
                <div className="info-row">
                  <span>Loan Amount</span>
                  <span className="value">{formatCurrency(selectedLoan.amount)}</span>
                </div>
                <div className="info-row">
                  <span>Amount Paid</span>
                  <span className="value">{formatCurrency(selectedLoan.paidAmount || 0)}</span>
                </div>
                <div className="info-row highlight">
                  <span>Remaining Amount</span>
                  <span className="value">
                    {formatCurrency(selectedLoan.amount - (selectedLoan.paidAmount || 0))}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Repayment Amount (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Enter amount to repay"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  max={selectedLoan.amount - (selectedLoan.paidAmount || 0)}
                  min="1"
                  required
                />
              </div>

              <div className="quick-amounts">
                <span>Quick Select:</span>
                <button 
                  type="button"
                  onClick={() => setRepayAmount((selectedLoan.amount / selectedLoan.tenure).toFixed(0))}
                >
                  1 EMI
                </button>
                <button 
                  type="button"
                  onClick={() => setRepayAmount((selectedLoan.amount / 2).toFixed(0))}
                >
                  50%
                </button>
                <button 
                  type="button"
                  onClick={() => setRepayAmount((selectedLoan.amount - (selectedLoan.paidAmount || 0)).toFixed(0))}
                >
                  Full
                </button>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowRepayModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={actionLoading === 'repay'}
                >
                  {actionLoading === 'repay' ? (
                    <>
                      <FiRefreshCw className="spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiDollarSign />
                      Repay {repayAmount && formatCurrency(repayAmount)}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loans;