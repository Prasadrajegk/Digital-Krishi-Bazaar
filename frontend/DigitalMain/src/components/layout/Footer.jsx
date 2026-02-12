import "../../styles/footer.css";

function Footer() {
  return (
    <footer className="footer" id="about-section">
      <div className="footer-container">

        {/* LEFT: EXPLORE */}
        <div className="footer-section">
          <h3>Explore</h3>
          <p className="footer-desc">
            Discover amazing products with exclusive offers today!
          </p>

          <ul className="footer-links">
            <li>Home</li>
            <li>About Us</li>
            <li>Our Services</li>
            <li>Products</li>
            <li>Contact Us</li>
            <li>Legal & Policy</li>
            <li>FAQ</li>
          </ul>
        </div>

        {/* MIDDLE: CONTACT */}
        <div className="footer-section">
          <h3>Contact</h3>
          <p>support@digitalkrishi.com</p>
          <p>+91 9XXXXXXXXX</p>

          <div className="social-icons">
            <span>🌐</span>
            <span>📸</span>
            <span>in</span>
            <span>✖</span>
          </div>
        </div>

        {/* RIGHT: REVIEW / SUBSCRIBE */}
        <div className="footer-section">
          <h3 className="review-title">GIVE US A REVIEW!!</h3>

          <input
            type="email"
            placeholder="Your email for updates"
            className="footer-input"
          />

          <button className="footer-btn">
            Subscribe for updates
          </button>
        </div>

      </div>

      <div className="footer-bottom">
        © 2026 Digital Krishi Bazaar. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
