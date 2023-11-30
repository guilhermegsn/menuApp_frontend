import React, { useContext, useEffect, useState } from 'react'
import { Button, Card, Grid, IconButton } from '@mui/material'
import { UserContext } from '../../contexts/UserContext'
import { Add, FlipToBackOutlined, HorizontalRule } from '@mui/icons-material'
import { useHistory } from 'react-router-dom/cjs/react-router-dom';

export default function ProductList(props) {

  const history = useHistory();
  const { menuId } = props.match.params
  const { dataMenu } = useContext(UserContext)
  const [dataProducts, setDataProducts] = useState([])
  const { shoopingCart, setShoppingCart } = useContext(UserContext)


  useEffect(() => {
    setDataProducts(dataMenu?.menu?.find((item) => item.id === menuId).items)
  }, [dataMenu, menuId])


  const addShoppingCart = (idMenu, idItem) => {
    console.log('id item: ' + idItem)
    console.log('id menu: ' + idMenu)
    const menu = dataMenu.menu.find((menu) => menu.id === idMenu)
    const item = menu.items.find((item) => item.id === idItem)


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
        name: item.name,
        price: item.price

      }])
    }
  }

  const removeShoppingCart = (idItem) => {
    //const menu = data.menu.find((menu) => menu.id === idMenu)
    // const item = menu.menuItems.find((item) => item.id === idItem)
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


  return (
    <div>

      <Grid container spacing={2} >
        {
          dataProducts && dataProducts?.map((item, index) => (
            <Grid item xs={16} md={3} sm={4}>
              {/* <Card >
                  <CardActionArea>
                    <CardContent>
                      <Typography gutterBottom variant="h8" component="div">
                        {item.name}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card> */}

              <Card variant="outlined"
                key={index}
                style={{ padding: "15px" }}>
                <div style={{ float: "left", width: '50%' }}>
                  <p>{item.name}
                    <br />
                    ${item.price}
                  </p>
                </div>
                <div style={{ float: "left", width: '50%', textAlign: 'right' }}>
                  <div style={{ marginTop: "15px" }}>
                    <IconButton color="primary" aria-label="add"
                      onClick={() => removeShoppingCart(item.id)}>
                      <HorizontalRule />
                    </IconButton> {getNumberCart(item.id)}
                    <IconButton color="primary" aria-label="add" onClick={() => [
                      //incrementQty(item.id),
                      addShoppingCart(menuId, item.id)
                    ]}>
                      <Add />
                    </IconButton>
                  </div>
                </div>
                <p>{item.itemDescription}</p>
              </Card>
            </Grid>
          ))}
      </Grid>
      {/* {shoopingCart.length > 0 &&
        <div style={{ position: "fixed", bottom: "0", width: "100%" }}>
          <Button
            style={{ width: "100%", marginLeft: "-20px", height: "50px" }}
            variant="contained"
            startIcon={<ShoppingCart />}
            //onClick={() => isAuthenticated ? setOpenModalCart(true) : history.push({pathname:'/login', state:{data: data}})}
            onClick={() => history.push(`/shopping-cart`)}
          >
            Carrinho</Button>
        </div>} */}
      {shoopingCart.length <= 0 ?
        <div style={{ position: "fixed", bottom: "0", width: "100%" }}>
          <Button
            style={{ width: "100%", marginLeft: "-20px", height: "50px" }}
            variant="contained"
            startIcon={<FlipToBackOutlined />}
            //onClick={() => isAuthenticated ? setOpenModalCart(true) : history.push({pathname:'/login', state:{data: data}})}
            onClick={() => history.push(history.goBack())}
          >
            Voltar</Button>
        </div>
        :
        <div style={{ position: "fixed", bottom: "0", left: "0", right: "0", padding: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ flexBasis: "50%", padding: "5px" }}>
              <Button
                variant="contained"
                style={{ width: "100%" }}
                onClick={() => [history.push(history.goBack())]}
              >Voltar</Button>
            </div>
            <div style={{ flexBasis: "50%", padding: "5px" }}>
              <Button variant="contained" style={{ width: "100%" }} onClick={() => history.push('/shopping-cart')}>Carrinho</Button>
            </div>
          </div>
        </div>}
      <button onClick={() => console.log(shoopingCart)}>shoopingCart</button>
    </div>
  )
}
