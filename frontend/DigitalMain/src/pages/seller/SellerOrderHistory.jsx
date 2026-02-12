import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { getOrdersBySeller } from "../../services/order.service";
import "../../styles/order.css";
import "../../styles/status.css";

const SellerOrderHistory = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrdersBySeller(user.id)
      .then(res => {
        const history = res.data.filter(
          o => o.orderStatus !== "PENDING"
        );
        setOrders(history);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="center">Loading order history...</p>;

  if (orders.length === 0)
    return <h3 className="center">No past orders 📦</h3>;

  return (
    <div className="container">
      <h2 style={{ margin: "30px 0" }}>Order History</h2>

      <div className="order-list history">
        {orders.map(order => (
          <div key={order.orderId} className="order-card">
            <div className="order-header">
              <div>
                <b>Order #{order.orderId}</b>
                <p>{new Date(order.orderDate).toLocaleString()}</p>
                <small>Buyer: {order.buyerName}</small>
              </div>

              <span
                className={`status-badge status-${order.orderStatus.toLowerCase()}`}
              >
                {order.orderStatus}
              </span>
            </div>

            <div className="order-items">
              {order.orderItems.map(item => (
                <div key={item.orderItemId} className="order-item">
                  <span>{item.productName}</span>
                  <span>
                    {item.quantity} × ₹{item.price}
                  </span>
                </div>
              ))}
            </div>

            <div className="order-footer">
              <h4>Total: ₹ {order.totalAmount}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerOrderHistory;
 