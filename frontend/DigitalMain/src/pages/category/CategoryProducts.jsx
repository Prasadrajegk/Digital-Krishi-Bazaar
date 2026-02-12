import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductGrid from "../../components/product/ProductGrid"; 
import { getProductsByCategory } from "../../services/product.service";

const CategoryProducts = () => {
  const { id } = useParams(); // 👈 category id
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    getProductsByCategory(id)
      .then(res => setProducts(res.data || []))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="center">Loading products...</p>;

  return <ProductGrid products={products} />;
};

export default CategoryProducts;
