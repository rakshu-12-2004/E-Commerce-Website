import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: BASE_URL })

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  getMe: () => api.get('/api/auth/me'),
}

export const dashboardAPI = {
  getKPI: (params) => api.get('/api/dashboard/kpi', { params }),
  getRevenueChart: (params) => api.get('/api/dashboard/revenue-chart', { params }),
  getCategorySales: (params) => api.get('/api/dashboard/category-sales', { params }),
  getTopProducts: (params) => api.get('/api/dashboard/top-products', { params }),
  getAIInsights: () => api.get('/api/dashboard/ai-insights'),
}

export const salesAPI = {
  getOrders: (params) => api.get('/api/sales/orders', { params }),
  exportCSV: (params) => api.get('/api/sales/export', {
    params,
    responseType: 'blob',
  }),
}

export const productsAPI = {
  getProducts: (params) => api.get('/api/products/', { params }),
  getCategories: () => api.get('/api/products/categories'),
}

export const customersAPI = {
  getCustomers: (params) => api.get('/api/customers/', { params }),
}

export default api
