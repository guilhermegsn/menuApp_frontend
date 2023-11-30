import { Add, FlipToBackOutlined, HorizontalRule, RemoveShoppingCart } from '@mui/icons-material'
import { Button, Card, IconButton, Typography } from '@mui/material'
import React, { useContext } from 'react'
import { UserContext } from '../../contexts/UserContext'
import { useHistory } from 'react-router-dom';
import { auth } from '../../firebaseConfig';
import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig'


export default function ShoppingCart() {
  
  const date = Date.now()
  const { idEstablishment, clientIdUrl } = useContext(UserContext)
  const history = useHistory();
  const { shoopingCart, setShoppingCart } = useContext(UserContext)


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

  const sendOrder = async () => {
    const data = {
      user: auth.currentUser.uid,
      establishment: idEstablishment,
      username: auth.currentUser.email,
      status: 1,
      local: clientIdUrl,
      items: shoopingCart,
      date: date
    };
    const orderCollectionRef = collection(db, "Order");
    const q = query(
      collection(db, 'Order'),
      where('establishment', '==', idEstablishment),
      where('local', '==', clientIdUrl),
      where('status', '==', 1)
    );
    try {
      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        // Já existe uma comanda aberta
        console.log('ja tem comanda aberta')
        console.log(querySnapshot.docs[0].data())
        const comandaAberta = querySnapshot.docs[0].data();
        data.items.forEach((item) => {
          comandaAberta.items.push(item)
        })
        console.log(comandaAberta)
        const comandaRef = doc(db, 'Order', querySnapshot.docs[0].id);
        await updateDoc(comandaRef, { items: comandaAberta.items }).then(() => {
          console.log('Itens adicionado a comanda.')
        }).catch(() => {  
          console.log('Erro ao adicionar itens a comanda.')
        })
      } else {
        await addDoc(orderCollectionRef, data).then((res) => {
          console.log('pedido realizado!')
          console.log(res)
        }).catch(() => console.log('erro ao realizar o pedido'))
      }
    } catch (error) {
      console.error('Erro ao verificar comanda aberta:', error);
      throw error;
    }
  };

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
          <div style={{ position: "fixed", bottom: "0", left: "0", right: "0", padding: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ flexBasis: "50%", padding: "5px" }}>
                <Button variant="contained" style={{ width: "100%" }} onClick={() => history.push(history.goBack())}>Voltar</Button>
              </div>
              <div style={{ flexBasis: "50%", padding: "5px" }}>
                <Button
                  variant="contained"
                  style={{ width: "100%" }}
                  onClick={() => [sendOrder()]}
                >Pedir!</Button>
              </div>
            </div>
          </div>
        </>}

      {/* <button onClick={() => console.log(idEstablishment)}>establishment</button>
      <button onClick={() => console.log(shoopingCart)}>shoopingCart</button> */}
    </div>
  )
}
