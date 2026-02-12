import { useEffect, useState } from "react";
import ProductGrid from "../../components/product/ProductGrid";
import { getApprovedProductsByRegion } from "../../services/product.service";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Get logged-in user (saved during login)
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    // 🛑 Safety check
    if (!user?.id) {
      setLoading(false);
      return;
    }

    // ✅ Region-based product fetch
    getApprovedProductsByRegion(user.id)
      .then(res => {
        setProducts(res.data);
      })
      .catch(err => {
        console.error("Failed to load products", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading products...</p>;
  }

  return (
    <>
      <h2 className="page-title" style={{textAlign: "center", padding: "20px", fontSize: "2rem;"}}>Available Products in Your Region</h2>
      <ProductGrid products={products} />
    </>
  );
};

export default Products;