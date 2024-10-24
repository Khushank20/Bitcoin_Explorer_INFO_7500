import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const httpLink = new HttpLink({
  uri: 'https://graphql.bitquery.io',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': 'BQYPNot15kfMBbz2G8pS7gNoGwlOt9vW'
    // If you need an authorization token, include it here
    // 'Authorization': `Bearer YOUR_TOKEN_HERE`
  },
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
