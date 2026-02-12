import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI, loanAPI } from '../../api/axios';
import { toast } from 'react-toastify';

const Lenders = () => {
  const { user, userId } = useAuth();

  // State
  const [lenders, setLenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedLender, setSelectedLender] = useState(null);
  const [amount, setAmount] = useState('');
  const [tenure, setTenure] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch lenders on load
  useEffect(() => {
    fetchLenders();
  }, []);

  const fetchLenders = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllLender();
      // Remove current user from list
      const available = (response.data || []).filter(u => u.userId !== userId);
      console.log('Lenders loaded:', available);
      setLenders(available);
    } catch (error) {
      console.error('Error fetching lenders:', error);
      toast.error('Failed to load lenders');
    } finally {
      setLoading(false);
    }
  };

  // Filter lenders
  const filteredLenders = lenders.filter(lender => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      lender.userName?.toLowerCase().includes(search) ||
      lender.email?.toLowerCase().includes(search) ||
      lender.mobile?.includes(search)
    );
  });

  // Open modal
  const handleApplyClick = (lender) => {
    setSelectedLender(lender);
    setAmount('');
    setTenure('');
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLender(null);
  };

  // Submit loan
  const handleSubmitLoan = async () => {
    if (!amount || Number(amount) < 1000) {
      toast.error('Minimum amount is ₹1,000');
      return;
    }
    if (!tenure) {
      toast.error('Please select tenure');
      return;
    }

    try {
      setSubmitting(true);
      await loanAPI.request(
        userId,
        selectedLender.userId,
        Number(amount),
        Number(tenure)
      );
      toast.success('🎉 Loan request sent successfully!');
      handleCloseModal();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to submit loan request');
    } finally {
      setSubmitting(false);
    }
  };

  // Styles
  const styles = {
    page: {
      padding: '24px',
    },
    header: {
      marginBottom: '24px',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '8px',
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '15px',
    },
    searchBox: {
      display: 'flex',
      alignItems: 'center',
      background: '#fff',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      padding: '12px 16px',
      marginBottom: '24px',
      maxWidth: '500px',
    },
    searchInput: {
      flex: 1,
      border: 'none',
      outline: 'none',
      fontSize: '15px',
      marginLeft: '10px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '24px',
    },
    card: {
      background: '#fff',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
      border: '2px solid transparent',
      transition: 'all 0.3s',
    },
    avatar: {
      width: '60px',
      height: '60px',
      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      borderRadius: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: '24px',
      fontWeight: '700',
      marginBottom: '16px',
    },
    name: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '12px',
    },
    info: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '8px',
    },
    applyBtn: {
      width: '100%',
      padding: '14px',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '700',
      cursor: 'pointer',
      marginTop: '16px',
    },
    // Modal styles
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    },
    modal: {
      background: '#fff',
      borderRadius: '20px',
      width: '100%',
      maxWidth: '450px',
      padding: '0',
      overflow: 'hidden',
    },
    modalHeader: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: '#fff',
      padding: '20px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: '700',
      margin: 0,
    },
    closeBtn: {
      background: 'rgba(255,255,255,0.2)',
      border: 'none',
      color: '#fff',
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      fontSize: '20px',
      cursor: 'pointer',
    },
    modalBody: {
      padding: '24px',
    },
    lenderBox: {
      background: '#f0fdf4',
      border: '2px solid #10b981',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
    },
    lenderAvatar: {
      width: '50px',
      height: '50px',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: '20px',
      fontWeight: '700',
    },
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px',
    },
    input: {
      width: '100%',
      padding: '14px',
      border: '2px solid #e5e7eb',
      borderRadius: '10px',
      fontSize: '16px',
      outline: 'none',
      boxSizing: 'border-box',
    },
    tenureGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '10px',
    },
    tenureBtn: {
      padding: '12px',
      border: '2px solid #e5e7eb',
      borderRadius: '10px',
      background: '#f9fafb',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
    },
    tenureBtnActive: {
      background: '#10b981',
      borderColor: '#10b981',
      color: '#fff',
    },
    summary: {
      background: '#f0fdf4',
      border: '2px solid #d1fae5',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '20px',
    },
    summaryRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid #d1fae5',
    },
    modalBtns: {
      display: 'flex',
      gap: '12px',
    },
    cancelBtn: {
      flex: 1,
      padding: '14px',
      background: '#f3f4f6',
      border: '2px solid #e5e7eb',
      borderRadius: '10px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
    },
    submitBtn: {
      flex: 2,
      padding: '14px',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      border: 'none',
      borderRadius: '10px',
      color: '#fff',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
    },
    loading: {
      textAlign: 'center',
      padding: '60px',
      color: '#6b7280',
    },
    empty: {
      textAlign: 'center',
      padding: '60px',
      background: '#fff',
      borderRadius: '16px',
    },
  };

  // Calculate EMI
  const emi = amount && tenure ? Math.round(Number(amount) / Number(tenure)) : 0;

  // Loading
  if (loading) {
    return (
      <div style={styles.loading}>
        <p>⏳ Loading lenders...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🏦 Find a Lender</h1>
        <p style={styles.subtitle}>Browse lenders and apply for a loan</p>
      </div>

      {/* Search */}
      <div style={styles.searchBox}>
        <span>🔍</span>
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Count */}
      <p style={{ marginBottom: '20px', color: '#6b7280' }}>
        Showing {filteredLenders.length} lenders
      </p>

      {/* Lenders Grid */}
      {filteredLenders.length > 0 ? (
        <div style={styles.grid}>
          {filteredLenders.map((lender) => (
            <div 
              key={lender.userId} 
              style={styles.card}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#10b981';
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={styles.avatar}>
                {lender.userName?.charAt(0).toUpperCase() || 'L'}
              </div>
              
              <h3 style={styles.name}>{lender.userName}</h3>
              
              <p style={styles.info}>📧 {lender.email}</p>
              
              {lender.mobile && (
                <p style={styles.info}>📱 {lender.mobile}</p>
              )}
              
              {lender.address && (
                <p style={styles.info}>📍 {lender.address}</p>
              )}

              {lender.status && (
                <p style={styles.info}>
                  {lender.status === 'ACTIVE' ? '🟢' : '🔴'} {lender.status}
                </p>
              )}

              {/* Roles */}
              {lender.roles && lender.roles.length > 0 && (
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {lender.roles.map((role) => (
                    <span 
                      key={role.roleId}
                      style={{
                        padding: '4px 10px',
                        background: '#dbeafe',
                        color: '#2563eb',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                      }}
                    >
                      {role.roleName}
                    </span>
                  ))}
                </div>
              )}

              <button 
                style={styles.applyBtn}
                onClick={() => handleApplyClick(lender)}
              >
                💰 Apply for Loan
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.empty}>
          <p style={{ fontSize: '48px', marginBottom: '16px' }}>😕</p>
          <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>No Lenders Found</h3>
          <p style={{ color: '#6b7280' }}>Try a different search term</p>
        </div>
      )}

      {/* Apply Loan Modal */}
      {showModal && selectedLender && (
        <div style={styles.modalOverlay} onClick={handleCloseModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>💰 Apply for Loan</h2>
              <button style={styles.closeBtn} onClick={handleCloseModal}>✕</button>
            </div>

            {/* Modal Body */}
            <div style={styles.modalBody}>
              
              {/* Selected Lender */}
              <div style={styles.lenderBox}>
                <div style={styles.lenderAvatar}>
                  {selectedLender.userName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong style={{ fontSize: '16px', color: '#1f2937' }}>
                    {selectedLender.userName}
                  </strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                    {selectedLender.email}
                  </p>
                </div>
              </div>

              {/* Amount */}
              <div style={styles.formGroup}>
                <label style={styles.label}>💵 Loan Amount (₹)</label>
                <input
                  type="number"
                  placeholder="Enter amount (min ₹1,000)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={styles.input}
                  min="1000"
                />
                {/* Quick amounts */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {[10000, 25000, 50000, 100000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(String(amt))}
                      style={{
                        padding: '8px 14px',
                        border: amount === String(amt) ? '2px solid #10b981' : '2px solid #e5e7eb',
                        borderRadius: '8px',
                        background: amount === String(amt) ? '#10b981' : '#f3f4f6',
                        color: amount === String(amt) ? '#fff' : '#4b5563',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      ₹{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tenure */}
              <div style={styles.formGroup}>
                <label style={styles.label}>📅 Loan Tenure (Months)</label>
                <div style={styles.tenureGrid}>
                  {[3, 6, 12, 18, 24, 36].map((months) => (
                    <button
                      key={months}
                      type="button"
                      onClick={() => setTenure(String(months))}
                      style={{
                        ...styles.tenureBtn,
                        ...(tenure === String(months) ? styles.tenureBtnActive : {}),
                      }}
                    >
                      {months} Mo
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              {amount && tenure && (
                <div style={styles.summary}>
                  <div style={styles.summaryRow}>
                    <span style={{ color: '#6b7280' }}>Amount</span>
                    <strong>₹{Number(amount).toLocaleString()}</strong>
                  </div>
                  <div style={styles.summaryRow}>
                    <span style={{ color: '#6b7280' }}>Tenure</span>
                    <strong>{tenure} Months</strong>
                  </div>
                  <div style={{ ...styles.summaryRow, borderBottom: 'none' }}>
                    <span style={{ color: '#6b7280' }}>Monthly EMI</span>
                    <strong style={{ color: '#059669', fontSize: '18px' }}>
                      ₹{emi.toLocaleString()}
                    </strong>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div style={styles.modalBtns}>
                <button style={styles.cancelBtn} onClick={handleCloseModal}>
                  Cancel
                </button>
                <button 
                  style={{
                    ...styles.submitBtn,
                    opacity: submitting || !amount || !tenure ? 0.5 : 1,
                    cursor: submitting || !amount || !tenure ? 'not-allowed' : 'pointer',
                  }}
                  onClick={handleSubmitLoan}
                  disabled={submitting || !amount || !tenure}
                >
                  {submitting ? '⏳ Submitting...' : '✓ Submit Request'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lenders;