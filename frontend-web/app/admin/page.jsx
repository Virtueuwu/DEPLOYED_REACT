"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import "../styles.css"

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [categories, setCategories] = useState([])

  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    condition: '',
    isSold: false,
    category:{
      categoryId: "",
    },
  })

  const [files, setFiles] = useState(null)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("product")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [category, setCategory] = useState({ categoryName: "" })

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories()
    }
  }, [isAuthenticated])

  const fetchCategories = async () => {
    try {
      const response = await axios.get("https://swiftthrift-457008.as.r.appspot.com/api/categories/all")
      setCategories(response.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleSignIn = async () => {
    try {
      setError("")
      const response = await axios.post("https://swiftthrift-457008.as.r.appspot.com/api/admins/login", {
        username,
        password,
      })
      if (response.status === 200) {
        setIsAuthenticated(true)
      }
    } catch (error) {
      setError("Login failed. Please check your credentials.")
    }
  }

  const handleAddProduct = async () => {
    try {
      setError("")
      if (!product.name || !product.description || !product.price || !product.categoryId) {
        setError("Please fill in all product fields.")
        return
      }

      const payload = {
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        condition: parseInt(product.condition),
        isSold: product.isSold,
        category: {
          categoryId: parseInt(product.categoryId),
        },
      }
    
      const formData = new FormData()
      formData.append("product", new Blob([JSON.stringify(payload)], { type: "application/json" }))
      if (files) {
        Array.from(files).forEach((file) => formData.append("files", file))
      }

      await axios.post("https://swiftthrift-457008.as.r.appspot.com/api/products/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      alert("Product added successfully!")
      setProduct({ name: "", description: "", price: "", itemCondition: 0, categoryId: "" })
      setFiles(null)
      window.dispatchEvent(new Event("productsUpdated"))
    } catch (error) {
      console.error("Error adding product:", error.response?.data || error.message)
      setError("Error adding product: " + (error.response?.data || error.message))
    }
  }

  const handleAddCategory = async () => {
    try {
      setError("")
      if (!category.categoryName) {
        setError("Please enter a category name")
        return
      }

      await axios.post("https://swiftthrift-457008.as.r.appspot.com/api/categories/create", category)
      alert("Category added successfully!")
      setCategory({ categoryName: "" })
      fetchCategories() // Refresh the dropdown
    } catch (error) {
      setError("Error adding category: " + (error.response?.data?.message || error.message))
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container">
        {/* Navigation and Login Form */}
        {/* (Same as before, you can keep your navbar and footer) */}
        <div className="auth-container">
          <div className="auth-forms">
            {error && <div className="error-message">{error}</div>}
            <form
              className="login-form"
              onSubmit={(e) => {
                e.preventDefault()
                handleSignIn()
              }}
            >
              <h2>Admin Login</h2>
              <p className="form-description">Sign in to access the admin dashboard</p>

              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>

              <button type="submit" className="submit-btn">
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="dashboard">
        <div className="welcome-section">
          <h1>Admin Dashboard</h1>
          <p>Manage your products, categories, and more</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === "product" ? "active" : ""}`}
            onClick={() => setActiveTab("product")}
          >
            Add Product
          </button>
          <button
            className={`admin-tab ${activeTab === "category" ? "active" : ""}`}
            onClick={() => setActiveTab("category")}
          >
            Add Category
          </button>
        </div>

        <div className="admin-content">
          {activeTab === "product" && (
            <div className="admin-form">
              <h2>Add New Product</h2>
              <div className="form-group">
                <label htmlFor="product-name">Product Name</label>
                <input
                  type="text"
                  id="product-name"
                  placeholder="Enter product name"
                  value={product.name}
                  onChange={(e) => setProduct({ ...product, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="product-description">Description</label>
                <textarea
                  id="product-description"
                  placeholder="Enter product description"
                  value={product.description}
                  onChange={(e) => setProduct({ ...product, description: e.target.value })}
                  rows="4"
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="product-price">Price</label>
                <input
                  type="number"
                  id="product-price"
                  placeholder="Enter price"
                  value={product.price}
                  onChange={(e) => setProduct({ ...product, price: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="item-condition">Condition</label>
                <select
                  id="item-condition"
                  value={product.condition}
                  onChange={(e) => setProduct({ ...product, itemCondition: e.target.value })}
                >
                  <option value="0">New</option>
                  <option value="1">Used</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={product.categoryId}
                  onChange={(e) => setProduct({ ...product, categoryId: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="product-images">Product Images</label>
                <div className="file-input-container">
                  <input
                    type="file"
                    id="product-images"
                    multiple
                    onChange={(e) => setFiles(e.target.files)}
                    className="file-input"
                  />
                  <div className="file-input-label">{files ? `${files.length} file(s) selected` : "Choose files"}</div>
                </div>
              </div>

              <button onClick={handleAddProduct} className="submit-btn">
                Add Product
              </button>
            </div>
          )}

          {activeTab === "category" && (
            <div className="admin-form">
              <h2>Add New Category</h2>
              <div className="form-group">
                <label htmlFor="category-name">Category Name</label>
                <input
                  type="text"
                  id="category-name"
                  placeholder="Enter category name"
                  value={category.categoryName}
                  onChange={(e) => setCategory({ ...category, categoryName: e.target.value })}
                />
              </div>
              <button onClick={handleAddCategory} className="submit-btn">
                Add Category
              </button>
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
