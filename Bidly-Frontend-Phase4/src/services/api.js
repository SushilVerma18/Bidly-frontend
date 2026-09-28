import axios from 'axios'

// In development we use Vite's proxy, so the browser talks to the same origin.
// Vite forwards /api and /ws to the Spring Boot server on 8080.
export const API_BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({ baseURL: API_BASE, headers: { 'Content-Type': 'application/json' } })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshing = null
api.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config
    if (error.response?.status === 401 && !original?._retry && localStorage.getItem('refreshToken')) {
      original._retry = true
      try {
        refreshing ||= axios.post(`${API_BASE}/api/v1/auth/refresh-token`, { refreshToken: localStorage.getItem('refreshToken') })
        const { data } = await refreshing
        refreshing = null
        const auth = data.data
        localStorage.setItem('accessToken', auth.accessToken)
        localStorage.setItem('refreshToken', auth.refreshToken)
        original.headers.Authorization = `Bearer ${auth.accessToken}`
        return api(original)
      } catch (refreshError) {
        refreshing = null
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('auctionUser')
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: body => api.post('/api/v1/auth/login', body),
  register: body => api.post('/api/v1/auth/register', body),
  refresh: refreshToken => api.post('/api/v1/auth/refresh-token', { refreshToken }),
  logout: refreshToken => api.post('/api/v1/auth/logout', { refreshToken }),
  forgotPassword: email => api.post('/api/v1/auth/forgot-password', { email }),
  resetPassword: body => api.post('/api/v1/auth/reset-password', body),
}

export const auctionApi = {
  list: (params = {}) => api.get('/api/v1/auctions', { params }),
  search: (params = {}) => api.get('/api/v1/auctions/search', { params }),
  get: id => api.get(`/api/v1/auctions/${id}`),
  mine: () => api.get('/api/v1/auctions/mine'),
  create: body => api.post('/api/v1/auctions', body),
  update: (id, body) => api.put(`/api/v1/auctions/${id}`, body),
  publish: id => api.post(`/api/v1/auctions/${id}/publish`),
  remove: id => api.delete(`/api/v1/auctions/${id}`),
  bids: (id, params = { page: 0, size: 10, sort: 'createdAt,desc' }) => api.get(`/api/v1/auctions/${id}/bids`, { params }),
  myBids: (params = {
  page: 0,
  size: 10,
  sort: 'createdAt,desc'
}) => api.get('/api/v1/bids/my', { params }),
  placeBid: (id, amount) => api.post(`/api/v1/auctions/${id}/bids`, { amount }),
  forceLive: id => api.post(`/api/v1/auctions/${id}/force-live`),
  autoBid: (id, maxBid) => api.post(`/api/v1/auctions/${id}/auto-bid`, { maxBid }),
  getAutoBid: id => api.get(`/api/v1/auctions/${id}/auto-bid`),
  cancelAutoBid: id => api.delete(`/api/v1/auctions/${id}/auto-bid`),
  addImage: (auctionId, file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post(`/api/v1/auctions/${auctionId}/images`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  deleteImage: (auctionId, imageId) => api.delete(`/api/v1/auctions/${auctionId}/images/${imageId}`),
  primaryImage: (auctionId, imageId) => api.patch(`/api/v1/auctions/${auctionId}/images/${imageId}/primary`),
}

export const categoryApi = {
  list: () => api.get('/api/v1/categories'),
  get: id => api.get(`/api/v1/categories/${id}`),
}

export const watchlistApi = {
  list: () => api.get('/api/v1/watchlist'),
  add: id => api.post(`/api/v1/watchlist/${id}`),
  remove: id => api.delete(`/api/v1/watchlist/${id}`),
}

export const profileApi = {
  get: () => api.get('/api/v1/users/me'),
  update: body => api.put('/api/v1/users/me', body),
  changePassword: body => api.put('/api/v1/users/me/password', body),
  uploadImage: file => {
    const form = new FormData(); form.append('file', file)
    return api.post('/api/v1/users/me/profile-image', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  becomeSeller: () => api.post('/api/v1/users/me/become-seller'),
}

export const notificationApi = {
  list: (params = { page: 0, size: 20, sort: 'createdAt,desc' }) => api.get('/api/v1/notifications', { params }),
  markRead: id => api.patch(`/api/v1/notifications/${id}/read`),
  unreadCount: () => api.get('/api/v1/notifications/unread-count'),
}

export const adminApi = {
  stats: () => api.get('/api/v1/admin/stats'),
  users: (params = {}) => api.get('/api/v1/admin/users', { params }),
  banUser: id => api.patch(`/api/v1/admin/users/${id}/ban`),
  unbanUser: id => api.patch(`/api/v1/admin/users/${id}/unban`),
  removeAuction: id => api.delete(`/api/v1/admin/auctions/${id}`),
  createCategory: body => api.post('/api/v1/admin/categories', body),
  updateCategory: (id, body) => api.put(`/api/v1/admin/categories/${id}`, body),
  deleteCategory: id => api.delete(`/api/v1/admin/categories/${id}`),
}

export const paymentApi = {
  initiate: auctionId =>
    api.post(`/api/v1/payments/auctions/${auctionId}/initiate`),

  history: (params = {}) =>
    api.get('/api/v1/payments/my-history', { params }),

  get: id =>
    api.get(`/api/v1/payments/${id}`),

  refund: id =>
    api.post(`/api/v1/payments/${id}/refund`),

  // DEV ONLY
  simulateSuccess: id =>
    api.post(`/api/v1/payments/${id}/simulate-success`),

}
export const bidApi = {
  myBids: (params = {
    page: 0,
    size: 20,
    sort: 'createdAt,desc',
  }) =>
    api.get('/api/v1/bids/my', { params }),
}
export const initiatePayment = async (auctionId) => {
  const response = await api.post(
    `/api/v1/payments/auctions/${auctionId}/initiate`
  );

  return response.data;
};

export default api
