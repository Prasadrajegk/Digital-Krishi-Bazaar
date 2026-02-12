import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  getOrdersByUser,
  cancelOrder
} from "../../services/order.service";
import { addToCart } from "../../services/cart.service";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../styles/order.css";
import "../../styles/status.css";

const OrderHistory = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===== MODAL STATE ===== */
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = () => {
    getOrdersByUser(user.id)
      .then(res => setOrders(res.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /* ===== CANCEL FLOW ===== */
  const openCancelModal = (order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    await cancelOrder(selectedOrder.orderId);
    setShowCancelModal(false);
    setSelectedOrder(null);
    loadOrders();
  };

  /* ===== REORDER FLOW ===== */
  const openReorderModal = (order) => {
    setSelectedOrder(order);
    setShowReorderModal(true);
  };

  const confirmReorder = async () => {
    try {
      for (let item of selectedOrder.orderItems) {
        await addToCart(item.productId, user.id);
      }

      setPopupMessage("All products have been added to your cart 🛒");
      setShowSuccessPopup(true);

      setShowReorderModal(false);
      setSelectedOrder(null);

    } catch (error) {
      setPopupMessage("Failed to reorder items. Please try again.");
      setShowSuccessPopup(true);
    }
  };

  if (loading) return <p className="center">Loading orders...</p>;
  if (orders.length === 0)
    return <h3 className="center">No orders yet 📦</h3>;

  return (
    <div className="container">
      <h2 style={{ margin: "30px 0" }}>My Orders</h2>

      <div className="order-list">
        {orders.map(order => (
          <div key={order.orderId} className="order-card">
            
            <div className="order-header">
              <div>
                <b>Order #{order.orderId}</b>
                <p>{new Date(order.orderDate).toLocaleString()}</p>
              </div>

             <div className="order-status-wrapper">
              <span className={`order-status ${order.orderStatus.toLowerCase()}`}>
                {order.orderStatus}
              </span>
            </div>

            </div>


            <div className="order-items">
              {order.orderItems.map(item => (
                <div key={item.orderItemId} className="order-item">
                  <span>{item.productName}</span>
                  <span>{item.quantity} × ₹{item.price}</span>
                </div>
              ))}
            </div>

            <div className="order-footer">
              <h4>Total: ₹ {order.totalAmount}</h4>

              <div className="order-actions">
                {order.orderStatus === "PENDING" && (
                  <button
                    className="cancel-btn"
                    onClick={() => openCancelModal(order)}
                  >
                    Cancel Order
                  </button>
                )}

                <button
                  className="secondary-btn"
                  onClick={() => openReorderModal(order)}
                >
                  Order Again
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== SUCCESS POPUP ===== */}
      {showSuccessPopup && (
        <div
          className="cart-modal-overlay"
          onClick={() => setShowSuccessPopup(false)}
        >
          <div
            className="cart-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <FaCheckCircle className="modal-success-icon" />

            <h3>Reorder Successful</h3>
            <p>{popupMessage}</p>

            <div className="modal-actions">
              <button
                className="secondary-btn"
                onClick={() => setShowSuccessPopup(false)}
              >
                Continue Shopping
              </button>

              <button
                className="primary-btn"
                onClick={() => navigate("/cart")}
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CANCEL MODAL ===== */}
      {showCancelModal && selectedOrder && (
        <div className="cart-modal-overlay">
          <div className="cart-modal">
            <h3>Cancel Order</h3>
            <p>
              Are you sure you want to cancel order #
              {selectedOrder.orderId}?
            </p>

            <div className="modal-actions">
              <button
                className="secondary-btn"
                onClick={() => setShowCancelModal(false)}
              >
                No
              </button>

              <button
                className="cancel-btn"
                onClick={confirmCancel}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== REORDER MODAL ===== */}
      {showReorderModal && selectedOrder && (
        <div className="cart-modal-overlay">
          <div className="cart-modal">
            <h3>Add Items to Cart</h3>
            <p>Do you want to add these products to your cart?</p>

            <ul>
              {selectedOrder.orderItems.map(i => (
                <li key={i.orderItemId}>{i.productName}</li>
              ))}
            </ul>

            <div className="modal-actions">
              <button
                className="secondary-btn"
                onClick={() => setShowReorderModal(false)}
              >
                Cancel
              </button>

              <button
                className="primary-btn"
                onClick={confirmReorder}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
