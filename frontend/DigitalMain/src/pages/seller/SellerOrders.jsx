import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { getOrdersBySeller, completeOrder } from "../../services/order.service";
import { FaCheckCircle, FaHistory } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../styles/order.css";
import "../../styles/status.css";
import "../../styles/product-card.css";

const buyerStatus = (status) => {
  if (status === "COMPLETED") return "DELIVERED";
  return normalizeStatus(status);
};


const SellerOrders = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  /* MODAL STATE */
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = () => {
    setLoading(true);
    getOrdersBySeller(user.id)
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openConfirmModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const confirmComplete = async () => {
    if (!selectedOrder) return;

    try {
      await completeOrder(selectedOrder.orderId);
      loadOrders();
    } finally {
      setShowModal(false);
      setSelectedOrder(null);
    }
  };

  if (loading) return <p className="center">Loading seller orders...</p>;

  const currentOrders = orders.filter(
    o => o.orderStatus === "PENDING"
  );

  return (
    <div className="container">
      {/* ===== HEADER (INLINE FIXED) ===== */}
      <div className="page-header">
        <h2>Orders for My Products</h2>

        <button
          className="history-btn"
          onClick={() => navigate("/seller/orders/history")}
        >
          <FaHistory /> Order History
        </button>
      </div>

      {/* ===== CURRENT ORDERS ===== */}
      {currentOrders.length === 0 ? (
        <p className="muted">No active orders.</p>
      ) : (
        <div className="order-list">
          {currentOrders.map(order => (
            <OrderCard
              key={order.orderId}
              order={order}
              showAction
              onComplete={() => openConfirmModal(order)}
            />
          ))}
        </div>
      )}

      {/* ===== CONFIRM COMPLETE MODAL ===== */}
      {showModal && selectedOrder && (
        <div className="cart-modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="cart-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <FaCheckCircle className="modal-success-icon" />

            <h3>Complete Order</h3>

            <p>
              Are you sure you want to mark  
              <br />
              <strong>Order #{selectedOrder.orderId}</strong>  
              <br />
              as completed?
            </p>

            <div className="modal-actions">
              <button
                className="secondary-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className="primary-btn"
                onClick={confirmComplete}
              >
                Yes, Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ===== ORDER CARD ===== */
const OrderCard = ({ order, onComplete, showAction }) => {
  return (
    <div className="order-card">
      <div className="order-header">
        <div>
          <b>Order #{order.orderId}</b>
          <p>{new Date(order.orderDate).toLocaleString()}</p>
          <small>Buyer: {order.buyerName}</small>
        </div>

        <span
          className={`status-badge status-${order.orderStatus.toLowerCase()}`}
        >
          {order.orderStatus}
        </span>
      </div>

      <div className="order-items">
        {order.orderItems.map(item => (
          <div key={item.orderItemId} className="order-item">
            <span>{item.productName}</span>
            <span>
              {item.quantity} × ₹{item.price}
            </span>
          </div>
        ))}
      </div>

      <div className="order-footer">
        <h4>Total: ₹ {order.totalAmount}</h4>

        {showAction && (
          <button
            className="primary-btn"
            onClick={onComplete}
          >
            Mark as Completed
          </button>
        )}
      </div>
    </div>
  );
};

export default SellerOrders;
