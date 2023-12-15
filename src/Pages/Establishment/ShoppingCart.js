import { Add, CheckCircle, FlipToBackOutlined, HorizontalRule, RemoveShoppingCart } from '@mui/icons-material'
import { Button, Card, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Typography } from '@mui/material'
import React, { useContext, useState } from 'react'
import { UserContext } from '../../contexts/UserContext'
import { useHistory } from 'react-router-dom';
import { auth } from '../../firebaseConfig';
import { collection, where, getDocs, query, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



export default function ShoppingCart() {

  const date = Date.now()
  const { idEstablishment, clientIdUrl } = useContext(UserContext)
  const history = useHistory();
  const { shoopingCart, setShoppingCart } = useContext(UserContext)
  const [confirmSave, setConfirmSave] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const addShoppingCart = (idItem) => {
    const copyCart = [...shoopingCart]
    copyCart.forEach((item) => {
      if (item.idItem === idItem) {
        item.qty = item.qty + 1;
      }
    });
    setShoppingCart(copyCart)
  }

  const removeShoppingCart = (idItem) => {
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

  const isOrderOpen = async () => {
    try {
      const q = query(
        collection(db, 'Order'),
        where('establishment', '==', idEstablishment),
        where('local', '==', clientIdUrl),
        where('status', '==', 1)
      );
      const res = await getDocs(q);
      if (res.docs.length > 0) {
        console.log('encontrei: ', res.docs[0].id);
        return res.docs[0].id;
      }
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  const sendOrder = async () => {
    setIsLoading(true)

    const openOrder = await isOrderOpen();
    const orderItemsRef = collection(db, "OrderItems");

    const orderData = {
      user: auth.currentUser.uid,
      establishment: idEstablishment,
      username: auth.currentUser.email,
      status: 1,
      local: clientIdUrl,
      openingDate: date,
      closingDate: ''
    };

    let orderItemsData = {
      'order_id': openOrder,
      'establishment': idEstablishment,
      'local': clientIdUrl,
      'date': new Date(),
      'items': shoopingCart
    };
    const orderRef = collection(db, "Order");
    const saveOrder = await addDoc(orderRef, orderData)

    try {
     
      if (openOrder) {
        orderItemsData.order_id = openOrder
        await addDoc(orderItemsRef, orderItemsData);
      } else {
        if (saveOrder) {
          orderItemsData.order_id = saveOrder.id
          await addDoc(orderItemsRef, orderItemsData);
        }
      }
      setConfirmSave(true)
    } catch (e) {
      toast.error('Erro ao enviar pedido. Tente novamente,')
    } finally{
      setIsLoading(false)
    }
  };

  const redirectToMenu = () => {
    let urlMenu = `/menu/${idEstablishment}`
    if(clientIdUrl)
      urlMenu = urlMenu + `/${clientIdUrl}`
    history.push(urlMenu)
    setShoppingCart([])
  }

  return (
    <div>
      {clientIdUrl}
      {shoopingCart.length <= 0 ?
        <>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
            <RemoveShoppingCart />
            <p>Nâo há nada no carrinho.</p>
          </div>
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
        </>
        :
        <>
          <Typography variant="h6" align="center">
            Itens do pedido
          </Typography>
          <div>
            {shoopingCart.map((item, index) => (
              <div>
                {/* <p>{item.itemName} Qtde: {item.qty}</p> */}
                <Card
                  key={index}
                  style={{ margin: "7px 0px 10px 0px", padding: "15px" }}>
                  <div style={{ float: "left", width: '50%' }}>
                    <p>{item.name}
                      <br />${item.price} </p>
                  </div>
                  <div style={{ float: "left", width: '50%', textAlign: 'right' }}>
                    <div style={{ marginTop: "15px" }}>
                      <IconButton color="primary" aria-label="add"
                        onClick={() => removeShoppingCart(item.idItem)}
                      >
                        <HorizontalRule />
                      </IconButton> {item.qty}
                      <IconButton color="primary" aria-label="add" onClick={() => [
                        //incrementQty(item.id),
                        addShoppingCart(item.idItem)
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
          {isLoading && <center><CircularProgress /></center>}
          <div style={{ position: "fixed", bottom: "0", left: "0", right: "0", padding: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ flexBasis: "50%", padding: "5px" }}>
                <Button variant="contained" style={{ width: "100%" }} onClick={() => history.push(history.goBack())}>Voltar</Button>
              </div>
              <div style={{ flexBasis: "50%", padding: "5px" }}>
                <Button
                  variant="contained"
                  disabled={isLoading}
                  style={{ width: "100%" }}
                  onClick={() => [sendOrder()]}
                >Pedir!</Button>
              </div>
            </div>
          </div>
        </>}

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      {/* Same as */}

      <Dialog
        open={confirmSave}
        onClose={() => setConfirmSave(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <center>  <CheckCircle /></center>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">

            Pedido enviado com sucesso!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            onClick={() => redirectToMenu()}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  )
}
