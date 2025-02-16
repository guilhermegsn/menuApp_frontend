import React from 'react';
import MenuBar from './Components/MenuBar/MenuBar';
import Routes from './Routes';
import UserProvider from './contexts/UserContext';
import { BrowserRouter as Router } from 'react-router-dom';

function App() {

  return (
    <div>
      <UserProvider>
        <Router>
          <MenuBar />
          <Routes />
        </Router>
      </UserProvider>
    </div>
  );
}

export default App;
