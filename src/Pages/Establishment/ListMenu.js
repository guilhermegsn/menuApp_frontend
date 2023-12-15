import React, { useContext, useEffect, useState } from 'react'
import { Card, CardActionArea, CardContent, CardMedia, Grid, Typography } from '@mui/material'
import { db } from '../../firebaseConfig'
import { getDoc, doc } from 'firebase/firestore'
import { useHistory } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';

export default function ListMenu(props) {

  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false)
  const { estabId } = props.match.params;
  const { dataMenu, setDataMenu, setClientIdUrl, setIdEstablishment, idEstablishment } = useContext(UserContext)
  const { clientId } = props.match.params

  useEffect(() => {
    setIsLoading(true)
    const getData = async () => {
      try {
        const docRef = doc(db, "Establishment", estabId);
        const docSnap = await getDoc(docRef)
        setDataMenu(docSnap.data())
      } catch (error) {
        console.log(error)
      } finally { setIsLoading(false) }
    }
    getData()
  }, [estabId, setDataMenu])

  useEffect(() => {
    setIdEstablishment(estabId)
    //verifico se há um clientId na url. (ex: Mesa 1) Caso haja, armazeno no context.
    if (clientId) {
      setClientIdUrl(clientId)
    }
  }, [clientId, setClientIdUrl, estabId, setIdEstablishment])

  const getProducts = (id) => {
    const currentPath = history.location.pathname;
    history.push(`${currentPath}/products/${id}`);
  }

  return (
    <div>
      <Grid container spacing={2} >
        {
          isLoading ? 'Loading...' :
            dataMenu && dataMenu.menu?.map((item) => (
              <Grid item xs={6} md={3} sm={4}>
                <Card onClick={() => getProducts(item.id)}>
                  <CardActionArea>
                    <CardMedia
                      component="img"
                      height="140"
                      //image="/img/cerveja.jpg"
                      image={item.urlImg}
                      alt={item.name}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h8" component="div">
                        {item.name}
                      </Typography>
                      {/* <Typography variant="body2" color="text.secondary">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                  </Typography> */}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
      </Grid>
      {/* <button onClick={() => console.log(dataMenu)}>dataMenu</button>
      <button onClick={() => console.log(idEstablishment)}>estabId</button> */}
    </div>
  )
}
