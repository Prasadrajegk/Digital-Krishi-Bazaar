import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import "../../styles/product-card.css"; // reuse modal styles

const BecomeSeller = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState("confirm"); 
  // confirm | success | error

  const becomeSeller = async () => {
    try {
      await api.post("/user-roles", {
        userId: user.id,
        roleIds: [2, 3]
      });

      setStep("success");
    } catch (err) {
      console.error(err);
      setStep("error");
    }
  };

  const handleLogoutRedirect = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <div className="auth-container">
        <div className="auth-card">
          <h2>Want to Sell Your Products?</h2>
          <p style={{ textAlign: "center" }}>
            Start listing your products and reach thousands of buyers.
          </p>

          <button
            className="auth-btn"
            onClick={() => {
              setStep("confirm");
              setShowModal(true);
            }}
          >
            Yes, I want to sell
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="cart-modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="cart-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {step === "confirm" && (
              <>
                <FaExclamationCircle className="modal-error-icon" />
                <h3>Become a Seller</h3>
                <p>
                  Are you sure you want to become a seller?
                  <br />
                  This will enable product listing and order management.
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
                    onClick={becomeSeller}
                  >
                    Yes, Continue
                  </button>
                </div>
              </>
            )}

            {step === "success" && (
              <>
                <FaCheckCircle className="modal-success-icon" />
                <h3>You're a Seller Now 🎉</h3>
                <p>
                  Your seller account is activated.
                  <br />
                  Please login again to continue.
                </p>

                <div className="modal-actions">
                  <button
                    className="primary-btn"
                    onClick={handleLogoutRedirect}
                  >
                    Login Again
                  </button>
                </div>
              </>
            )}

            {step === "error" && (
              <>
                <FaExclamationCircle className="modal-error-icon" />
                <h3>Something Went Wrong</h3>
                <p>
                  Unable to activate seller account.
                  <br />
                  Please try again later.
                </p>

                <div className="modal-actions">
                  <button
                    className="secondary-btn"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BecomeSeller;
