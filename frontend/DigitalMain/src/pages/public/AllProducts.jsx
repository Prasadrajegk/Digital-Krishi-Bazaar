import { useEffect, useState } from "react";
import ProductGrid from "../../components/product/ProductGrid";
import { getApprovedProducts } from "../../services/allproducts.service";
import { FaSearch } from "react-icons/fa";




const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApprovedProducts()
      .then(res => {
        setProducts(res.data);
        setFilteredProducts(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔍 SEARCH LOGIC
  useEffect(() => {
    const result = products.filter(product =>
      product.productName
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );

    setFilteredProducts(result);
  }, [search, products]);

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading products...</p>;
  }

  return (
    <>
      <h2
        className="page-title"
        style={{ textAlign: "center", padding: "20px", fontSize: "2rem" }}
      >
        Available Products
      </h2>

     {/* 🔍 SEARCH BAR */}
<div
  style={{
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  }}
>
  <div
    style={{
      position: "relative",
      width: "320px",
    }}
  >
    <FaSearch
      style={{
        position: "absolute",
        top: "50%",
        left: "12px",
        transform: "translateY(-50%)",
        color: "#888",
        fontSize: "16px",
      }}
    />

    <input
      type="text"
      placeholder="Search products by name..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      style={{
        width: "100%",
        padding: "10px 14px 10px 38px", // left space for icon
        fontSize: "16px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        outline: "none",
      }}
    />
  </div>
</div>


      {/* PRODUCTS */}
      {filteredProducts.length === 0 ? (
        <p style={{ textAlign: "center" }}>No products found.</p>
      ) : (
        <ProductGrid products={filteredProducts} />
      )}
    </>
  );
};

export default AllProducts;
