import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2F0548', 
    },
    secondary: {
      main: '#c6ff00', // Rosa, altere conforme necessário
    },
    background: {
      default: '#f5f5f5', // Cor de fundo geral
      paper: '#ffffff', // Cor de fundo dos cards
    },
    text: {
      primary: '#333333', // Cor do texto principal
      secondary: '#555555', // Cor do texto secundário
    },
  },
});

export default theme;
