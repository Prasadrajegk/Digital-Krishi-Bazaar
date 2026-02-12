import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { getProductById, updateProduct } from "../../services/product.service";
import { BACKEND_URL } from "../../utils/constants";
import api from "../../services/api";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import "../../styles/form.css";
import "../../styles/product-card.css"; // reuse modal styles

const EditProduct = () => {
  const { productId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    productName: "",
    description: "",
    price: "",
    quantityAvailable: "",
    unit: "PACK",
    quality:"",
    originPlace: "",
    categoryId: "",
    imageUrl: ""
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);

  /* MODAL STATE */
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("confirm"); // confirm | error
  const [modalMessage, setModalMessage] = useState("");

  /* FETCH PRODUCT */
  useEffect(() => {
    getProductById(productId)
      .then(res => {
        const p = res.data;
        setForm({
          productName: p.productName,
          description: p.description,
          price: p.price,
          quantityAvailable: p.quantityAvailable,
          unit: p.unit,
          quality: p.quality, 
          originPlace: p.originPlace,
          categoryId: p.categoryId,
          imageUrl: p.imageUrl
        });
        setImagePreview(`${BACKEND_URL}/${p.imageUrl}`);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  /* IMAGE CHANGE (OPTIONAL) */
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post(
      `/images/upload/${user.id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    setForm(prev => ({ ...prev, imageUrl: res.data }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* VALIDATION */
  const validateForm = () => {
    if (
      !form.productName ||
      !form.description ||
      !form.price ||
      !form.quantityAvailable ||
      !form.unit ||
      !form.quality ||
      !form.originPlace ||
      !form.categoryId
    ) {
      setModalType("error");
      setModalMessage("Please fill all required fields before updating.");
      setShowModal(true);
      return false;
    }
    return true;
  };

  /* SUBMIT (ASK FIRST) */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setModalType("confirm");
    setModalMessage("Are you sure you want to update this product?");
    setShowModal(true);
  };

  /* CONFIRM UPDATE */
  const confirmUpdate = async () => {
    try {
      await updateProduct(productId, {
        ...form,
        price: Number(form.price),
        quantityAvailable: Number(form.quantityAvailable)
      });

      navigate("/seller/products");
    } catch (err) {
      console.error(err);
      setModalType("error");
      setModalMessage("Failed to update product. Please try again.");
    }
  };

  if (loading) return <p className="center">Loading product...</p>;

  return (
    <div className="container form-page">
      <h2>Edit Product</h2>

      <form className="product-form" onSubmit={handleSubmit}>
        <input
          name="productName"
          value={form.productName}
          onChange={handleChange}
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
        />

        <input
          type="text"
          name="quality"
          placeholder="Product Quality"
          value={form.quality}
          onChange={handleChange}
        />

         <input
          type="text"
          name="originPlace"
          placeholder="Product Origin Place"
          value={form.originPlace}
          onChange={handleChange}
        />

        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          min="1"
        />

        <input
          type="number"
          name="quantityAvailable"
          value={form.quantityAvailable}
          onChange={handleChange}
          min="1"
        />

        <select name="unit" value={form.unit} onChange={handleChange}>
          <option value="PACK">Pack</option>
          <option value="KG">Kg</option>
          <option value="LITER">Liter</option>
        </select>

        <select
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
        >
          <option value="">Select Category</option>
          <option value="1">Crop</option>
          <option value="2">Seed</option>
          <option value="3">Fertilizer</option>
          <option value="4">Medicine</option>
        </select>

        {/* CURRENT / UPDATED IMAGE */}
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Product preview"
            className="image-preview"
          />
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />

        <button className="primary-btn">
          Update Product
        </button>
      </form>

      {/* CONFIRM / ERROR MODAL */}
      {showModal && (
        <div className="cart-modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className={`cart-modal ${modalType}`}
            onClick={(e) => e.stopPropagation()}
          >
            {modalType === "confirm" ? (
              <FaCheckCircle className="modal-success-icon" />
            ) : (
              <FaExclamationCircle className="modal-error-icon" />
            )}

            <h3>
              {modalType === "confirm"
                ? "Confirm Update"
                : "Invalid Form"}
            </h3>

            <p>{modalMessage}</p>

            <div className="modal-actions">
              <button
                className="secondary-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              {modalType === "confirm" && (
                <button
                  className="primary-btn"
                  onClick={confirmUpdate}
                >
                  Yes, Update
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProduct;
