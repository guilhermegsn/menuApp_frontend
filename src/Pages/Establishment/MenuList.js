import React, { useEffect, useState } from 'react'
import { Box, Button, Card, CardActionArea, CardContent, CardMedia, Grid, IconButton, Modal, Typography } from '@mui/material'
import { Add, HorizontalRule, ShoppingCart } from '@mui/icons-material'
import axios from 'axios'
export default function MenuList() {

  // const headers = [
  //   {
  //     key: "menuName",
  //     header: ""
  //   },
  // ]

  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [shoopingCart, setShoppingCart] = useState([])
  const [openModalCart, setOpenModalCart] = useState(false)

  

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



  const addShoppingCart = (idMenu, idItem) => {
    const menu = data.menu.find((menu) => menu._id === idMenu)
    const item = menu.menuItems.find((item) => item._id === idItem)
    const cart = shoopingCart.find((item) => item.idItem === idItem)
    if (cart) {
      const copyCart = [...shoopingCart]
      copyCart.forEach((item) => {
        if (item.idItem === idItem) {
          item.qty = item.qty + 1;
        }
      });
      setShoppingCart(copyCart)
    } else {
      console.log(item)
      setShoppingCart((itens) => [...itens, {
        idItem: idItem,
        idMenu: idMenu,
        qty: 1,
        itemName: item.itemName,
        price: item.itemPrice
        
      }])
    }
  }

  const removeShoppingCart = (idMenu, idItem) => {
    const menu = data.menu.find((menu) => menu._id === idMenu)
    const item = menu.menuItems.find((item) => item._id === idItem)
    const cart = shoopingCart.find((item) => item.idItem === idItem)
    if (cart) {
      if (cart.qty > 1) {
        const copyCart = [...shoopingCart]
        copyCart.forEach((item) => {
          if (item.idItem === idItem) {
            item.qty = item.qty - 1;
          }
        });
        setShoppingCart(copyCart)
      } else {
        const copyCart = [...shoopingCart]
        const filteredItem = copyCart.filter((item) => item.idItem !== idItem);
        setShoppingCart(filteredItem);
      }
    }
  }

  const getNumberCart = (idItem) => {
    if (shoopingCart.find((item) => item.idItem === idItem)?.qty !== undefined)
      return shoopingCart.find((item) => item.idItem === idItem)?.qty
    return 0
  }


  const createOrder = () => {
    const order = {
      userName: 'Guilherme Nunes',
      local: "Mesa 5",
      items: shoopingCart
    }
    console.log(order)
    axios.post('http://127.0.0.1:3001/order', order).then((res) => {
      console.log(res)
      alert('Pedido realizado!')
      setOpenModalCart(false)
    }).catch((e)=> {
      console.log(e)
      alert('Erro ao fazer o pedido')
    })
  }

  return (
    <div>
      {isLoading ? 'Loading...' :
        <Grid style={{ marginBottom: "50px" }}>
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
                        <IconButton color="primary" aria-label="add"
                          onClick={() => removeShoppingCart(row._id, item._id)}>
                          <HorizontalRule />
                        </IconButton> {getNumberCart(item._id)}
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
      {shoopingCart.length > 0 &&
        <div style={{ position: "fixed", bottom: "0", width: "100%" }}>
          <Button
            style={{ width: "100%", marginLeft: "-20px", height: "50px" }}
            variant="contained"
            startIcon={<ShoppingCart />}
            onClick={() => [console.log(shoopingCart), setOpenModalCart(true)]}
          >
            Carrinho</Button>
        </div>}


      <Modal
        open={openModalCart}
        onClose={() => setShoppingCart(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{
          outline: 'none',
          backgroundColor: "white",
          width: "98%",
          marginTop: "110px",
          marginBottom: "0px",
          height: "99%",
          //padding: "10px"
          overflowY: "auto",   // Adicione esta linha
        }}>
          {/* Conteúdo do Modal */}
          <Typography variant="h6" align="center" style={{ marginTop: "20px" }}>
            Itens do pedido
          </Typography>
          <div style={{ margin: "10px" }}>
            {shoopingCart.map((item) => (
              <div>
                {/* <p>{item.itemName} Qtde: {item.qty}</p> */}

                <Card
                  key={item._id}
                  style={{ margin: "7px 0px 10px 0px", padding: "15px" }}>
                  <div style={{ float: "left", width: '50%' }}>
                    <p>{item.itemName}
                      <br />${item.itemPrice} </p>

                  </div>
                  <div style={{ float: "left", width: '50%', textAlign: 'right' }}>
                    <div style={{ marginTop: "15px" }}>
                      <IconButton color="primary" aria-label="add"
                        onClick={() => removeShoppingCart(item?.idMenu, item?.idItem)}
                      >
                        <HorizontalRule />
                      </IconButton> {item.qty}
                      <IconButton color="primary" aria-label="add" onClick={() => [
                        //incrementQty(item._id),
                        addShoppingCart(item?.idMenu, item?.idItem)
                      ]}>
                        <Add />
                      </IconButton>

                    </div>

                  </div>
                  <p>{item.itemDescription}</p>
                </Card>


              </div>
            ))}
          </div>
          <div style={{ position: "fixed", bottom: "0", left: "0", right: "0", padding: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ flexBasis: "50%", padding: "5px" }}>
                <Button
                  variant="contained"
                  style={{ width: "100%" }}
                  onClick={() => [console.log(shoopingCart), createOrder()]}
                >Confirmar</Button>
              </div>
              <div style={{ flexBasis: "50%", padding: "5px" }}>
                <Button variant="contained" style={{ width: "100%" }} onClick={() => setOpenModalCart(false)}>Voltar</Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
