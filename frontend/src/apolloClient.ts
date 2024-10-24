import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const httpLink = new HttpLink({
  uri: 'https://graphql.bitquery.io',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': 'BQYw2ocQIHducYUJIL5Xu1i32edHtf0N'
    // If you need an authorization token, include it here
    // 'Authorization': `Bearer YOUR_TOKEN_HERE`
  },
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
