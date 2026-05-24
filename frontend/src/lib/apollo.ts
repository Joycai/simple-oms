'use client'

import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'
import { getToken } from './auth'

const ORDER_GQL = process.env.NEXT_PUBLIC_ORDER_GQL || 'http://localhost:8081/graphql'

export const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: ORDER_GQL,
    headers: {
      Authorization: typeof window !== 'undefined' ? `Bearer ${getToken() || ''}` : '',
    },
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
})
