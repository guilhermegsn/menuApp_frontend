import React, { useContext, useEffect, useState } from 'react'
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
import { BookOnline, LocationCity, Login, Logout, Menu, ShoppingCart } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'

export default function MenuBar() {
  const { isAuthenticated, dataUser, shoopingCart, establishmentData, setEstablishmentData, clientIdUrl, idEstablishment, logout } = useContext(UserContext)
  const [open, setOpen] = useState(false);
  const history = useHistory();
  const userUrl = sessionStorage.getItem('establishmentUrl')
  const handleToggleDrawer = () => {
    setOpen(!open);
  };

  const enterPage = (page) => {
    history.push(page)
    handleToggleDrawer()
  }

  useEffect(() => {
    const getDataEstablishment = async () => {
      console.log('clientIdUrl', clientIdUrl)
      console.log('isetablish', idEstablishment)
      if (idEstablishment) {
        const docRef = doc(db, "Establishment", idEstablishment);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() }
          setEstablishmentData(data)
        } else {
          console.log("Nenhum documento encontrado!");
          return null;
        }
      } else {
        console.log('sem id')
      }
    }
    getDataEstablishment()
  }, [setEstablishmentData, clientIdUrl, idEstablishment])


  return (
    <div>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleToggleDrawer}>
            <Menu />
          </IconButton>

          <Typography variant="h6">{establishmentData?.name || "Wise Menu"}</Typography>

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
          {userUrl &&
            <ListItem onClick={() => enterPage(userUrl)}>
              <ListItemIcon>
                <BookOnline />
              </ListItemIcon>
              <ListItemText primary="Cardápio" />
            </ListItem>
          }
          {userUrl &&
            <ListItem onClick={() => enterPage('/shopping-cart')}>
              <ListItemIcon>
                <ShoppingCart />
              </ListItemIcon>
              <ListItemText primary="Carrinho" />
            </ListItem>
          }
          {/* {isAuthenticated ?
            <>
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
          } */}

          <ListItem >
            <ListItemIcon>
              <LocationCity />
            </ListItemIcon >
            <ListItemText onClick={() => console.log(establishmentData)} primary="Conheça a Wise Menu" />
          </ListItem>
        </List>


        {/* <button onClick={()=> console.log(isAuthenticated)}>isAuthenticated</button>
        <button onClick={()=> console.log(dataUser)}>dataUser</button>
        <button onClick={()=> console.log(userUrl)}>userUrl</button>
        <button onClick={()=> console.log(establishmentData)}>establishmentData</button> */}
      </Drawer>
    </div>
  )
}
