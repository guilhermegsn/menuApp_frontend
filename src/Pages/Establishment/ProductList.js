import React, { useContext } from 'react'
import { Button, Card, CircularProgress, Grid, IconButton } from '@mui/material'
import { UserContext } from '../../contexts/UserContext'
import { Add, FlipToBackOutlined, HorizontalRule } from '@mui/icons-material'
import { useHistory } from 'react-router-dom/cjs/react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig'
import { useQuery } from '@tanstack/react-query';
import { formatToCurrencyBR } from '../../services/functions';

export default function ProductList(props) {
  const history = useHistory();
  const { menuId } = props.match.params
  const { dataMenu, idEstablishment } = useContext(UserContext)
  const { shoopingCart, setShoppingCart } = useContext(UserContext)


  const fetchMenuItems = async (idEstablishment, menuId) => {
    const docRef = collection(db, "Establishment", idEstablishment, "Menu", menuId, "items");
    const docSnap = await getDocs(docRef);
    return docSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  };

  const { data: dataProducts, isLoading } = useQuery({
    queryKey: ["menuItems", idEstablishment, menuId], // Cache baseado nesses parâmetros
    queryFn: () => fetchMenuItems(idEstablishment, menuId),
    staleTime: 1000 * 60 * 15, // Cache válido por 15 minutos
  });


  const addShoppingCart = (product) => {
    const cart = shoopingCart.find((item) => item.idItem === product.id)
    if (cart) {
      const copyCart = [...shoopingCart]
      copyCart.forEach((item) => {
        if (item.idItem === product.id) {
          item.qty = item.qty + 1;
        }
      });
      setShoppingCart(copyCart)
    } else {
      setShoppingCart((itens) => [...itens, {
        idItem: product.id,
        idMenu: menuId,
        qty: 1,
        name: product.name,
        price: product.price

      }])
    }
  }

  const removeShoppingCart = (product) => {
    const cart = shoopingCart.find((item) => item.idItem === product.id)
    if (cart) {
      if (cart.qty > 1) {
        const copyCart = [...shoopingCart]
        copyCart.forEach((item) => {
          if (item.idItem === product.id) {
            item.qty = item.qty - 1;
          }
        });
        setShoppingCart(copyCart)
      } else {
        const copyCart = [...shoopingCart]
        const filteredItem = copyCart.filter((item) => item.idItem !== product.id);
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
      {isLoading ? <center><CircularProgress /></center>
        :
        <div>
          <h2>{dataMenu?.menuName}</h2>
          <div style={{ marginBottom: 70 }}>
            <Grid container spacing={2} >
              {
                dataProducts && dataProducts?.map((item, index) => (
                  <Grid item xs={16} md={3} sm={4}>
                    <Card variant="outlined"
                      key={index}
                      style={{ padding: "15px" }}>
                      <div style={{ float: "left", width: '50%' }}>
                        <p>{item.name} </p>
                        <p> {formatToCurrencyBR(item.price)}</p>
                      </div>
                      <div style={{ float: "left", width: '50%', textAlign: 'right' }}>
                        <div style={{ marginTop: "15px" }}>
                          <IconButton color="primary" aria-label="add"
                            onClick={() => removeShoppingCart(item)}>
                            <HorizontalRule />
                          </IconButton> {getNumberCart(item.id)}
                          <IconButton color="primary" aria-label="add" onClick={() => [
                            addShoppingCart(item)
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
          </div>
          {shoopingCart.length <= 0 ?
            <div style={{ position: "fixed", bottom: "0", width: "100%" }}>
              <Button
                style={{ width: "100%", marginLeft: "-20px", height: "50px" }}
                variant="contained"
                startIcon={<FlipToBackOutlined />}
                //onClick={() => isAuthenticated ? setOpenModalCart(true) : history.push({pathname:'/login', state:{data: data}})}
                onClick={() => history.goBack()}
              >
                Voltar</Button>
            </div>
            :
            <div style={{ position: "fixed", bottom: "0", left: "0", right: "0", padding: "20px" }}>
              <Grid container spacing={2} justifyContent="flex-end">
                <Grid item xs={6} md={1} sm={4}>
                  <Button
                    variant="contained"
                    style={{ width: "100%" }}
                    onClick={() => history.goBack()}
                  >Voltar</Button>
                </Grid>
                <Grid item xs={6} md={1} sm={4}>
                  <Button variant="contained" style={{ width: "100%" }} onClick={() => history.push('/shopping-cart')}>Carrinho</Button>
                </Grid>
              </Grid>
            </div>
          }
        </div>
      }
      {/* <button onClick={() => console.log(dataProducts)}>dataProducts</button>
      <button onClick={() => console.log(dataMenu)}>dataMenu</button>
      <button onClick={() => console.log(shoopingCart)}>ShoppingCart</button> */}
    </div>
  )
}
