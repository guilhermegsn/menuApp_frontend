import React from 'react';
import MenuBar from './Components/MenuBar/MenuBar';
import Routes from './Routes';
import UserProvider from './contexts/UserContext';


function App() {

  return (
    <div>
      <UserProvider>
        <MenuBar />
        <Routes />
      </UserProvider>
    </div>
  );
}

export default App;
