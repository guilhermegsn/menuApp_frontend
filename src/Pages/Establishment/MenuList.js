import React, { useEffect, useState } from 'react'
import { Box, Button, Card, CardActionArea, CardContent, CardMedia, CircularProgress, FormControl, Grid, IconButton, InputLabel, MenuItem, Modal, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, TextareaAutosize, Typography } from '@mui/material'
import { Add, Delete, HorizontalRule, Minimize } from '@mui/icons-material'
import axios from 'axios'
export default function MenuList() {

  const headers = [
    {
      key: "menuName",
      header: ""
    },
  ]

  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [shoopingCart, setShoppingCart] = useState([])

  useEffect(() => {
    setIsLoading(true)
    axios.get('http://127.0.0.1:3001/establishment/64d442c645841a5a831e8ec2').then((res) => {
      //adicionando o qtributo 'qty' aos objetos
      const newDataMenu = res.data.menu.map((menu) => {
        const clonedMenu = { ...menu };
        // Adicionando atributo 'qty' a cada objeto 'menuItems' dentro do 'menu'
        clonedMenu.menuItems.forEach((item) => {
          item.qty = 0
        })
        return clonedMenu;
      });
      const pData = res.data
      setData({ ...pData, menu: newDataMenu })
    }).finally(() => setIsLoading(false))
  }, [])

  const addQty = (idMenu, idItem) => {
    const updatedMenu = data.menu.map((menu) => {
      if (menu._id === idMenu) {
        const updatedMenuItems = menu.menuItems.map((item) => {
          if (item._id === idItem) {
            return {
              ...item,
              qty: item.qty + 1,
            }
          }
          return item
        })
        return {
          ...menu,
          menuItems: updatedMenuItems,
        }
      }
      return menu;
    })
    setData({
      ...data,
      menu: updatedMenu,
    });
  };

  const decQty = (idMenu, idItem) => {
    const updatedMenu = data.menu.map((menu) => {
      if (menu._id === idMenu) {
        const updatedMenuItems = menu.menuItems.map((item) => {
          if (item._id === idItem) {
            return {
              ...item,
              qty: (item.qty <= 0 ? 0 : item.qty - 1),
            }
          }
          return item
        })
        return {
          ...menu,
          menuItems: updatedMenuItems,
        }
      }
      return menu;
    })
    setData({
      ...data,
      menu: updatedMenu,
    });
  };

  const addShoppingCart = (idMenu, idItem) => {
    const menu = data.menu.find((menu) => menu._id === idMenu)
    const item = menu.menuItems.find((item) => item._id === idItem)
    const cart = shoopingCart.find((item) => item.idItem === idItem)
    if (cart) {
      cart.qty += 1      
    } else {
      setShoppingCart((itens) => [...itens, {
        idItem: idItem,
        qty: 1,
        itemName: item.itemName
      }])
    }
    addQty(idMenu, idItem)
  }

  const removeShoppingCart = (idMenu, idItem) => {
    const menu = data.menu.find((menu) => menu._id === idMenu)
    const item = menu.menuItems.find((item) => item._id === idItem)
    const cart = shoopingCart.find((item) => item.idItem === idItem)
    if (cart?.qty > 1) {
      cart.qty -= 1    
    }else{
      const copyCart = [ ...shoopingCart]
      const filteredItem = copyCart.filter((item) => item.idItem !== idItem);
      setShoppingCart(filteredItem); // Se você estiver usando o estado
    } 
    decQty(idMenu, idItem)  
  }


  return (
    <div>
      {/* <button onClick={() => console.log(data)}>data</button>
      <button onClick={() => console.log(shoopingCart)}>cart</button> */}
      {isLoading ? 'Loading...' :
        <Grid>
          {data && data.menu?.map((row) => (
            <div key={row._id}>
              <Card>
                <CardActionArea>
                  <CardMedia
                    component="img"
                    height="140"
                    //image="/img/cerveja.jpg"
                    image={row.urlImg}
                    alt="green iguana"
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {row.menuName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
              {row.menuItems.map((item) => {
                return (
                  <Card variant="outlined"
                    key={item._id}
                    style={{ margin: "7px 0px 10px 0px", padding: "15px" }}>
                    <div style={{ float: "left", width: '50%' }}>
                      <p>{item.itemName}
                        <br />${item.itemPrice} </p>

                    </div>
                    <div style={{ float: "left", width: '50%', textAlign: 'right' }}>
                      <div style={{ marginTop: "15px" }}>
                        <IconButton color="primary" aria-label="add" onClick={()=>  removeShoppingCart(row._id, item._id)}>
                          <HorizontalRule />
                        </IconButton> {item.qty}
                        <IconButton color="primary" aria-label="add" onClick={() => [
                          //incrementQty(item._id),
                          addShoppingCart(row._id, item._id)
                        ]}>
                          <Add />
                        </IconButton>

                      </div>

                    </div>
                    <p>{item.itemDescription}</p>
                  </Card>
                )
              })}
            </div>
          ))}




        </Grid>}



    </div>
  )
}
