import ProductCard from "./ProductCard"
import "../../styles/product.css"

const ProductGrid = ({ products }) => {
  return (
    <div className="product-grid container">
      {products.map((p) => (
        <ProductCard
          key={p.productId}   
          product={p}
        />
      ))}
    </div>
  )
}


export default ProductGrid
