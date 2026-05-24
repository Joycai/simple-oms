import { getToken } from './auth'

const ORDER_API = process.env.NEXT_PUBLIC_ORDER_API || 'http://localhost:8081/api/v1'

export async function orderFetch(path: string, options: RequestInit = {}) {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${ORDER_API}${path}`, { ...options, headers })
  if (res.status === 401) {
    sessionStorage.setItem('login_redirect', window.location.pathname)
    window.location.href = '/login'
  }
  return res
}

// ── Storefront ─────────────────────────────────────────────────

export async function fetchCategories() {
  const res = await orderFetch('/categories')
  return res.json()
}

export async function fetchItems(params?: { categoryId?: number; keyword?: string }) {
  const qs = new URLSearchParams()
  if (params?.categoryId) qs.set('categoryId', String(params.categoryId))
  if (params?.keyword) qs.set('keyword', params.keyword)
  const res = await orderFetch(`/items?${qs}`)
  return res.json()
}

export async function fetchItem(id: number) {
  const res = await orderFetch(`/items/${id}`)
  return res.json()
}

// ── Cart ────────────────────────────────────────────────────────

export async function fetchCart() {
  const res = await orderFetch('/cart')
  return res.json()
}

export async function addToCart(itemId: number, quantity: number) {
  const res = await orderFetch('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ itemId, quantity }),
  })
  return res.json()
}

export async function updateCartItem(id: number, quantity: number) {
  const res = await orderFetch(`/cart/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  })
  return res.json()
}

export async function removeCartItem(id: number) {
  await orderFetch(`/cart/items/${id}`, { method: 'DELETE' })
}

// ── Orders ─────────────────────────────────────────────────────

export async function checkout() {
  const res = await orderFetch('/orders', { method: 'POST' })
  return res.json()
}

export async function fetchBuyerOrders() {
  const res = await orderFetch('/orders')
  return res.json()
}

export async function fetchOrder(id: number) {
  const res = await orderFetch(`/orders/${id}`)
  return res.json()
}

export async function confirmDelivered(id: number) {
  const res = await orderFetch(`/orders/${id}/deliver`, { method: 'POST' })
  return res.json()
}

// ── Seller ─────────────────────────────────────────────────────

export async function fetchSellerItems() {
  const res = await orderFetch('/seller/items')
  return res.json()
}

export async function createItem(data: Record<string, unknown>) {
  const res = await orderFetch('/seller/items', { method: 'POST', body: JSON.stringify(data) })
  return res.json()
}

export async function updateItem(id: number, data: Record<string, unknown>) {
  const res = await orderFetch(`/seller/items/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  return res.json()
}

export async function fetchSellerOrders() {
  const res = await orderFetch('/seller/orders')
  return res.json()
}

export async function markPaid(orderId: number) {
  const res = await orderFetch(`/seller/orders/${orderId}/pay`, { method: 'POST' })
  return res.json()
}

export async function shipOrder(orderId: number, trackingNumber: string) {
  const res = await orderFetch(`/seller/orders/${orderId}/ship`, {
    method: 'POST',
    body: JSON.stringify({ trackingNumber }),
  })
  return res.json()
}
