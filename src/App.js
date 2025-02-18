import React from 'react';
import MenuBar from './Components/MenuBar/MenuBar';
import Routes from './Routes';
import UserProvider from './contexts/UserContext';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme'

function App() {

  const queryClient = new QueryClient();

  return (
    <div>
      <UserProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <Router>
              <MenuBar />
              <Routes />
            </Router>
          </ThemeProvider>
        </QueryClientProvider>
      </UserProvider>
    </div>
  );
}

export default App;
