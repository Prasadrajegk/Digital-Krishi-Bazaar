import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  getProductsByUser,
  deleteProduct
} from "../../services/product.service";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../utils/constants";
import { FaTrash, FaExclamationCircle } from "react-icons/fa";
import "../../styles/product.css";
import "../../styles/status.css";
import "../../styles/product-card.css"; // reuse modal styles

const SellerProducts = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProductsByUser(user.id);
      setProducts(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchProducts();
  }, [user]);

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      await deleteProduct(selectedProduct.productId);
      fetchProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setShowModal(false);
      setSelectedProduct(null);
    }
  };

  if (loading) {
    return <p className="center">Loading your products...</p>;
  }

  return (
    <div className="container">
      {/* HEADER */}
      <div className="page-header">
        <h2>My Products</h2>

        <button
          className="primary-btn"
          onClick={() => navigate("/seller/products/add")}
        >
          + Add Product
        </button>
      </div>

      {/* EMPTY STATE */}
      {products.length === 0 ? (
        <div className="empty-state">
          <h3>No products found</h3>
          <p>Start selling by adding your first product.</p>

          <button
            className="primary-btn"
            onClick={() => navigate("/seller/products/add")}
          >
            + Add Product
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <div className="seller-product-card" key={p.productId}>
              
              {/* IMAGE */}
<div className="product-image">
  <img
    src={`${BACKEND_URL}/${p.imageUrl}`}
    alt={p.productName}
  />

  {/* STATUS */}
  <span className={`status-badge status-${p.status.toLowerCase()}`}>
    {p.status}
  </span>
</div>

{/* INFO */}
<div className="product-info">
  {/* CATEGORY */}
  <span className="product-category">
    {p.categoryName}
  </span>

  <h3>{p.productName}</h3>

  <p className="product-desc">{p.description}</p>

  <div className="product-meta">
    <span className="price">
      ₹ {p.price} <small>/ {p.unit}</small>
    </span>

    <div className="action-buttons">
      <button
        className="edit-btn"
        onClick={() =>
          navigate(`/seller/products/edit/${p.productId}`)
        }
      >
        Edit
      </button>

      <button
        className="delete-btn"
        onClick={() => openDeleteModal(p)}
      >
        Delete
      </button>
    </div>
  </div>
</div>



            </div>
          ))}
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {showModal && selectedProduct && (
        <div className="cart-modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="cart-modal error"
            onClick={(e) => e.stopPropagation()}
          >
            <FaExclamationCircle className="modal-error-icon" />

            <h3>Delete Product</h3>

            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedProduct.productName}</strong>?  
              <br />
              This action cannot be undone.
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
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;
