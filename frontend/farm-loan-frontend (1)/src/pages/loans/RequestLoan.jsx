import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loanAPI, userAPI } from '../../api/axios';
import { toast } from 'react-toastify';
import './RequestLoan.css';

const RequestLoan = () => {
  const { user, userId } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Form State
  const [amount, setAmount] = useState('');
  const [tenure, setTenure] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Lender Search State
  const [lenders, setLenders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLender, setSelectedLender] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingLenders, setLoadingLenders] = useState(true);

  // Fetch all lenders
  useEffect(() => {
    fetchLenders();
  }, [userId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchLenders = async () => {
    try {
      setLoadingLenders(true);
      const response = await userAPI.getAll();
      // Remove current user from list
      const available = (response.data || []).filter(u => u.userId !== userId);
      setLenders(available);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load lenders');
    } finally {
      setLoadingLenders(false);
    }
  };

  // Filter lenders based on search
  const filteredLenders = lenders.filter(lender => {
    if (!searchTerm.trim()) return true;
    const search = searchTerm.toLowerCase();
    return (
      lender.userName?.toLowerCase().includes(search) ||
      lender.email?.toLowerCase().includes(search) ||
      lender.mobile?.includes(search) ||
      lender.address?.toLowerCase().includes(search)
    );
  });

  // Select a lender
  const handleSelectLender = (lender) => {
    setSelectedLender(lender);
    setSearchTerm('');
    setShowDropdown(false);
  };

  // Clear selected lender
  const handleClearLender = () => {
    setSelectedLender(null);
    setSearchTerm('');
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedLender) {
      toast.error('Please select a lender');
      return;
    }
    if (!amount || parseFloat(amount) < 1000) {
      toast.error('Minimum loan amount is ₹1,000');
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
        parseFloat(amount),
        parseInt(tenure)
      );
      toast.success('🎉 Loan request submitted!');
      navigate('/my-borrows');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  // Format money
  const formatMoney = (val) => '₹' + Number(val || 0).toLocaleString('en-IN');

  // Calculate EMI
  const emi = amount && tenure ? Math.round(parseFloat(amount) / parseInt(tenure)) : 0;

  return (
    <div className="request-loan-page">
      <div className="loan-form-container">
        
        {/* Header */}
        <div className="form-header">
          <h1>💰 Request a Loan</h1>
          <p>Fill the form to request loan from a lender</p>
        </div>

        {/* Current User */}
        <div className="current-user-box">
          <span className="label">Requesting as:</span>
          <div className="user-info">
            <div className="avatar">{user?.userName?.charAt(0) || 'U'}</div>
            <div>
              <strong>{user?.userName}</strong>
              <span>{user?.email}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* ========== LENDER SEARCH ========== */}
          <div className="form-group">
            <label>🏦 Select Lender <span className="required">*</span></label>
            
            {selectedLender ? (
              // Selected Lender Display
              <div className="selected-lender-box">
                <div className="lender-avatar">
                  {selectedLender.userName?.charAt(0)}
                </div>
                <div className="lender-info">
                  <strong>{selectedLender.userName}</strong>
                  <span>📧 {selectedLender.email}</span>
                  {selectedLender.mobile && <span>📱 {selectedLender.mobile}</span>}
                </div>
                <button 
                  type="button" 
                  className="clear-btn"
                  onClick={handleClearLender}
                >
                  ✕
                </button>
              </div>
            ) : (
              // Search Input & Dropdown
              <div className="lender-search" ref={dropdownRef}>
                <div className="search-input-box">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search by name, email, phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                  />
                  {searchTerm && (
                    <button 
                      type="button" 
                      className="clear-search"
                      onClick={() => setSearchTerm('')}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Dropdown */}
                {showDropdown && (
                  <div className="lender-dropdown">
                    {loadingLenders ? (
                      <div className="dropdown-message">
                        <div className="loader"></div>
                        Loading lenders...
                      </div>
                    ) : filteredLenders.length > 0 ? (
                      <div className="lender-list">
                        {filteredLenders.map(lender => (
                          <div
                            key={lender.userId}
                            className="lender-item"
                            onClick={() => handleSelectLender(lender)}
                          >
                            <div className="lender-avatar">
                              {lender.userName?.charAt(0)}
                            </div>
                            <div className="lender-details">
                              <strong>{lender.userName}</strong>
                              <span>📧 {lender.email}</span>
                              {lender.mobile && <span>📱 {lender.mobile}</span>}
                              {lender.address && <span>📍 {lender.address}</span>}
                            </div>
                            <span className="select-indicator">✓</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="dropdown-message">
                        😕 No lenders found
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ========== AMOUNT ========== */}
          <div className="form-group">
            <label>💵 Loan Amount <span className="required">*</span></label>
            <div className="amount-input-box">
              <span className="rupee">₹</span>
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1000"
              />
            </div>
            <div className="quick-amounts">
              {[10000, 25000, 50000, 100000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  className={amount === String(amt) ? 'active' : ''}
                  onClick={() => setAmount(String(amt))}
                >
                  {formatMoney(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* ========== TENURE ========== */}
          <div className="form-group">
            <label>📅 Loan Tenure <span className="required">*</span></label>
            <div className="tenure-grid">
              {[3, 6, 12, 18, 24, 36].map(months => (
                <button
                  key={months}
                  type="button"
                  className={tenure === String(months) ? 'active' : ''}
                  onClick={() => setTenure(String(months))}
                >
                  {months} Months
                </button>
              ))}
            </div>
          </div>

          {/* ========== SUMMARY ========== */}
          {amount && tenure && (
            <div className="loan-summary">
              <h3>📋 Loan Summary</h3>
              <div className="summary-row">
                <span>Loan Amount</span>
                <strong>{formatMoney(amount)}</strong>
              </div>
              <div className="summary-row">
                <span>Tenure</span>
                <strong>{tenure} Months</strong>
              </div>
              <div className="summary-row">
                <span>Monthly EMI</span>
                <strong className="emi">{formatMoney(emi)}</strong>
              </div>
              {selectedLender && (
                <div className="summary-row">
                  <span>Lender</span>
                  <strong>{selectedLender.userName}</strong>
                </div>
              )}
            </div>
          )}

          {/* ========== BUTTONS ========== */}
          <div className="form-buttons">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={submitting || !selectedLender || !amount || !tenure}
            >
              {submitting ? 'Submitting...' : '✓ Submit Request'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default RequestLoan;