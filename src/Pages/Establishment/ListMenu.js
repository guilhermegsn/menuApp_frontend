import React, { useContext, useEffect, useRef, useState } from 'react'
import { Card, CardActionArea, CardContent, CardMedia, Grid, Typography } from '@mui/material'
import { db } from '../../firebaseConfig'
import { getDocs, collection } from 'firebase/firestore'
import { useHistory, useLocation } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';

export default function ListMenu(props) {

  const location = useLocation();
  const hasSavedUrl = useRef(false)
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false)
  const { dataMenu, setDataMenu, setClientIdUrl, setIdEstablishment, setEstablishmentData } = useContext(UserContext)
  //let { clientId, estabId, typeId } = props.match.params //id cliente, id estabelecimento, tipo de comanda
  const { estabId } = props.match.params;

  //Definindo tipo Delivery como padrao caso acessar url somente com o nome (wisemenu.com.br/estabelecimento)
  const clientId = 'Delivery';
  const typeId = 3;

  useEffect(() => {
    // Verifique se a URL já contém clientId e typeId, senão redirecione
    if (!location.pathname.includes(clientId) || !location.pathname.includes(typeId)) {
      const newPathname = `/${estabId}/${typeId}/${clientId}`;
      // Redireciona para a nova URL com clientId e typeId
      history.replace(newPathname);
    }
  }, [estabId, clientId, typeId, history, location.pathname]);


  useEffect(() => {
    const getData = async () => {
      if (dataMenu?.length <= 0) {

        setIsLoading(true)
        try {
          const docRef = collection(db, "Establishment", estabId, "Menu");
          const docSnap = await getDocs(docRef)
          const menus = docSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));

          setDataMenu(menus)
          console.log('menus', menus)
          //setEstablishmentData(docSnap.data())
        } catch (error) {
          console.log(error)
        } finally { setIsLoading(false) }
      }
    }

    getData()
  }, [estabId, setDataMenu, setEstablishmentData, dataMenu?.length])

  useEffect(() => {
    setIdEstablishment(estabId)
    //verifico se há um clientId na url. (ex: Mesa 1) Caso haja, armazeno no context.
    if (clientId && typeId) {
      setClientIdUrl({
        id: clientId,
        typeId: typeId,
      })
    }
  }, [clientId, setClientIdUrl, estabId, setIdEstablishment, typeId])

  const getProducts = (id) => {
    const currentPath = history.location.pathname;
    history.push(`${currentPath}/products/${id}`);
  }

  //salvo a primeira url que o usuário acessou (Vindo do qrcode)
  useEffect(() => {
    const saveUrlSession = () => {
      if (!hasSavedUrl.current) {
        sessionStorage.setItem('establishmentUrl', location.pathname)
        hasSavedUrl.current = true
      }
    }
    saveUrlSession()
  }, [location.pathname])

  return (
    <div>
      <Grid container spacing={2} >
        {
          isLoading ? 'Loading...' :
            dataMenu && dataMenu.map((item) => (
              <Grid item xs={6} md={1} sm={4}>
                <Card onClick={() => getProducts(item.id)}>
                  <CardActionArea>
                    <CardMedia
                      component="img"
                      height="140"
                      image={item.imageUrl}
                      alt={item.name}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h8" component="div">
                        {item.menuName}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
      </Grid>
    </div>
  )
}
