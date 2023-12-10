import { Add, FlipToBackOutlined, HorizontalRule, RemoveShoppingCart } from '@mui/icons-material'
import { Button, Card, IconButton, Typography } from '@mui/material'
import React, { useContext } from 'react'
import { UserContext } from '../../contexts/UserContext'
import { useHistory } from 'react-router-dom';
import { auth } from '../../firebaseConfig';
import { writeBatch, collection, where, getDocs, query, addDoc, getDoc } from 'firebase/firestore';
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

  // const sendOrder = async () => {
  //   const data = {
  //     user: auth.currentUser.uid,
  //     establishment: idEstablishment,
  //     username: auth.currentUser.email,
  //     status: 1,
  //     local: clientIdUrl,
  //     //items: shoopingCart,
  //     openingDate: date,
  //     closingDate: ''
  //   };
  //   const orderCollectionRef = collection(db, "Order");
  //   const q = query(
  //     collection(db, 'Order'),
  //     where('establishment', '==', idEstablishment),
  //     where('local', '==', clientIdUrl),
  //     where('status', '==', 1)
  //   );
  //   try {
  //     const querySnapshot = await getDocs(q)
  //     if (!querySnapshot.empty) {
  //       //Já existe uma comanda aberta
  //       console.log('ja tem comanda aberta')

  //       const comandaAberta = querySnapshot.docs[0].data();
  //       console.log('---->',comandaAberta)

  //     }else{
  //       console.log('inserindo..')
  //       const docRef = await addDoc(orderCollectionRef, data)
  //       if(docRef){
  //         console.log('Comanda criada com sucesso.')
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Erro ao verificar comanda aberta:', error);
  //     throw error;
  //   }
  // };

  // const sendOrder = async () => {
  //   const data = {
  //     user: auth.currentUser.uid,
  //     establishment: idEstablishment,
  //     username: auth.currentUser.email,
  //     status: 1,
  //     local: clientIdUrl,
  //     //items: shoopingCart,
  //     openingDate: date,
  //     closingDate: ''
  //   };

  //   const orderRef = collection(db, "Order");
  //   const orderItemRef = collection(db, "OrderItem");

  //   const batch = writeBatch(db);

  //   batch.set(orderItemRef, shoopingCart);

  //   await batch.commit();

  // }


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


  // const sendOrder = async () => {
  //   const orderData = {
  //     user: auth.currentUser.uid,
  //     establishment: idEstablishment,
  //     username: auth.currentUser.email,
  //     status: 1,
  //     local: clientIdUrl,
  //     //items: shoopingCart,
  //     openingDate: date,
  //     closingDate: ''
  //   };
  //   // Verifique se a comanda está aberta
  //   const openOrder = await isOrderOpen();
  //   const orderItemsRef = collection(db, "OrderItems");
  //   // Se a comanda estiver aberta, apenas adicione os itens
  //   console.log('openOrder: ',openOrder)
  //   if (openOrder) {
  //     console.log('já tem comanda aberta..')
  //     const shoppingCartData = {
  //       'order_id': openOrder,
  //       'date': new Date(),
  //       'items': shoopingCart
  //     }
  //     const saveItems = await addDoc(orderItemsRef, shoppingCartData);
  //     if (saveItems) {
  //       console.log('salvou items!')
  //     } else {
  //       console.log('erro ao salvar items')
  //     }
  //   } else {
  //     console.log('criando uma nova comanda...')
  //     const orderRef = collection(db, "Order");
  //     await addDoc(orderRef, orderData).then((res) => {
  //       const shoppingCartData = {
  //         'order_id': res.id,
  //         'date': new Date(),
  //         'items': shoopingCart
  //       }
  //       addDoc(orderItemsRef, shoppingCartData)
  //     }).catch((e) => {
  //       console.log(e)
  //     })
  //   }
  // }

  const sendOrder = async () => {
    const openOrder = await isOrderOpen();
    const orderItemsRef = collection(db, "OrderItems");
    if (openOrder) {
      // Adicione os itens à comanda existente
      const shoppingCartData = {
        'order_id': openOrder,
        'establishment': idEstablishment,
        'local': clientIdUrl,
        'date': new Date(),
        'items': shoopingCart
      };
      await addDoc(orderItemsRef, shoppingCartData);
    } else {
      // Crie uma nova comanda e adicione os itens
      const orderData = {
        user: auth.currentUser.uid,
        establishment: idEstablishment,
        username: auth.currentUser.email,
        status: 1,
        local: clientIdUrl,
        openingDate: date,
        closingDate: ''
      };
      const orderRef = collection(db, "Order");
      const saveOrder = await addDoc(orderRef, orderData);
      if (saveOrder) {
        const orderItemsData = {
          'order_id': saveOrder.id,
          'establishment': idEstablishment,
          'local': clientIdUrl,
          'date': new Date(),
          'items': shoopingCart
        };
        await addDoc(orderItemsRef, orderItemsData);
      }
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
