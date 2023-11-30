import React, { useContext, useState } from 'react'
import {
  AppBar,
  Badge,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography
} from '@mui/material';
import { ChecklistRtl, Home, LocationCity, Login, Logout, Menu, ShoppingCart, VerifiedUser } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';

export default function MenuBar() {
  const { isAuthenticated, logout, dataUser, shoopingCart } = useContext(UserContext)
  const [open, setOpen] = useState(false);
  const history = useHistory();
  const handleToggleDrawer = () => {
    setOpen(!open);
  };

  const enterPage = (page) => {
    history.push(page)
    handleToggleDrawer()
  }


  return (
    <div>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleToggleDrawer}>
            <Menu />
          </IconButton>

          <Typography variant="h6">Menu</Typography>

          {/* Adicionando espaçamento à direita com o Box */}
          <Box sx={{ flexGrow: 1 }} />

          {shoopingCart.length > 0 &&
            <Badge badgeContent={shoopingCart.length} color="secondary">
              <ShoppingCart onClick={() => history.push('/shopping-cart')} />
            </Badge>
          }
        </Toolbar>
      </AppBar>
      <Drawer open={open} onClose={handleToggleDrawer}>
        <List style={{ width: "15em", marginTop: "70px" }}>
          {isAuthenticated &&
            <p style={{ marginLeft: "15px" }}> Bem vindo(a)! {dataUser?.email}</p>}
          <ListItem onClick={() => enterPage("/establishment/menu/list")}>
            <ListItemIcon>
              <Home />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>

          <ListItem onClick={() => console.log(dataUser)}>
            <ListItemIcon>
              <VerifiedUser />
            </ListItemIcon>
            <ListItemText primary="User" />
          </ListItem>

          {isAuthenticated ?
            <>
              <ListItem onClick={() => enterPage('/shopping-cart')}>
                <ListItemIcon>
                  <ShoppingCart />
                </ListItemIcon>
                <ListItemText primary="Carrinho" />
              </ListItem>

              <ListItem onClick={() => [history.push('/orders')]}>
                <ListItemIcon>
                  <ChecklistRtl />
                </ListItemIcon>
                <ListItemText primary="Meus pedidos" />
              </ListItem>

              <ListItem onClick={() => [logout(), history.push('/login'), setOpen(false)]}>
                <ListItemIcon>
                  <Logout />
                </ListItemIcon>
                <ListItemText primary="Sair" />
              </ListItem>
            </>
            :
            <ListItem onClick={() => enterPage("/login")}>
              <ListItemIcon>
                <Login />
              </ListItemIcon>
              <ListItemText primary="Entrar" />
            </ListItem>

          }

          <ListItem >
            <ListItemIcon>
              <LocationCity />
            </ListItemIcon >
            <ListItemText onClick={() => enterPage('/establishment/registry')} primary="Cadastrar estabelecimento" />
          </ListItem>
        </List>
        {/* <p>{dataUser.email}</p> */}
        {/* <button onClick={()=> console.log(isAuthenticated)}>isAuthenticated</button>
        <button onClick={()=> console.log(dataUser)}>dataUser</button> */}
      </Drawer>
    </div>
  )
}
