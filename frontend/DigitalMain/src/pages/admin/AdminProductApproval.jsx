import { useEffect, useState } from "react";
import {
  getPendingProducts,
  approveProduct,
  rejectProduct
} from "../../services/product.service";
import { BACKEND_URL } from "../../utils/constants";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import "../../styles/table.css";
import "../../styles/status.css";

const AdminProductApproval = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(null); // approve | reject
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = () => {
    setLoading(true);
    getPendingProducts()
      .then(res => setProducts(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openConfirmModal = (product, type) => {
    setSelectedProduct(product);
    setActionType(type);
    setShowModal(true);
  };

  const handleConfirm = async () => {
    if (!selectedProduct) return;

    try {
      if (actionType === "approve") {
        await approveProduct(selectedProduct.productId);
      } else {
        await rejectProduct(selectedProduct.productId);
      }
      fetchProducts();
    } finally {
      setShowModal(false);
      setSelectedProduct(null);
      setActionType(null);
    }
  };

  if (loading) return <p className="center">Loading pending products...</p>;

  return (
    <div className="container">
      <h2 style={{ margin: "30px 0" }}>Pending Product Approvals</h2>

      {products.length === 0 ? (
        <p>No pending products 🎉</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product</th>
              <th>Seller</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map(p => (
              <tr key={p.productId}>
                <td>
                  <img
                    src={`${BACKEND_URL}/${p.imageUrl}`}
                    alt={p.productName}
                    className="table-img"
                  />
                </td>

                <td>
                  <b>{p.productName}</b>
                  <br />
                  <small>{p.categoryName}</small>
                </td>

                <td>{p.sellerName}</td>
                <td>₹ {p.price}</td>
                <td>{p.quantityAvailable} {p.unit}</td>

                <td>
                  <span className={`status-badge status-${p.status}`}>
                    {p.status}
                  </span>
                </td>

                <td className="action-cell">
                  <button
                    className="approve-btn"
                    onClick={() => openConfirmModal(p, "approve")}
                  >
                    Approve
                  </button>

                  <button
                    className="reject-btn"
                    onClick={() => openConfirmModal(p, "reject")}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* CONFIRMATION MODAL */}
      {showModal && selectedProduct && (
        <div className="cart-modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className={`cart-modal ${actionType}`}
            onClick={(e) => e.stopPropagation()}
          >
            {actionType === "approve" ? (
              <FaCheckCircle className="modal-success-icon" />
            ) : (
              <FaExclamationTriangle className="modal-error-icon" />
            )}

            <h3>
              {actionType === "approve"
                ? "Approve Product"
                : "Reject Product"}
            </h3>

            <p>
              Are you sure you want to{" "}
              <b>{actionType}</b>{" "}
              <strong>{selectedProduct.productName}</strong>?
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
                onClick={handleConfirm}
              >
                Yes, {actionType}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductApproval;
