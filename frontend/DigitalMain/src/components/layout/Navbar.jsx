import { Link } from "react-router-dom"
import { FaShoppingCart, FaUserCircle } from "react-icons/fa"
import { useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import "../../styles/layout.css"

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)

  const isSeller = user?.roles?.includes("SELLER")
  const isBuyerOnly =
    user?.roles?.includes("BUYER") && !user?.roles?.includes("SELLER")

  const isAdmin = user?.roles?.includes("ADMIN")

  return (
    <nav className="navbar">
      <Link to="/" className="logo">Digital Krishi Bazaar</Link>

      <div className="navbar-center">
        <Link to="/products">Products</Link>
        <Link to="/allproducts">All Products</Link>

        {isSeller && (
          <Link to="/seller/products/active">My Store</Link>
        )}

        {isBuyerOnly && (
          <Link to="/become-seller">Become Seller</Link>
        )}

        {user && (
          <Link to="/orders">My Orders</Link>
        )}

        {isAdmin && (
          <Link to="/admin/products">Admin Panel</Link>
        )}

      

        {isAdmin && (
          <>
            <Link to="/admin/products">Product Approvals</Link>
            <Link to="/admin/orders">Orders</Link>
          </>
        )}


        {isSeller && (
          <>
            <Link to="/seller/products">My Products</Link>
            <Link to="/seller/orders">Orders For Me</Link>
          </>
        )}
      </div>

      <div className="navbar-right">
        <Link to="/cart" className="cart-icon">
          <FaShoppingCart />
        </Link>

        {!user ? (
          <Link to="/login" className="login-btn">Login</Link>
        ) : (
          <div className="user-dropdown">
            <FaUserCircle className="user-icon" />

            <div className="dropdown-menu">
              <p className="user-name">{user.name}</p>
              <p className="user-email">{user.email}</p>

              <Link to="/profile" className="dropdown-link">
                Edit Profile
              </Link>

              <button className="logout-btn" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

    </nav>
  )
}

export default Navbar
