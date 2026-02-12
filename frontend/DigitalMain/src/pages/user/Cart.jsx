import { useContext, useEffect, useState } from "react"
import { AuthContext } from "../../context/AuthContext"
import {
  getCartByUser,
  incrementCartItem,
  decrementCartItem,
  removeCartItem
} from "../../services/cart.service"
import { placeOrder } from "../../services/order.service"
import { BACKEND_URL } from "../../utils/constants"
import "../../styles/cart.css"

const Cart = () => {
  const { user } = useContext(AuthContext)
  const [cart, setCart] = useState(null)

  const loadCart = () => {
    getCartByUser(user.id).then(res => setCart(res.data))
  }

  useEffect(() => {
    loadCart()
  }, [])

  const handleInc = async (productId) => {
    await incrementCartItem(productId, user.id)
    loadCart()
  }

  const handleDec = async (productId) => {
    await decrementCartItem(productId, user.id)
    loadCart()
  }

  const handleRemove = async (productId) => {
    await removeCartItem(productId, user.id)
    loadCart()
  }


const handlePlaceOrder = async () => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/payments/create?userId=${user.id}`,
      { method: "POST" }
    )

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || "Payment init failed")
    }

    const res = await response.json()   // ✅ NOW res EXISTS

    const options = {
      key: "rzp_test_S8oxyx5HO6AK9e",
      amount: res.amount,
      currency: "INR",
      order_id: res.orderId,
      name: "Demo Shop",

      handler: async function (rzpResponse) {

        const verifyRes = await fetch(
          `${BACKEND_URL}/api/payments/verify`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              razorpayOrderId: rzpResponse.razorpay_order_id,
              razorpayPaymentId: rzpResponse.razorpay_payment_id,
              razorpaySignature: rzpResponse.razorpay_signature,
              userId: user.id,
              paymentMode: "ONLINE"
            })
          }
        )

        if (!verifyRes.ok) {
          throw new Error("Payment verification failed")
        }

        alert("Order placed successfully")
        loadCart()
      }
    }

    const rzp = new window.Razorpay(options)
    rzp.open()

  } catch (err) {
    console.error(err)
    alert("Payment failed: " + err.message)
  }
}


  


  if (!cart || cart.cartItems.length === 0) {
    return <h3 className="center">Your cart is empty 🛒</h3>
  }

  const total = cart.cartItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  )

 return (
  <div className="cart-container">
    <h2 className="cart-title">My Cart</h2>

    <div className="cart-layout">
      {/* LEFT: CART ITEMS */}
      <div className="cart-list">
        {cart.cartItems.map(item => (
          <div key={item.cartItemsId} className="cart-item">
            <img
              src={`${BACKEND_URL}/${item.imageUrl}`}
              alt={item.productName}
              className="cart-img"
            />

            <div className="cart-info">
              <h4 className="product-name">{item.productName}</h4>
              <p className="price">₹ {item.price}</p>

              <div className="qty-control">
                <button onClick={() => handleDec(item.productId)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => handleInc(item.productId)}>+</button>
              </div>
            </div>

            <button
              className="remove-btn"
              onClick={() => handleRemove(item.productId)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* RIGHT: SUMMARY */}
      <div className="cart-summary">
        <h3>Order Summary</h3>

        <div className="summary-row">
          <span>Total Items</span>
          <span>{cart.cartItems.length}</span>
        </div>

        <div className="summary-row total">
          <span>Total Amount</span>
          <span>₹ {total}</span>
        </div>

        <button className="checkout-btn" onClick={handlePlaceOrder}>
          Place Order
        </button>
      </div>
    </div>
  </div>
)

}

export default Cart
