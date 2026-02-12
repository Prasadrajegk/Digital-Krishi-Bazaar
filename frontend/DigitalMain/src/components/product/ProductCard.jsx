import { FaShoppingCart, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { addToCart } from "../../services/cart.service";
import { BACKEND_URL } from "../../utils/constants";
import "../../styles/product-card.css";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState("success"); // success | error | info
  const [popupMessage, setPopupMessage] = useState("");

  const openPopup = (type, message) => {
    setPopupType(type);
    setPopupMessage(message);
    setShowPopup(true);
  };

  const handleAddToCart = async () => {
    if (!user) {
      openPopup("info", "Please login to add items to your cart.");
      return;
    }

    try {
      await addToCart(product.productId, user.id);
      openPopup(
        "success",
        `${product.productName} has been added to your cart successfully.`
      );
    } catch (error) {
      console.error(error);
      openPopup(
        "error",
        "Failed to add product to cart. Please try again."
      );
    }
  };

  return (
    <>
      <div className="product-tile">
        <div
          className="product-tile-image"
          onClick={() => navigate(`/products/${product.productId}`)}
        >
          <img
            src={`${BACKEND_URL}/${product.imageUrl}`}
            alt={product.productName}
          />
        </div>

        <div className="product-tile-info">
          <span className="product-category">{product.categoryName}</span>

          <h3>{product.productName}</h3>

          {/* ORIGIN PLACE */}
{product.originPlace && (
  <span className="product-origin">
    📍 {product.originPlace}
  </span>
)}

          <p className="product-tile-desc">
            {product.description}
          </p>

          <div className="product-tile-bottom">
            <span className="price">
              ₹ {product.price} <small>/ {product.unit}</small>
            </span>

            <button className="add-cart-btn" onClick={handleAddToCart}>
              <FaShoppingCart /> Add
            </button>
          </div>
        </div>
      </div>

      {/* UNIVERSAL CENTER MODAL */}
      {showPopup && (
        <div className="cart-modal-overlay" onClick={() => setShowPopup(false)}>
          <div
            className={`cart-modal ${popupType}`}
            onClick={(e) => e.stopPropagation()}
          >
            {popupType === "success" && (
              <FaCheckCircle className="modal-success-icon" />
            )}

            {popupType !== "success" && (
              <FaExclamationCircle className="modal-error-icon" />
            )}

            <h3>
              {popupType === "success"
                ? "Added to Cart"
                : popupType === "info"
                ? "Login Required"
                : "Something Went Wrong"}
            </h3>

            <p>{popupMessage}</p>

            <div className="modal-actions">
              <button
                className="secondary-btn"
                onClick={() => setShowPopup(false)}
              >
                Close
              </button>

              {popupType === "success" && (
                <button
                  className="primary-btn"
                  onClick={() => navigate("/cart")}
                >
                  View Cart
                </button>
              )}

              {popupType === "info" && (
                <button
                  className="primary-btn"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
