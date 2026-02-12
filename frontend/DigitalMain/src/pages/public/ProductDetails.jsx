import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { getProductById } from "../../services/product.service";
import { AuthContext } from "../../context/AuthContext";
import { addToCart } from "../../services/cart.service";
import { BACKEND_URL } from "../../utils/constants";
import { FaCheckCircle } from "react-icons/fa";
import "../../styles/product-details.css";
import { getReviewsByProduct, addReview } from "../../services/review.service";


const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const [reviews, setReviews] = useState([]);
const [rating, setRating] = useState(5);
const [comment, setComment] = useState("");
const [loadingReview, setLoadingReview] = useState(false);

useEffect(() => {
  getProductById(id).then(res => setProduct(res.data));
  getReviewsByProduct(id).then(res => setReviews(res.data));
}, [id]);



  useEffect(() => {
    getProductById(id).then(res => setProduct(res.data));
  }, [id]);


  const handleSubmitReview = async () => {
  if (!user) {
    alert("Please login to add a review");
    return;
  }

  if (!comment.trim()) {
    alert("Comment cannot be empty");
    return;
  }

  try {
    setLoadingReview(true);

    await addReview(id, {
      userId: user.id,
      rating,
      comment
    });

    setComment("");
    setRating(5);

    const res = await getReviewsByProduct(id);
    setReviews(res.data);
  } catch (err) {
    alert(err.response?.data || "Failed to submit review");
  } finally {
    setLoadingReview(false);
  }
};


  const handleAddToCart = async () => {
    if (!user) {
      alert("Please login to add items to cart");
      return;
    }

    try {
      await addToCart(product.productId, user.id);
      setShowPopup(true);

      setTimeout(() => setShowPopup(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to add to cart");
    }
  };

  if (!product) return <p>Loading...</p>;

  return (
    <>
      <div className="product-page container">
        <div className="product-card">
          
          {/* IMAGE */}
          <div
            className="product-image zoom-container"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              e.currentTarget.style.setProperty("--x", `${x}%`);
              e.currentTarget.style.setProperty("--y", `${y}%`);
            }}
          >
            <img
              src={`${BACKEND_URL}/${product.imageUrl}`}
              alt={product.productName}
              className="zoom-image"
            />
          </div>

          {/* INFO */}
          <div className="product-info">

            {/* NAME */}
            <h1 className="product-title">{product.productName}</h1>

            {/* CATEGORY */}
            <span className="product-category-badge">
              {product.categoryName}
            </span>

            {/* DESCRIPTION */}
            <p className="product-desc">{product.description}</p>

            {/* PRICE */}
            <div className="price-row">
              <span className="price">
                ₹ {product.price} <small>/ {product.unit}</small>
              </span>

              <span className="stock">
                {product.quantityAvailable} {product.unit} available
              </span>
            </div>

            {/* META */}
            <div className="meta">
              <p><b>Seller:</b> {product.sellerName}</p>

              {product.quality && (
                <p><b>Quality:</b> {product.quality}</p>
              )}

              {product.originPlace && (
                <p><b>Origin:</b> {product.originPlace}</p>
              )}
            </div>

            {/* ADD TO CART */}
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              🛒 Add to Cart
            </button>
          </div>
        </div>
      </div>


      {/* REVIEWS SECTION */}
<div className="reviews-section container">
  <h2>Customer Reviews</h2>

  {/* ADD REVIEW */}
  {user && (
    <div className="add-review-card">
      <h4>Write a Review</h4>

      <label>Rating</label>
      <select
        value={rating}
        onChange={(e) => setRating(e.target.value)}
      >
        {[5, 4, 3, 2, 1].map(r => (
          <option key={r} value={r}>{r} ⭐</option>
        ))}
      </select>

      <textarea
        placeholder="Share your experience..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button
        className="primary-btn"
        onClick={handleSubmitReview}
        disabled={loadingReview}
      >
        {loadingReview ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  )}

  {/* REVIEWS LIST */}
  {reviews.length === 0 ? (
    <p>No reviews yet.</p>
  ) : (
    <div className="reviews-list">
      {reviews.map((review) => (
        <div key={review.reviewId} className="review-card">
          <div className="review-header">
            <strong>{review.userName}</strong>
            <span>{review.rating} ⭐</span>
          </div>

          <p className="review-comment">{review.comment}</p>

          <small className="review-date">
            {new Date(review.createdAt).toLocaleDateString()}
          </small>
        </div>
      ))}
    </div>
  )}
</div>


      {/* CENTER MODAL POPUP */}
      {showPopup && (
        <div className="cart-modal-overlay" onClick={() => setShowPopup(false)}>
          <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
            <FaCheckCircle className="modal-success-icon" />

            <h3>Added to Cart</h3>

            <p>
              <strong>{product.productName}</strong> has been added to your cart.
            </p>

            <div className="modal-actions">
              <button
                className="secondary-btn"
                onClick={() => setShowPopup(false)}
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
    </>
  );
};

export default ProductDetails;
