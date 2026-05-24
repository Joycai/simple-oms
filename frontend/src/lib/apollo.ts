'use client'

import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { getToken, clearAuth } from './auth'

const ORDER_GQL = process.env.NEXT_PUBLIC_ORDER_GQL || 'http://localhost:8081/graphql'

const httpLink = new HttpLink({ uri: ORDER_GQL })

const authLink = setContext((_, { headers }) => {
  const token = getToken()
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }
})

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      // Check for 401/403 or specific GraphQL error codes
      const status = (err.extensions?.response as any)?.status
      if (status === 401 || status === 403 || err.message?.includes('Access denied')) {
        console.warn('[Apollo] Auth error detected, redirecting to login...')
        clearAuth()
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('cart_count')
          sessionStorage.setItem('login_message', '登录已过期，请重新登录')
          sessionStorage.setItem('login_redirect', window.location.pathname)
          window.location.href = '/login'
        }
      }
    }
  }
  if (networkError) {
    console.error(`[Apollo] Network error: ${networkError}`)
  }
})

export const apolloClient = new ApolloClient({
  link: from([authLink, errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
})
