"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import "./styles.css"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [wishlistItems, setWishlistItems] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [error, setError] = useState(null)
  
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    // Get user data from localStorage
    try {
      const userData = localStorage.getItem("user")
      const parsedUser = userData ? JSON.parse(userData) : null
      setUser(parsedUser)
      
      if (parsedUser) {
        // Fetch data when user is available
        fetchDashboardData(parsedUser.userId)
      }
    } catch (error) {
      console.error("Error parsing user data:", error)
      setError("Failed to load user data. Please try logging in again.")
    }
  }, [router])

  async function fetchDashboardData(userId) {
    try {
      setLoading(true)
      
      // Fetch products, wishlist and cart in parallel
      const [productsResponse, wishlistResponse, cartResponse] = await Promise.all([
        axios.get('http://localhost:8080/api/products'),
        fetchUserWishlist(userId),
        fetchUserCart(userId)
      ])

      // Set products and get recommendations (most recent or featured items)
      const allProducts = productsResponse.data
      setProducts(allProducts.slice(0, 8)) // Show first 8 products as recommended
      
      setLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError("Failed to load dashboard data. Please try again later.")
      setLoading(false)
    }
  }

  async function fetchUserWishlist(userId) {
    try {
      const wishlistRes = await axios.get(`http://localhost:8080/api/wishlist/byUser/${userId}`)
      
      if (wishlistRes.data && wishlistRes.data.length > 0) {
        const wishlistId = wishlistRes.data[0].wishlistId || wishlistRes.data[0].id
        const itemsRes = await axios.get(`http://localhost:8080/api/wishlistItems/wishlist/${wishlistId}`)
        setWishlistItems(itemsRes.data.slice(0, 4)) // Show only 4 wishlist items on dashboard
        return itemsRes
      } else {
        setWishlistItems([])
        return { data: [] }
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error)
      setWishlistItems([])
      return { data: [] }
    }
  }

  async function fetchUserCart(userId) {
    try {
      const cartRes = await axios.get(`http://localhost:8080/api/cart/user/${userId}`)
      
      if (cartRes.data) {
        const cartId = cartRes.data.cartId || cartRes.data.id
        const itemsRes = await axios.get(`http://localhost:8080/api/cartItems/cart/${cartId}`)
        setCartItems(itemsRes.data.slice(0, 4)) // Show only 4 cart items on dashboard
        return itemsRes
      } else {
        setCartItems([])
        return { data: [] }
      }
    } catch (error) {
      console.error("Error fetching cart:", error)
      setCartItems([])
      return { data: [] }
    }
  }

  // Helper function to handle image URLs
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "/placeholder.svg"

    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl
    }

    if (!imageUrl.startsWith("/")) {
      imageUrl = "/" + imageUrl
    }

    return `http://localhost:8080${imageUrl}`
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="container">
      <nav className="navbar">
        <div className="logo">Swiftthrift</div>
        <ul className="nav-links">
          <li>
            <a className="active">Dashboard</a>
          </li>
          <li>
            <a onClick={() => router.push("/products")}>Products</a>
          </li>
          <li>
            <a onClick={() => router.push("/wishlist")}>Wishlist</a>
          </li>
          <li>
            <a onClick={() => router.push("/cart")}>Cart</a>
          </li>
          <li>
            <a onClick={() => router.push("/orders")}>Orders</a>
          </li>
          <li>
            <a onClick={() => router.push("/about")}>About Us</a>
          </li>
        </ul>
        <div className="auth-links">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      <div className="page-header">
        <h1>Welcome back, {user?.name || 'User'}!</h1>
        <p>Your personalized shopping dashboard</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-grid">
        {/* Recommended Products Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recommended Products</h2>
            <button 
              className="view-all-btn" 
              onClick={() => router.push("/products")}
            >
              View All
            </button>
          </div>
          <div className="mini-products-grid">
            {products.length > 0 ? (
              products.slice(0, 4).map((product) => (
                <div key={product.id} className="mini-product-card" onClick={() => router.push(`/products/${product.id}`)}>
                  <div className="mini-product-image">
                    <img
                      src={product.imageUrls && product.imageUrls.length > 0
                        ? getImageUrl(product.imageUrls[0])
                        : "/placeholder.svg"}
                      alt={product.name}
                    />
                  </div>
                  <div className="mini-product-info">
                    <h3>{product.name}</h3>
                    <p className="price">${product.price}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-items">No recommended products available at the moment.</p>
            )}
          </div>
        </div>

        {/* Wishlist Preview Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Your Wishlist</h2>
            <button 
              className="view-all-btn" 
              onClick={() => router.push("/wishlist")}
            >
              View All
            </button>
          </div>
          <div className="mini-products-grid">
            {wishlistItems.length > 0 ? (
              wishlistItems.map((item) => (
                <div key={item.wishlistItemId || item.id} className="mini-product-card">
                  <div className="mini-product-image">
                    <img
                      src={item.product.imageUrls && item.product.imageUrls.length > 0
                        ? getImageUrl(item.product.imageUrls[0])
                        : "/placeholder.svg"}
                      alt={item.product.name}
                    />
                  </div>
                  <div className="mini-product-info">
                    <h3>{item.product.name}</h3>
                    <p className="price">${item.product.price}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-items">
                <p>Your wishlist is empty</p>
                <button className="browse-btn" onClick={() => router.push("/products")}>
                  Browse Products
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cart Preview Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Your Cart</h2>
            <button 
              className="view-all-btn" 
              onClick={() => router.push("/cart")}
            >
              View All
            </button>
          </div>
          <div className="mini-products-grid">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div key={item.cartItemId || item.id} className="mini-product-card">
                  <div className="mini-product-image">
                    <img
                      src={item.product.imageUrls && item.product.imageUrls.length > 0
                        ? getImageUrl(item.product.imageUrls[0])
                        : "/placeholder.svg"}
                      alt={item.product.name}
                    />
                  </div>
                  <div className="mini-product-info">
                    <h3>{item.product.name}</h3>
                    <p className="mini-product-details">
                      <span className="price">${item.product.price}</span>
                      <span className="quantity">Qty: {item.quantity}</span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-items">
                <p>Your cart is empty</p>
                <button className="browse-btn" onClick={() => router.push("/products")}>
                  Browse Products
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; 2025 Swiftthrift. All rights reserved.</p>
      </footer>
    </div>
  )
}
