import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { loanAPI, userAPI } from '../../api/axios';
import { toast } from 'react-toastify';

const LenderDashboard = () => {
  const { user, userId } = useAuth();
  const [loans, setLoans] = useState([]);
  const [allBorrowers, setAllBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [borrowerFilter, setBorrowerFilter] = useState('ALL');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch ALL loans from system (Admin access for lender)
      const [loansRes, usersRes] = await Promise.all([
        loanAPI.getAll(), // Get ALL loans in the system
        userAPI.getAll()  // Get all users for borrower filter
      ]);
      
      const allLoans = loansRes.data || [];
      const allUsers = usersRes.data || [];
      
      console.log('✅ Lender Dashboard - All System Loans:', allLoans);
      console.log('📊 Total loans in system:', allLoans.length);
      
      // Extract unique borrowers from loans
      const borrowers = [...new Map(
        allLoans
          .filter(loan => loan.borrower)
          .map(loan => [loan.borrower.userId, loan.borrower])
      ).values()];
      
      setAllBorrowers(borrowers);
      setLoans(allLoans);
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      toast.error('Failed to fetch loans data');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (loanId) => {
    if (!window.confirm('Approve this loan request?')) return;
    try {
      setActionLoading(loanId);
      await loanAPI.accept(loanId);
      toast.success('✅ Loan Approved!');
      fetchAllData();
    } catch (error) {
      console.error('❌ Error approving loan:', error);
      toast.error('Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (loanId) => {
    if (!window.confirm('Reject this loan request?')) return;
    try {
      setActionLoading(loanId);
      await loanAPI.reject(loanId);
      toast.success('Loan Rejected');
      fetchAllData();
    } catch (error) {
      console.error('❌ Error rejecting loan:', error);
      toast.error('Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter loans
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = !searchTerm ||
      loan.loanId?.toString().includes(searchTerm) ||
      loan.borrower?.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.borrower?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.lender?.userName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || 
      loan.status?.toUpperCase() === statusFilter;
    
    const matchesBorrower = borrowerFilter === 'ALL' ||
      loan.borrower?.userId?.toString() === borrowerFilter;

    return matchesSearch && matchesStatus && matchesBorrower;
  });

  // Status helpers
  const isPending = (status) => {
    const normalized = status?.toUpperCase().trim();
    return ['PENDING', 'PENDING_APPROVAL', 'REQUESTED'].includes(normalized);
  };

  const isActive = (status) => {
    const normalized = status?.toUpperCase().trim();
    return ['ACTIVE', 'APPROVED'].includes(normalized);
  };

  const isCompleted = (status, loan) => {
    const normalized = status?.toUpperCase().trim();
    if (['COMPLETED', 'PAID', 'CLOSED'].includes(normalized)) return true;
    if (loan.paidAmount !== undefined && loan.amount) {
      return loan.paidAmount >= loan.amount;
    }
    if (loan.remainingAmount !== undefined) {
      return loan.remainingAmount <= 0 && !isPending(status);
    }
    return false;
  };

  const formatMoney = (val) => '₹' + Number(val || 0).toLocaleString('en-IN');

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getProgress = (loan) => {
    if (!loan.amount) return 0;
    return Math.min(((loan.paidAmount || 0) / loan.amount) * 100, 100);
  };

  // Stats - All loans in system
  const stats = {
    total: loans.length,
    pending: loans.filter(l => isPending(l.status)).length,
    active: loans.filter(l => isActive(l.status)).length,
    completed: loans.filter(l => isCompleted(l.status, l)).length,
    rejected: loans.filter(l => ['REJECTED', 'DECLINED'].includes(l.status?.toUpperCase())).length,
    totalAmount: loans.reduce((sum, l) => sum + (l.amount || 0), 0),
    totalBorrowers: allBorrowers.length,
    // My lends (where current user is the lender)
    myLends: loans.filter(l => l.lender?.userId === userId).length,
    myPendingApprovals: loans.filter(l => l.lender?.userId === userId && isPending(l.status)).length,
  };

  const getStatusStyle = (status) => {
    const s = status?.toUpperCase().trim();
    switch (s) {
      case 'PENDING':
      case 'PENDING_APPROVAL':
      case 'REQUESTED':
        return { background: '#fef3c7', color: '#d97706' };
      case 'APPROVED':
      case 'ACTIVE':
        return { background: '#d1fae5', color: '#059669' };
      case 'REJECTED':
      case 'DECLINED':
        return { background: '#fee2e2', color: '#dc2626' };
      case 'COMPLETED':
      case 'PAID':
        return { background: '#dbeafe', color: '#2563eb' };
      default:
        return { background: '#f3f4f6', color: '#6b7280' };
    }
  };

  // Styles
  const styles = {
    page: {
      padding: '20px',
      maxWidth: '1600px',
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '16px',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1f2937',
      margin: 0,
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '14px',
      marginTop: '4px',
    },
    adminBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
      color: '#fff',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      marginLeft: '12px',
    },
    refreshBtn: {
      padding: '10px 20px',
      background: '#3b82f6',
      color: '#fff',
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(160px, 1fr))',
      gap: '16px',
      marginBottom: '24px',
    },
    statCard: {
      background: '#fff',
      padding: '20px',
      borderRadius: '14px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
    },
    statIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '22px',
    },
    statValue: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#1f2937',
    },
    statLabel: {
      fontSize: '12px',
      color: '#6b7280',
    },
    filterRow: {
      display: 'flex',
      gap: '12px',
      marginBottom: '20px',
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    searchBox: {
      display: 'flex',
      alignItems: 'center',
      background: '#fff',
      border: '2px solid #e5e7eb',
      borderRadius: '10px',
      padding: '0 14px',
      flex: '1',
      maxWidth: '350px',
    },
    searchInput: {
      flex: 1,
      padding: '12px 10px',
      border: 'none',
      outline: 'none',
      fontSize: '14px',
    },
    filterSelect: {
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '10px',
      fontSize: '14px',
      background: '#fff',
      cursor: 'pointer',
      minWidth: '140px',
    },
    loansGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
      gap: '20px',
    },
    loanCard: {
      background: '#fff',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
      border: '2px solid #f3f4f6',
      transition: 'all 0.2s',
    },
    loanCardPending: {
      borderColor: '#fbbf24',
      background: 'linear-gradient(to bottom, #fffbeb, #fff)',
    },
    loanCardMyLend: {
      borderColor: '#3b82f6',
      background: 'linear-gradient(to bottom, #eff6ff, #fff)',
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 20px',
      borderBottom: '1px solid #f3f4f6',
      background: '#f9fafb',
    },
    loanId: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#374151',
    },
    statusBadge: {
      padding: '5px 12px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    myLendBadge: {
      padding: '4px 8px',
      background: '#dbeafe',
      color: '#2563eb',
      borderRadius: '6px',
      fontSize: '10px',
      fontWeight: '700',
      marginLeft: '8px',
    },
    cardBody: {
      padding: '20px',
    },
    partiesSection: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginBottom: '18px',
    },
    partyBox: {
      padding: '14px',
      background: '#f9fafb',
      borderRadius: '12px',
    },
    partyLabel: {
      fontSize: '11px',
      color: '#6b7280',
      textTransform: 'uppercase',
      fontWeight: '600',
      marginBottom: '8px',
    },
    partyAvatar: {
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: '14px',
      fontWeight: '700',
    },
    partyName: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1f2937',
    },
    partyEmail: {
      fontSize: '12px',
      color: '#6b7280',
    },
    amountSection: {
      textAlign: 'center',
      padding: '16px',
      background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
      borderRadius: '12px',
      marginBottom: '16px',
    },
    amountLabel: {
      fontSize: '12px',
      color: '#6b7280',
      textTransform: 'uppercase',
      marginBottom: '6px',
      fontWeight: '600',
    },
    amountValue: {
      fontSize: '28px',
      fontWeight: '800',
      color: '#059669',
    },
    tenure: {
      fontSize: '13px',
      color: '#6b7280',
      marginTop: '8px',
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: '1px solid #f3f4f6',
      fontSize: '14px',
    },
    progressSection: {
      marginTop: '16px',
      padding: '14px',
      background: '#f9fafb',
      borderRadius: '10px',
    },
    progressHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '12px',
      color: '#6b7280',
      marginBottom: '8px',
      fontWeight: '600',
    },
    progressBar: {
      height: '8px',
      background: '#e5e7eb',
      borderRadius: '4px',
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #10b981, #059669)',
      borderRadius: '4px',
      transition: 'width 0.3s',
    },
    cardFooter: {
      padding: '16px 20px',
      borderTop: '1px solid #f3f4f6',
      background: '#fafafa',
    },
    actionButtons: {
      display: 'flex',
      gap: '10px',
    },
    btnApprove: {
      flex: 1,
      padding: '12px 16px',
      background: '#10b981',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
    },
    btnReject: {
      flex: 1,
      padding: '12px 16px',
      background: '#fff',
      color: '#ef4444',
      border: '2px solid #fecaca',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
    },
    statusMessage: {
      textAlign: 'center',
      padding: '10px',
      color: '#6b7280',
      fontSize: '13px',
      fontWeight: '500',
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 40px',
      background: '#fff',
      borderRadius: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    },
    loading: {
      textAlign: 'center',
      padding: '60px',
    },
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <p style={{ fontSize: '18px', color: '#6b7280' }}>⏳ Loading all loans...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            💰 Lender Dashboard
            <span style={styles.adminBadge}>
              👑 Full Access
            </span>
          </h1>
          <p style={styles.subtitle}>
            View and manage ALL loans from ALL borrowers in the system
          </p>
        </div>
        <button
          style={styles.refreshBtn}
          onClick={fetchAllData}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats - All System Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#dbeafe' }}>📊</div>
          <div>
            <div style={styles.statValue}>{stats.total}</div>
            <div style={styles.statLabel}>Total Loans (System)</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#e0e7ff' }}>👥</div>
          <div>
            <div style={styles.statValue}>{stats.totalBorrowers}</div>
            <div style={styles.statLabel}>Total Borrowers</div>
          </div>
        </div>
        <div style={{ ...styles.statCard, border: stats.pending > 0 ? '2px solid #fbbf24' : 'none' }}>
          <div style={{ ...styles.statIcon, background: '#fef3c7' }}>⏳</div>
          <div>
            <div style={styles.statValue}>{stats.pending}</div>
            <div style={styles.statLabel}>Pending Approval</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#d1fae5' }}>✅</div>
          <div>
            <div style={styles.statValue}>{stats.active}</div>
            <div style={styles.statLabel}>Active Loans</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#dbeafe' }}>🎉</div>
          <div>
            <div style={styles.statValue}>{stats.completed}</div>
            <div style={styles.statLabel}>Completed</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#fee2e2' }}>❌</div>
          <div>
            <div style={styles.statValue}>{stats.rejected}</div>
            <div style={styles.statLabel}>Rejected</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#f0fdf4' }}>💵</div>
          <div>
            <div style={styles.statValue}>{formatMoney(stats.totalAmount)}</div>
            <div style={styles.statLabel}>Total Loan Amount</div>
          </div>
        </div>
        <div style={{ ...styles.statCard, border: '2px solid #3b82f6' }}>
          <div style={{ ...styles.statIcon, background: '#dbeafe' }}>🏦</div>
          <div>
            <div style={styles.statValue}>{stats.myLends}</div>
            <div style={styles.statLabel}>My Lends</div>
          </div>
        </div>
      </div>

      {/* My Pending Approvals Alert */}
      {stats.myPendingApprovals > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
          border: '2px solid #fbbf24',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize: '24px' }}>⚠️</span>
          <div>
            <strong style={{ color: '#92400e' }}>
              You have {stats.myPendingApprovals} pending loan request(s) to review!
            </strong>
            <p style={{ margin: '4px 0 0 0', color: '#a16207', fontSize: '13px' }}>
              These are loans where you are the lender and need to approve/reject.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={styles.filterRow}>
        <div style={styles.searchBox}>
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search by ID, borrower, lender..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="ALL">All Status</option>
          {/* <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option> */}
          <option value="ACTIVE">Active</option>
          <option value="REJECTED">Rejected</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <select
          value={borrowerFilter}
          onChange={(e) => setBorrowerFilter(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="ALL">All Borrowers</option>
          {allBorrowers.map(borrower => (
            <option key={borrower.userId} value={borrower.userId}>
              {borrower.userName}
            </option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p style={{ marginBottom: '16px', color: '#6b7280', fontSize: '14px' }}>
        Showing <strong>{filteredLoans.length}</strong> of <strong>{loans.length}</strong> loans
      </p>

      {/* Loans Grid */}
      {filteredLoans.length > 0 ? (
        <div style={styles.loansGrid}>
          {filteredLoans.map((loan) => {
            const pending = isPending(loan.status);
            const active = isActive(loan.status);
            const isMyLend = loan.lender?.userId === userId;
            const canTakeAction = isMyLend && pending;
            const isLoading = actionLoading === loan.loanId;

            return (
              <div
                key={loan.loanId}
                style={{
                  ...styles.loanCard,
                  ...(pending ? styles.loanCardPending : {}),
                  ...(isMyLend && !pending ? styles.loanCardMyLend : {}),
                }}
              >
                {/* Card Header */}
                <div style={styles.cardHeader}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={styles.loanId}>Loan #{loan.loanId}</span>
                    {isMyLend && (
                      <span style={styles.myLendBadge}>MY LEND</span>
                    )}
                  </div>
                  <span style={{ ...styles.statusBadge, ...getStatusStyle(loan.status) }}>
                    {loan.status || 'UNKNOWN'}
                  </span>
                </div>

                {/* Card Body */}
                <div style={styles.cardBody}>
                  {/* Borrower & Lender */}
                  <div style={styles.partiesSection}>
                    <div style={styles.partyBox}>
                      <div style={styles.partyLabel}>👤 Borrower</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ 
                          ...styles.partyAvatar, 
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)' 
                        }}>
                          {loan.borrower?.userName?.charAt(0).toUpperCase() || 'B'}
                        </div>
                        <div>
                          <div style={styles.partyName}>
                            {loan.borrower?.userName || 'Unknown'}
                          </div>
                          <div style={styles.partyEmail}>
                            {loan.borrower?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={styles.partyBox}>
                      <div style={styles.partyLabel}>🏦 Lender</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ 
                          ...styles.partyAvatar, 
                          background: isMyLend 
                            ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' 
                            : 'linear-gradient(135deg, #6b7280, #4b5563)' 
                        }}>
                          {loan.lender?.userName?.charAt(0).toUpperCase() || 'L'}
                        </div>
                        <div>
                          <div style={styles.partyName}>
                            {loan.lender?.userName || 'Unknown'}
                            {isMyLend && <span style={{ color: '#3b82f6' }}> (You)</span>}
                          </div>
                          <div style={styles.partyEmail}>
                            {loan.lender?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div style={styles.amountSection}>
                    <div style={styles.amountLabel}>Loan Amount</div>
                    <div style={styles.amountValue}>{formatMoney(loan.amount)}</div>
                    <div style={styles.tenure}>📅 {loan.tenure} months tenure</div>
                  </div>

                  {/* Info Rows */}
                  <div style={styles.infoRow}>
                    <span style={{ color: '#6b7280' }}>Monthly EMI</span>
                    <strong>{formatMoney(Math.round(loan.amount / loan.tenure))}</strong>
                  </div>
                  <div style={{ ...styles.infoRow, borderBottom: 'none' }}>
                    <span style={{ color: '#6b7280' }}>Request Date</span>
                    <span>{formatDate(loan.createdAt || loan.requestDate)}</span>
                  </div>

                  {/* Progress for active loans */}
                  {active && (
                    <div style={styles.progressSection}>
                      <div style={styles.progressHeader}>
                        <span>Repayment Progress</span>
                        <span style={{ fontWeight: '700' }}>
                          {Math.round(getProgress(loan))}%
                        </span>
                      </div>
                      <div style={styles.progressBar}>
                        <div
                          style={{
                            ...styles.progressFill,
                            width: `${getProgress(loan)}%`,
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px', textAlign: 'center' }}>
                        {formatMoney(loan.paidAmount || 0)} / {formatMoney(loan.amount)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer with Actions */}
                <div style={styles.cardFooter}>
                  {canTakeAction ? (
                    <div style={styles.actionButtons}>
                      <button
                        style={{
                          ...styles.btnApprove,
                          opacity: isLoading ? 0.6 : 1,
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                        }}
                        onClick={() => handleAccept(loan.loanId)}
                        disabled={isLoading}
                      >
                        {isLoading ? '⏳ Processing...' : '✓ Approve'}
                      </button>
                      <button
                        style={{
                          ...styles.btnReject,
                          opacity: isLoading ? 0.6 : 1,
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                        }}
                        onClick={() => handleReject(loan.loanId)}
                        disabled={isLoading}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  ) : (
                    <div style={styles.statusMessage}>
                      {pending && !isMyLend && '⏳ Waiting for lender approval'}
                      {loan.status?.toUpperCase() === 'APPROVED' && '✅ Loan approved'}
                      {loan.status?.toUpperCase() === 'ACTIVE' && '💰 Loan is active'}
                      {['REJECTED', 'DECLINED'].includes(loan.status?.toUpperCase()) && '❌ Loan rejected'}
                      {isCompleted(loan.status, loan) && '🎉 Loan completed'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>📭</p>
          <h3 style={{ color: '#1f2937', marginBottom: '8px', fontSize: '20px', fontWeight: '600' }}>
            No Loans Found
          </h3>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            {searchTerm || statusFilter !== 'ALL' || borrowerFilter !== 'ALL'
              ? 'Try adjusting your filters to see more results'
              : 'No loans exist in the system yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default LenderDashboard;