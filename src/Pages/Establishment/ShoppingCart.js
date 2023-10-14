import { Add, HorizontalRule } from '@mui/icons-material'
import { Button, Card, IconButton, Typography } from '@mui/material'
import React, { useContext } from 'react'
import { UserContext } from '../../contexts/UserContext'
import { useHistory } from 'react-router-dom';
import { auth } from '../../firebaseConfig';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebaseConfig'


export default function ShoppingCart() {

  const establishment = "C1sOox4WzFxuDJ1fkxK5"

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

  // const getNumberCart = (idItem) => {
  //   if (shoopingCart.find((item) => item.idItem === idItem)?.qty !== undefined)
  //     return shoopingCart.find((item) => item.idItem === idItem)?.qty
  //   return 0
  // }

//   const sendWhatsAppMsg = () => {
//     //console.log(shoopingCart)
//     const msg = `Tem pedido novo!\nMesa: 10\nUsuário: Guilhemrme Nunes\n\nPedido:\n\n${shoopingCart.map((item) => (`${item?.qty} ${item?.itemName}\n`))}
// `
//     console.log(msg.replaceAll(",", ""))

//     const phoneNumber = '18981257015'; // Número de telefone do destinatário
//     const encodedMessage = encodeURIComponent(msg);
//     const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;

//     window.open(whatsappUrl, '_blank');
//   };

  const sendOrder = async () => {
    const orderCollection = collection(db, "Order");
    const data = {
      user: auth.currentUser.uid,
      establishment: establishment,
      username: auth.currentUser.email,
      status: 1,
      local: "Mesa 4",
      items: shoopingCart,
    };
    try {

      const storedOrder = JSON.parse(localStorage.getItem("odr"));
      console.log(storedOrder)

      if(storedOrder)
      {
        console.log('existo')
      }else{
        console.log('nao existo')
      }

      // const addItem = await addDoc(orderCollection, data);
      // if(addItem){
      //   const odr = {
      //     dt: new Date(),
      //     key: addItem.id
      //   }
      //   localStorage.setItem("odr", JSON.stringify(odr));
      // }else{
      //   console.log('nao')
      // }
      
    } catch (error) {
      console.error(error);
    }
  };

 



  return (
    <div>
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
                <p>{item.itemName}
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
            <Button
              variant="contained"
              style={{ width: "100%" }}
              onClick={() => [sendOrder()]}
            >Confirmar</Button>
          </div>
          <div style={{ flexBasis: "50%", padding: "5px" }}>
                <Button variant="contained" style={{ width: "100%" }} onClick={() => history.push('/establishment/menu/list')}>Voltar</Button>
              </div>
        </div>
      </div>
    </div>
  )
}
