import React, { useContext, useEffect, useState } from 'react'
import { Button, Card, CardActionArea, CardContent, CardMedia, Grid, IconButton, Modal, Typography } from '@mui/material'
import { Add, HorizontalRule, ShoppingCart } from '@mui/icons-material'
import { db } from '../../firebaseConfig'
import { getDoc, doc } from 'firebase/firestore'
import { UserContext } from '../../contexts/UserContext'
import { useHistory } from 'react-router-dom';
export default function MenuList(props) {

  // const headers = [
  //   {
  //     key: "menuName",
  //     header: ""
  //   },
  // ]
  const history = useHistory();
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  //const [shoopingCart, setShoppingCart] = useState([])
  const [openModalCart, setOpenModalCart] = useState(false)
  //const estabCollection = collection(db, "Establishment")

  const { shoopingCart, setShoppingCart } = useContext(UserContext)

  const { estabId, clientId } = props.match.params;

  useEffect(() => {
    setIsLoading(true)
    const getData = async () => {
      try {
        const docRef = doc(db, "Establishment", estabId);
        const docSnap = await getDoc(docRef)
        setData(docSnap.data())
        console.log(docSnap.data())
      } catch (error) {
        console.log(error)
      } finally { setIsLoading(false) }
    }
    console.log('clientId: '+clientId)
    getData()
    //obtenho o id pela params da url e coloco no context
   
  }, [estabId, clientId])


  const addShoppingCart = (idMenu, idItem) => {
    console.log('id item: ' + idItem)
    console.log('id menu: ' + idMenu)
    const menu = data.menu.find((menu) => menu.id === idMenu)
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

  const sendWhatsAppMsg = () => {
    //console.log(shoopingCart)
    const msg = `Tem pedido novo!\nMesa: 10\nUsuário: Guilhemrme Nunes\n\nPedido:\n\n${shoopingCart.map((item) => (`${item?.qty} ${item?.itemName}\n`))}
`
    console.log(msg.replaceAll(",", ""))

    const phoneNumber = '18981257015'; // Número de telefone do destinatário
    const encodedMessage = encodeURIComponent(msg);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  };



  return (
    <div>
      {/* <button onClick={()=> console.log(data)}>data</button>
      <button onClick={()=> getItems()}>items</button> */}


      {isLoading ? 'Loading...' :
        <Grid style={{ marginBottom: "50px" }}>
          {data && data.menu?.map((row, index) => (
            <div key={index}>
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



              {row.items.map((item, index) => {
                return (
                  <Card variant="outlined"
                    key={index}
                    style={{ margin: "7px 0px 10px 0px", padding: "15px" }}>
                    <div style={{ float: "left", width: '50%' }}>
                      <p>{item.name}
                        <br />${item.price} </p>
                    </div>
                    <div style={{ float: "left", width: '50%', textAlign: 'right' }}>
                      <div style={{ marginTop: "15px" }}>
                        <IconButton color="primary" aria-label="add"
                          onClick={() => removeShoppingCart(item.id)}>
                          <HorizontalRule />
                        </IconButton> {getNumberCart(item.id)}
                        <IconButton color="primary" aria-label="add" onClick={() => [
                          //incrementQty(item.id),
                          addShoppingCart(row.id, item.id)
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
            //onClick={() => isAuthenticated ? setOpenModalCart(true) : history.push({pathname:'/login', state:{data: data}})}
            onClick={() => history.push(`/shopping-cart/${estabId}/${clientId}`)}
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
            {shoopingCart.map((item, index) => (
              <div>
                {/* <p>{item.itemName} Qtde: {item.qty}</p> */}

                <Card
                  key={index}
                  style={{ margin: "7px 0px 10px 0px", padding: "15px" }}>
                  <div style={{ float: "left", width: '50%' }}>
                    <p>{item.itemName}
                      <br />${item.itemPrice} </p>
                  </div>
                  <div style={{ float: "left", width: '50%', textAlign: 'right' }}>
                    <div style={{ marginTop: "15px" }}>
                      <IconButton color="primary" aria-label="add"
                        onClick={() => removeShoppingCart(item?.idItem)}
                      >
                        <HorizontalRule />
                      </IconButton> {item.qty}
                      <IconButton color="primary" aria-label="add" onClick={() => [
                        //incrementQty(item.id),
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
                  onClick={() => [console.log(shoopingCart), sendWhatsAppMsg()]}
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
