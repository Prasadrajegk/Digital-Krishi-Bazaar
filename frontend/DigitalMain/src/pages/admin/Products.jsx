import { useEffect, useState } from "react"
import ProductGrid from "../../components/product/ProductGrid"
import { getApprovedProducts } from "../../services/product.service"

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getApprovedProducts()
      .then(res => setProducts(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{textAlign:"center"}}>Loading products...</p>

  return (
    <>
      <h2 className="page-title">Available Products</h2>
      <ProductGrid products={products} />
    </>
  )
}

export default Products
