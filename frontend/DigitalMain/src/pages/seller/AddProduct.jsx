import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import "../../styles/form.css";
import "../../styles/product-card.css"; // for modal styles

const AddProduct = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    productName: "",
    description: "",
    price: "",
    quality: "",
    originPlace: "",
    quantityAvailable: "",
    unit: "PACK",
    categoryId: "",
    imageUrl: ""
  });

  const [imagePreview, setImagePreview] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("confirm"); // confirm | error
  const [modalMessage, setModalMessage] = useState("");

  /* IMAGE UPLOAD */
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
      !form.quality ||
      !form.originPlace ||
      !form.unit ||
      !form.categoryId ||
      !form.imageUrl
    ) {
      setModalType("error");
      setModalMessage("Please fill all fields and upload an image before submitting.");
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
    setModalMessage("Are you sure you want to submit this product for approval?");
    setShowModal(true);
  };

  /* CONFIRM SUBMIT */
  const confirmSubmit = async () => {
    try {
      await api.post("/products", {
        ...form,
        price: Number(form.price),
        quantityAvailable: Number(form.quantityAvailable),
        sellerId: user.id
      });

      navigate("/seller/products");
    } catch (err) {
      setModalType("error");
      setModalMessage("Failed to add product. Please try again.");
    }
  };

  return (
    <div className="container form-page">
      <h2>Add New Product</h2>

      <form className="product-form" onSubmit={handleSubmit}>
        <input
          name="productName"
          placeholder="Product Name"
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Product Description"
          onChange={handleChange}
        />

        <input
          type="text"
          name="quality"
          placeholder="Product Quality"
          onChange={handleChange}
        />

         <input
          type="text"
          name="originPlace"
          placeholder="Product Origin Place"
          onChange={handleChange}
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          min="1"
          onChange={handleChange}
        />

        <input
          type="number"
          name="quantityAvailable"
          placeholder="Quantity Available"
          min="1"
          onChange={handleChange}
        />

        <select name="unit" onChange={handleChange}>
          <option value="PACK">Pack</option>
          <option value="KG">Kg</option>
          <option value="LITER">Liter</option>
        </select>

        <select name="categoryId" onChange={handleChange}>
          <option value="">Select Category</option>
          <option value="1">Crop</option>
          <option value="2">Seed</option>
          <option value="3">Fertilizer</option>
          <option value="4">Medicine</option>
        </select>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />

        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="image-preview"
          />
        )}

        <button className="primary-btn">
          Submit for Approval
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
                ? "Confirm Submission"
                : "Form Incomplete"}
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
                  onClick={confirmSubmit}
                >
                  Yes, Submit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProduct;
