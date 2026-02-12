import { useState, useEffect } from 'react';
import { productAPI } from '../../api/axios';
import { 
  FiSearch, 
  FiFilter, 
  FiGrid, 
  FiList,
  FiShoppingCart,
  FiEye,
  FiX,
  FiPackage,
  FiUser,
  FiTag,
  FiCalendar
} from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Categories (you can fetch from API if available)
  const categories = [
    { id: 'ALL', name: 'All Categories' },
    { id: 1, name: 'Grains' },
    { id: 2, name: 'Vegetables' },
    { id: 3, name: 'Fruits' },
    { id: 4, name: 'Dairy' },
    { id: 5, name: 'Seeds' },
  ];

  const statuses = ['ALL', 'AVAILABLE', 'PENDING', 'SOLD', 'APPROVED'];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, statusFilter, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
      // Demo data for testing
      setProducts([
        {
          productId: 1,
          productName: 'Organic Wheat',
          description: 'High quality organic wheat from Punjab farms. Perfect for making flour and bread.',
          price: 2500,
          quantityAvailable: 100,
          unit: 'kg',
          status: 'AVAILABLE',
          imageUrl: null,
          categoryId: 1,
          categoryName: 'Grains',
          sellerId: 1,
          sellerName: 'Rajesh Kumar',
          createdAt: '2024-01-15'
        },
        {
          productId: 2,
          productName: 'Fresh Tomatoes',
          description: 'Farm fresh red tomatoes. Organically grown without pesticides.',
          price: 40,
          quantityAvailable: 500,
          unit: 'kg',
          status: 'AVAILABLE',
          imageUrl: null,
          categoryId: 2,
          categoryName: 'Vegetables',
          sellerId: 2,
          sellerName: 'Amit Singh',
          createdAt: '2024-01-18'
        },
        {
          productId: 3,
          productName: 'Basmati Rice',
          description: 'Premium quality aged basmati rice. Long grain and aromatic.',
          price: 150,
          quantityAvailable: 200,
          unit: 'kg',
          status: 'PENDING',
          imageUrl: null,
          categoryId: 1,
          categoryName: 'Grains',
          sellerId: 1,
          sellerName: 'Rajesh Kumar',
          createdAt: '2024-01-20'
        },
        {
          productId: 4,
          productName: 'Fresh Mangoes',
          description: 'Alphonso mangoes from Maharashtra. Sweet and juicy.',
          price: 300,
          quantityAvailable: 50,
          unit: 'dozen',
          status: 'AVAILABLE',
          imageUrl: null,
          categoryId: 3,
          categoryName: 'Fruits',
          sellerId: 3,
          sellerName: 'Priya Sharma',
          createdAt: '2024-01-22'
        },
        {
          productId: 5,
          productName: 'Organic Milk',
          description: 'Fresh organic milk from grass-fed cows. No hormones or antibiotics.',
          price: 60,
          quantityAvailable: 100,
          unit: 'liter',
          status: 'AVAILABLE',
          imageUrl: null,
          categoryId: 4,
          categoryName: 'Dairy',
          sellerId: 4,
          sellerName: 'Suresh Yadav',
          createdAt: '2024-01-25'
        },
        {
          productId: 6,
          productName: 'Sunflower Seeds',
          description: 'High yield sunflower seeds for farming. Certified quality.',
          price: 800,
          quantityAvailable: 25,
          unit: 'kg',
          status: 'SOLD',
          imageUrl: null,
          categoryId: 5,
          categoryName: 'Seeds',
          sellerId: 2,
          sellerName: 'Amit Singh',
          createdAt: '2024-01-10'
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let result = [...products];

    // Search filter
    if (searchTerm) {
      result = result.filter(product =>
        product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sellerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(product => product.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'ALL') {
      result = result.filter(product => product.categoryId === parseInt(categoryFilter));
    }

    setFilteredProducts(result);
  };

  const getStatusClass = (status) => {
    const classes = {
      AVAILABLE: 'status-available',
      PENDING: 'status-pending',
      SOLD: 'status-sold',
      APPROVED: 'status-approved'
    };
    return classes[status] || 'status-default';
  };

  const getProductIcon = (categoryName) => {
    const icons = {
      'Grains': '🌾',
      'Vegetables': '🥬',
      'Fruits': '🍎',
      'Dairy': '🥛',
      'Seeds': '🌱'
    };
    return icons[categoryName] || '📦';
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
  };

  if (loading) {
    return <Loader size="large" text="Loading products..." />;
  }

  return (
    <div className="products-page">
      {/* Page Header */}
      <div className="products-header">
        <div className="header-left">
          <h1>Products Marketplace</h1>
          <p>Browse and discover farm products from local farmers</p>
        </div>
        <div className="header-stats">
          <div className="stat-pill">
            <FiPackage />
            <span>{products.length} Products</span>
          </div>
          <div className="stat-pill available">
            <span>{products.filter(p => p.status === 'AVAILABLE').length} Available</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="filters-left">
          {/* Search */}
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products, sellers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                <FiX />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="filter-dropdown">
            <FiFilter className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'ALL' ? 'All Status' : status}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="filter-dropdown">
            <FiTag className="filter-icon" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || statusFilter !== 'ALL' || categoryFilter !== 'ALL') && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              <FiX />
              Clear Filters
            </button>
          )}
        </div>

        <div className="filters-right">
          {/* View Toggle */}
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <FiGrid />
            </button>
            <button
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <FiList />
            </button>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info">
        <span>Showing {filteredProducts.length} of {products.length} products</span>
      </div>

      {/* Products Grid/List */}
      {filteredProducts.length > 0 ? (
        <div className={`products-container ${viewMode}`}>
          {filteredProducts.map(product => (
            <div 
              key={product.productId} 
              className={`product-card ${viewMode}`}
              onClick={() => openProductModal(product)}
            >
              {/* Product Image */}
              <div className="product-image">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.productName} />
                ) : (
                  <div className="image-placeholder">
                    <span className="product-emoji">{getProductIcon(product.categoryName)}</span>
                  </div>
                )}
                <span className={`product-status ${getStatusClass(product.status)}`}>
                  {product.status}
                </span>
                {product.categoryName && (
                  <span className="product-category">{product.categoryName}</span>
                )}
              </div>

              {/* Product Info */}
              <div className="product-info">
                <h3 className="product-name">{product.productName}</h3>
                <p className="product-description">{product.description}</p>
                
                <div className="product-meta">
                  <div className="meta-item">
                    <FiUser />
                    <span>{product.sellerName}</span>
                  </div>
                  <div className="meta-item">
                    <FiPackage />
                    <span>{product.quantityAvailable} {product.unit}</span>
                  </div>
                </div>

                <div className="product-footer">
                  <div className="product-price">
                    <span className="price-label">Price</span>
                    <span className="price-value">₹{product.price?.toLocaleString()}</span>
                    <span className="price-unit">/{product.unit}</span>
                  </div>
                  <button className="view-btn" onClick={(e) => {
                    e.stopPropagation();
                    openProductModal(product);
                  }}>
                    <FiEye />
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-products">
          <div className="empty-icon">
            <FiPackage />
          </div>
          <h3>No Products Found</h3>
          <p>Try adjusting your search or filter criteria</p>
          <button className="btn btn-primary" onClick={clearFilters}>
            Clear All Filters
          </button>
        </div>
      )}

      {/* Product Detail Modal */}
      {showModal && selectedProduct && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="product-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <FiX />
            </button>

            <div className="modal-content">
              {/* Modal Image */}
              <div className="modal-image">
                {selectedProduct.imageUrl ? (
                  <img src={selectedProduct.imageUrl} alt={selectedProduct.productName} />
                ) : (
                  <div className="modal-image-placeholder">
                    <span>{getProductIcon(selectedProduct.categoryName)}</span>
                  </div>
                )}
              </div>

              {/* Modal Info */}
              <div className="modal-info">
                <div className="modal-header-info">
                  <span className={`modal-status ${getStatusClass(selectedProduct.status)}`}>
                    {selectedProduct.status}
                  </span>
                  <span className="modal-category">
                    <FiTag />
                    {selectedProduct.categoryName || 'Uncategorized'}
                  </span>
                </div>

                <h2>{selectedProduct.productName}</h2>
                <p className="modal-description">{selectedProduct.description}</p>

                <div className="modal-price">
                  <span className="price-big">₹{selectedProduct.price?.toLocaleString()}</span>
                  <span className="price-unit">per {selectedProduct.unit}</span>
                </div>

                <div className="modal-details">
                  <div className="detail-row">
                    <span className="detail-label">
                      <FiPackage />
                      Available Quantity
                    </span>
                    <span className="detail-value">
                      {selectedProduct.quantityAvailable} {selectedProduct.unit}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">
                      <FiUser />
                      Seller
                    </span>
                    <span className="detail-value">{selectedProduct.sellerName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">
                      <FiCalendar />
                      Listed On
                    </span>
                    <span className="detail-value">
                      {new Date(selectedProduct.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                <div className="modal-actions">
                  <button className="btn btn-primary btn-lg">
                    <FiShoppingCart />
                    Contact Seller
                  </button>
                  <button className="btn btn-secondary btn-lg" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;