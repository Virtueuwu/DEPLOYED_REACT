"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import "../styles.css"

export default function CartPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cartItems, setCartItems] = useState([])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    try {
      const userData = localStorage.getItem("user")
      const parsedUser = userData ? JSON.parse(userData) : null
      setUser(parsedUser)
    } catch (e) {
      setError("Failed to load user.")
    }
  }, [router])

  useEffect(() => {
    if (!user) return
    async function fetchCart() {
      try {
        setLoading(true)
        // Use the new endpoint to get the user's cart directly
        const res = await axios.get(`https://swiftthrift-457008.as.r.appspot.com/api/cart/byUser/${user.userId}`)
        if (res.data) {
          setCart(res.data)
          setCartItems(res.data.cartItems || [])
        } else {
          setCart(null)
          setCartItems([])
        }
        setError("")
      } catch (e) {
        setCart(null)
        setCartItems([])
        setError("Failed to load cart.")
      } finally {
        setLoading(false)
      }
    }
    fetchCart()
    // Listen for cart updates
    const handleCartUpdated = () => fetchCart()
    window.addEventListener("cartUpdated", handleCartUpdated)
    return () => window.removeEventListener("cartUpdated", handleCartUpdated)
  }, [user])

  const handleRemoveItem = async (cartItemId) => {
    try {
      await axios.delete(`https://swiftthrift-457008.as.r.appspot.com/api/cartItem/delete/${cartItemId}`)
      window.dispatchEvent(new Event("cartUpdated"))
    } catch (e) {
      setError("Failed to remove item.")
    }
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
        <p>Loading...</p>
      </div>
    )
  }

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "/placeholder.svg";
    
    // If it's already an absolute URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If it's a relative URL, prepend the API base URL
    return `https://swiftthrift-457008.as.r.appspot.com${imageUrl}`;
  };

  return (
    <div className="container">
      <nav className="navbar">
        <div className="logo">Swiftthrift</div>
        <ul className="nav-links">
          <li>
            <a onClick={() => router.push("/")}>Dashboard</a>
          </li>
          <li>
            <a onClick={() => router.push("/products")}>Products</a>
          </li>
          <li>
            <a onClick={() => router.push("/wishlist")}>Wishlist</a>
          </li>
          <li>
            <a className="active">Cart</a>
          </li>
          <li>
            <a onClick={() => router.push("/orders")}>Orders</a>
          </li>
          <li>
            <a onClick={() => router.push("/settings")}>Settings</a>
          </li>
          <li>
            <a onClick={() => router.push("/about")}>About Us</a>
          </li>
        </ul>
        <div className="auth-links">
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="page-header">
        <h1>Your Cart</h1>
        <p>Review your selected items and proceed to checkout</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="featured-products">
        <div className="products-grid">
          {cartItems.length > 0 ? cartItems.map(item => (
            <div key={item.cartItemId} className="product-card">
              <div className="product-image">
                <img 
                  src={item.product?.imageUrls && item.product.imageUrls.length > 0
                    ? getImageUrl(item.product.imageUrls[0])
                    : "/placeholder.svg?height=200&width=200"}
                  alt={item.product?.name || "Product image"}
                />
              </div>
              <div className="product-info">
                <h3>{item.product?.name}</h3>
                <p className="product-description">{item.product?.description}</p>
                <p className="price">${item.price}</p>
                <button className="add-to-cart" onClick={() => handleRemoveItem(item.cartItemId)}>
                  Remove
                </button>
              </div>
            </div>
          )) : (
            <div className="no-products">
              <p>Your cart is empty.</p>
            </div>
          )}
        </div>
      </div>

      <footer className="footer">
        <p>&copy; 2025 Swiftthrift. All rights reserved.</p>
      </footer>
    </div>
  )
}
