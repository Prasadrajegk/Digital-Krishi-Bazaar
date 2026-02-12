import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { loanAPI } from '../../api/axios';
import { toast } from 'react-toastify';
import { paymentAPI } from "../../api/paymentAPI";


const BorrowerDashboard = () => {
  const { userId } = useAuth();
  const [loans, setLoans] = useState([]);
  const [allLenders, setAllLenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [lenderFilter, setLenderFilter] = useState('ALL');

  // Repay Modal State
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [repayAmount, setRepayAmount] = useState('');

  useEffect(() => {
    if (userId) {
      fetchAllData();
    }
  }, [userId]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const loansRes = await loanAPI.getMyBorrows(userId);
      const myLoans = loansRes.data || [];

      console.log('✅ Borrower Dashboard - My Loans:', myLoans);
      console.log('📊 Total loans borrowed:', myLoans.length);

      const lenders = [...new Map(
        myLoans
          .filter(loan => loan.lender)
          .map(loan => [loan.lender.userId, loan.lender])
      ).values()];

      setAllLenders(lenders);
      setLoans(myLoans);
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      toast.error('Failed to fetch loans data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRepay = (loan) => {
    setSelectedLoan(loan);
    setRepayAmount('');
    setShowRepayModal(true);
  };

  const handleCloseRepay = () => {
    setShowRepayModal(false);
    setSelectedLoan(null);
    setRepayAmount('');
  };

const handleRepay = async () => {
  const amount = Number(repayAmount); // ₹27,500 (RUPEES)

  if (!amount || amount <= 0) {
    toast.error("Enter valid amount");
    return;
  }

  if (amount > 500000) {
    toast.error("Max ₹5,00,000 allowed per payment");
    return;
  }

  try {
    setActionLoading(selectedLoan.loanId);

    // ✅ SEND RUPEES ONLY (NO *100 here)
    const orderRes = await paymentAPI.createOrder(amount);
    const order = orderRes.data;

    // 🔎 DEBUG (keep for now)
    console.log("UI amount (₹):", amount);
    console.log("Order amount (paise):", order.amount);

    const options = {
      key: "rzp_test_SBHR3w7VbJPV3p",
      amount: order.amount,      // ✅ paise from backend
      currency: "INR",
      name: "Digital Krishi Bazaar",
      description: "Loan Repayment",
      order_id: order.id,

      handler: async (response) => {
        await paymentAPI.verifyPayment({
          loanId: selectedLoan.loanId,
          userId,
          amount, // ✅ RUPEES
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        });

        toast.success("Payment successful");
        fetchAllData();
      },

      theme: { color: "#10b981" },
    };

    new window.Razorpay(options).open();

  } catch (err) {
    console.error("Payment error:", err);
    toast.error("Payment failed");
  } finally {
    setActionLoading(null);
  }
};


  // Filter loans
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = !searchTerm ||
      loan.loanId?.toString().includes(searchTerm) ||
      loan.lender?.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.lender?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || 
      loan.status?.toUpperCase() === statusFilter;
    
    const matchesLender = lenderFilter === 'ALL' ||
      loan.lender?.userId?.toString() === lenderFilter;

    return matchesSearch && matchesStatus && matchesLender;
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

  const getRemainingAmount = (loan) => {
    if (loan.remainingAmount !== undefined) return loan.remainingAmount;
    return Math.max(0, (loan.amount || 0) - (loan.paidAmount || 0));
  };

  // Stats
  const stats = {
    total: loans.length,
    pending: loans.filter(l => isPending(l.status)).length,
    active: loans.filter(l => isActive(l.status)).length,
    completed: loans.filter(l => isCompleted(l.status, l)).length,
    rejected: loans.filter(l => ['REJECTED', 'DECLINED'].includes(l.status?.toUpperCase())).length,
    totalBorrowed: loans.reduce((sum, l) => sum + (l.amount || 0), 0),
    totalPaid: loans.reduce((sum, l) => sum + (l.paidAmount || 0), 0),
    totalRemaining: loans.reduce((sum, l) => sum + getRemainingAmount(l), 0),
    totalLenders: allLenders.length,
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

  // Styles (matching LenderDashboard)
  const styles = {
    page: {
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
    loanCardActive: {
      borderColor: '#10b981',
      background: 'linear-gradient(to bottom, #f0fdf4, #fff)',
    },
    loanCardCompleted: {
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
    cardBody: {
      padding: '20px',
    },
    lenderSection: {
      padding: '14px',
      background: '#f9fafb',
      borderRadius: '12px',
      marginBottom: '18px',
    },
    sectionLabel: {
      fontSize: '11px',
      color: '#6b7280',
      textTransform: 'uppercase',
      fontWeight: '600',
      marginBottom: '10px',
    },
    lenderInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    lenderAvatar: {
      width: '42px',
      height: '42px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #6b7280, #4b5563)',
      color: '#fff',
      fontSize: '16px',
      fontWeight: '700',
    },
    lenderName: {
      fontSize: '15px',
      fontWeight: '600',
      color: '#1f2937',
    },
    lenderEmail: {
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
    btnRepay: {
      width: '100%',
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
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modal: {
      background: '#fff',
      borderRadius: '20px',
      width: '100%',
      maxWidth: '480px',
      maxHeight: '90vh',
      overflow: 'hidden',
    },
    modalHeader: {
      padding: '20px 24px',
      borderBottom: '1px solid #f3f4f6',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: '#f9fafb',
    },
    modalTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#1f2937',
      margin: 0,
    },
    modalClose: {
      width: '32px',
      height: '32px',
      border: 'none',
      background: '#fff',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '18px',
      color: '#6b7280',
    },
    modalBody: {
      padding: '24px',
    },
    modalInfoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid #f3f4f6',
    },
    modalLabel: {
      color: '#6b7280',
      fontSize: '14px',
    },
    modalValue: {
      fontWeight: '600',
      color: '#1f2937',
      fontSize: '14px',
    },
    formGroup: {
      marginTop: '20px',
    },
    formLabel: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px',
    },
    formInput: {
      width: '100%',
      padding: '12px 14px',
      border: '2px solid #e5e7eb',
      borderRadius: '10px',
      fontSize: '14px',
      outline: 'none',
    },
    quickAmounts: {
      display: 'flex',
      gap: '8px',
      marginTop: '12px',
    },
    quickBtn: {
      flex: 1,
      padding: '8px 12px',
      background: '#f3f4f6',
      border: 'none',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      color: '#374151',
    },
    modalActions: {
      display: 'flex',
      gap: '12px',
      marginTop: '24px',
    },
    btnCancel: {
      flex: 1,
      padding: '12px',
      background: '#fff',
      border: '2px solid #e5e7eb',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      color: '#6b7280',
    },
    btnSubmit: {
      flex: 1,
      padding: '12px',
      background: '#10b981',
      border: 'none',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      color: '#fff',
    },
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <p style={{ fontSize: '18px', color: '#6b7280' }}>⏳ Loading your loans...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ flex: 1 }}>
          <p style={styles.subtitle}>
            Track and manage all your borrowed loans
          </p>
        </div>
        <button style={styles.refreshBtn} onClick={fetchAllData}>
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#dbeafe' }}>📊</div>
          <div>
            <div style={styles.statValue}>{stats.total}</div>
            <div style={styles.statLabel}>Total Loans</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#e0e7ff' }}>🏦</div>
          <div>
            <div style={styles.statValue}>{stats.totalLenders}</div>
            <div style={styles.statLabel}>Lenders</div>
          </div>
        </div>

        <div style={{ ...styles.statCard, border: stats.pending > 0 ? '2px solid #fbbf24' : 'none' }}>
          <div style={{ ...styles.statIcon, background: '#fef3c7' }}>⏳</div>
          <div>
            <div style={styles.statValue}>{stats.pending}</div>
            <div style={styles.statLabel}>Pending</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#d1fae5' }}>✅</div>
          <div>
            <div style={styles.statValue}>{stats.active}</div>
            <div style={styles.statLabel}>Active</div>
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
            <div style={styles.statValue}>{formatMoney(stats.totalBorrowed)}</div>
            <div style={styles.statLabel}>Total Borrowed</div>
          </div>
        </div>

        <div style={{ ...styles.statCard, border: stats.totalRemaining > 0 ? '2px solid #fbbf24' : '2px solid #10b981' }}>
          <div style={{ ...styles.statIcon, background: stats.totalRemaining > 0 ? '#fef3c7' : '#d1fae5' }}>💰</div>
          <div>
            <div style={styles.statValue}>{formatMoney(stats.totalRemaining)}</div>
            <div style={styles.statLabel}>Remaining</div>
          </div>
        </div>
      </div>

      {/* Alert if active loans with remaining balance */}
      {stats.active > 0 && stats.totalRemaining > 0 && (
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
          <span style={{ fontSize: '24px' }}>💡</span>
          <div>
            <strong style={{ color: '#92400e' }}>
              You have {stats.active} active loan(s) with {formatMoney(stats.totalRemaining)} remaining
            </strong>
            <p style={{ margin: '4px 0 0 0', color: '#a16207', fontSize: '13px' }}>
              Make timely repayments to maintain a good credit score!
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
            placeholder="Search by ID, lender..."
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
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="ACTIVE">Active</option>
          <option value="REJECTED">Rejected</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <select
          value={lenderFilter}
          onChange={(e) => setLenderFilter(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="ALL">All Lenders</option>
          {allLenders.map(lender => (
            <option key={lender.userId} value={lender.userId}>
              {lender.userName}
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
            const completed = isCompleted(loan.status, loan);
            const canRepay = active && !completed;
            const remaining = getRemainingAmount(loan);
            const progress = getProgress(loan);
            const isLoading = actionLoading === loan.loanId;

            let cardStyle = { ...styles.loanCard };
            if (active && !completed) cardStyle = { ...cardStyle, ...styles.loanCardActive };
            else if (completed) cardStyle = { ...cardStyle, ...styles.loanCardCompleted };

            return (
              <div key={loan.loanId} style={cardStyle}>
                {/* Card Header */}
                <div style={styles.cardHeader}>
                  <span style={styles.loanId}>Loan #{loan.loanId}</span>
                  <span style={{ ...styles.statusBadge, ...getStatusStyle(completed ? 'COMPLETED' : loan.status) }}>
                    {completed ? 'COMPLETED' : loan.status || 'UNKNOWN'}
                  </span>
                </div>

                {/* Card Body */}
                <div style={styles.cardBody}>
                  {/* Lender Info */}
                  <div style={styles.lenderSection}>
                    <div style={styles.sectionLabel}>🏦 Lender</div>
                    <div style={styles.lenderInfo}>
                      <div style={styles.lenderAvatar}>
                        {loan.lender?.userName?.charAt(0).toUpperCase() || 'L'}
                      </div>
                      <div>
                        <div style={styles.lenderName}>{loan.lender?.userName || 'Unknown'}</div>
                        <div style={styles.lenderEmail}>{loan.lender?.email || 'N/A'}</div>
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
                  {(active || completed) && (
                    <div style={styles.progressSection}>
                      <div style={styles.progressHeader}>
                        <span>Repayment Progress</span>
                        <span style={{ fontWeight: '700' }}>
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div style={styles.progressBar}>
                        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px', textAlign: 'center' }}>
                        {formatMoney(loan.paidAmount || 0)} / {formatMoney(loan.amount)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div style={styles.cardFooter}>
                  {canRepay && remaining > 0 ? (
                    <button
                      style={{
                        ...styles.btnRepay,
                        opacity: isLoading ? 0.6 : 1,
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                      }}
                      onClick={() => handleOpenRepay(loan)}
                      disabled={isLoading}
                    >
                      {isLoading ? '⏳ Processing...' : '💰 Make Repayment'}
                    </button>
                  ) : (
                    <div style={styles.statusMessage}>
                      {pending && '⏳ Waiting for lender approval'}
                      {completed && '🎉 Loan fully repaid!'}
                      {['REJECTED', 'DECLINED'].includes(loan.status?.toUpperCase()) && '❌ Loan rejected'}
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
            {searchTerm || statusFilter !== 'ALL' || lenderFilter !== 'ALL'
              ? 'Try adjusting your filters to see more results'
              : "You haven't borrowed any loans yet"}
          </p>
        </div>
      )}

      {/* Repay Modal */}
      {showRepayModal && selectedLoan && (
        <div style={styles.modalOverlay} onClick={handleCloseRepay}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>💰 Make Repayment</h3>
              <button style={styles.modalClose} onClick={handleCloseRepay}>✕</button>
            </div>

            <div style={styles.modalBody}>
              {/* Loan Info */}
              <div>
                <div style={styles.modalInfoRow}>
                  <span style={styles.modalLabel}>Loan ID</span>
                  <span style={styles.modalValue}>#{selectedLoan.loanId}</span>
                </div>
                <div style={styles.modalInfoRow}>
                  <span style={styles.modalLabel}>Loan Amount</span>
                  <span style={styles.modalValue}>{formatMoney(selectedLoan.amount)}</span>
                </div>
                <div style={styles.modalInfoRow}>
                  <span style={styles.modalLabel}>Amount Paid</span>
                  <span style={styles.modalValue}>{formatMoney(selectedLoan.paidAmount || 0)}</span>
                </div>
                <div style={{ ...styles.modalInfoRow, borderBottom: 'none' }}>
                  <span style={styles.modalLabel}>Remaining</span>
                  <span style={{ ...styles.modalValue, color: '#ef4444' }}>
                    {formatMoney(getRemainingAmount(selectedLoan))}
                  </span>
                </div>
              </div>

              {/* Amount Input */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>💵 Repayment Amount (₹)</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  style={styles.formInput}
                  max={getRemainingAmount(selectedLoan)}
                  min="1"
                />
              </div>

              {/* Quick Amounts */}
              <div style={styles.quickAmounts}>
                <button
                  style={styles.quickBtn}
                  onClick={() => setRepayAmount(String(Math.round(selectedLoan.amount / selectedLoan.tenure)))}
                >
                  1 EMI
                </button>
                <button
                  style={styles.quickBtn}
                  onClick={() => setRepayAmount(String(Math.round(getRemainingAmount(selectedLoan) / 2)))}
                >
                  50%
                </button>
                <button
                  style={styles.quickBtn}
                  onClick={() => setRepayAmount(String(getRemainingAmount(selectedLoan)))}
                >
                  Full
                </button>
              </div>

              {/* Buttons */}
              <div style={styles.modalActions}>
                <button style={styles.btnCancel} onClick={handleCloseRepay}>
                  Cancel
                </button>
                <button
                  style={{
                    ...styles.btnSubmit,
                    opacity: !repayAmount || actionLoading ? 0.6 : 1,
                    cursor: !repayAmount || actionLoading ? 'not-allowed' : 'pointer',
                  }}
                  onClick={handleRepay}
                  disabled={!repayAmount || actionLoading}
                >
                  {actionLoading ? '⏳ Processing...' : `✓ Pay ${repayAmount ? formatMoney(repayAmount) : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowerDashboard;