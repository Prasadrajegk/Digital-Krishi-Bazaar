import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import BorrowerDashboard from './pages/borrower/BorrowerDashboard';
import Dashboard from './pages/dashboard/Dashboard';
import Loans from './pages/loans/Loans';
import Users from './pages/users/Users';
import LenderDashboard from './pages/lender/LenderDashboard';
import Lenders from './pages/lenders/Lenders';

const AppLayout = ({ children, title }) => {
  return (
    <>
      <Sidebar />
      <div className="main-content">
        <Navbar title={title} />
        <div className="page-content">
          {children}
        </div>
      </div>
    </>
  );
};

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route 
          path="/dashboard" 
          element={
            <AppLayout title="Dashboard">
              <Dashboard />
            </AppLayout>
          } 
        />

        {/* Find Lenders Route */}
        <Route 
          path="/lenders" 
          element={
            <AppLayout title="Find Lenders">
              <Lenders />
            </AppLayout>
          } 
        />

        {/* Borrower Dashboard - Now with AppLayout */}
        <Route 
          path="/borrower-dashboard" 
          element={
            <AppLayout title="💳 Borrower Dashboard">
              <BorrowerDashboard />
            </AppLayout>
          } 
        />

        <Route 
          path="/loans" 
          element={
            <AppLayout title="Loans">
              <Loans />
            </AppLayout>
          } 
        />

        <Route 
          path="/my-borrows" 
          element={
            <AppLayout title="My Borrows">
              <Loans initialTab="borrows" />
            </AppLayout>
          } 
        />

        <Route 
          path="/my-lends" 
          element={
            <AppLayout title="Lender Dashboard">
              <LenderDashboard />
            </AppLayout>
          } 
        />

        <Route 
          path="/request-loan" 
          element={
            <AppLayout title="Request Loan">
              <Lenders />
            </AppLayout>
          } 
        />

        <Route 
          path="/users" 
          element={
            <AppLayout title="Users Management">
              <Users />
            </AppLayout>
          } 
        />

        <Route 
          path="/products" 
          element={
            <AppLayout title="Products">
              <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '16px' }}>
                <h2>📦 Products Page</h2>
                <p style={{ color: '#6b7280' }}>Coming soon...</p>
              </div>
            </AppLayout>
          } 
        />

        <Route 
          path="/admin/products" 
          element={
            <AppLayout title="Manage Products">
              <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '16px' }}>
                <h2>🛒 Products Management</h2>
                <p style={{ color: '#6b7280' }}>Coming soon...</p>
              </div>
            </AppLayout>
          } 
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;