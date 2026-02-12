import { Routes, Route } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import Home from "../pages/public/Home";
import Products from "../pages/public/Products";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Cart from "../pages/user/Cart";
import AdminDashboard from "../pages/admin/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";
import ProductDetails from "../pages/public/ProductDetails";
import BecomeSeller from "../pages/user/BecomeSeller";
import SellerProducts from "../pages/seller/SellerProducts";
import MyStore from "../pages/seller/MyStore";
import AddProduct from "../pages/seller/AddProduct";
import AdminProductApproval from "../pages/admin/AdminProductApproval";
import OrderHistory from "../pages/user/OrderHistory";
import SellerOrders from "../pages/seller/SellerOrders";
import AdminOrders from "../pages/admin/AdminOrders";
import EditProduct from "../pages/seller/EditProduct";
import AllProducts from "../pages/public/AllProducts";
import CategoryProducts from "../pages/category/CategoryProducts";
import SellerOrderHistory from "../pages/seller/SellerOrderHistory";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<Cart />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/become-seller" element={<BecomeSeller />} />
          <Route path="/seller/products" element={<SellerProducts />} />
          <Route path="/seller/products/active" element={<MyStore />} />
        </Route>

        <Route path="/seller/products/add" element={<AddProduct />} />

        <Route element={<AdminRoute />}>
          <Route path="/admin/products" element={<AdminProductApproval />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/orders" element={<OrderHistory />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/seller/orders" element={<SellerOrders />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route
            path="/seller/products/edit/:productId"
            element={<EditProduct />}
          />
        </Route>

        <Route path="/products" element={<Products />} />

        <Route path="/allproducts" element={<AllProducts />} />
        <Route path="/seller/orders/history" element={<SellerOrderHistory />} />

        <Route path="/products/category/:id" element={<CategoryProducts />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
