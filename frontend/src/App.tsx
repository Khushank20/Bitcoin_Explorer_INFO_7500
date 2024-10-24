import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import client from './apolloClient';
import MinerDetails from './MinerDetails';
import AddressDetails from './AddressDetails'; // Assume this is your new component for address details

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <div className="App">
          <header className="App-header">
            <Routes>
              <Route path="/" element={<MinerDetails />} />
              <Route path="/address/:address" element={<AddressDetails />} />
            </Routes>
          </header>
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
