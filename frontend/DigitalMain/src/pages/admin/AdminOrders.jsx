import { useEffect, useState } from "react"
import {
  getAllOrders,
  cancelOrder,
  completeOrder
} from "../../services/order.service"
import "../../styles/order.css"
import "../../styles/status.css"
import "../../styles/table.css"

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const loadOrders = () => {
    getAllOrders()
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleCancel = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return
    await cancelOrder(orderId)
    loadOrders()
  }

  const handleComplete = async (orderId) => {
    if (!window.confirm("Mark order as completed?")) return
    await completeOrder(orderId)
    loadOrders()
  }

  if (loading) return <p className="center">Loading orders...</p>

  return (
    <div className="container">
      <h2 style={{ margin: "30px 0" }}>Admin Orders Dashboard</h2>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Buyer</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
            <th>Items</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {orders.map(order => (
            <tr key={order.orderId}>
              <td>#{order.orderId}</td>
              <td>{order.userName}</td>
              <td>{new Date(order.orderDate).toLocaleString()}</td>
              <td>₹ {order.totalAmount}</td>

              <td>
                <span className={`status-badge status-${order.orderStatus}`}>
                  {order.orderStatus}
                </span>
              </td>

              <td>
                {order.orderItems.map(item => (
                  <div key={item.orderItemId}>
                    {item.productName} ({item.quantity})
                  </div>
                ))}
              </td>

              <td className="action-cell">
                {order.orderStatus === "TRANSIT" && (
                  <>
                    <button
                      className="approve-btn"
                      onClick={() => handleComplete(order.orderId)}
                    >
                      Complete
                    </button>

                    <button
                      className="reject-btn"
                      onClick={() => handleCancel(order.orderId)}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminOrders
