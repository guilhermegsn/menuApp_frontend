import { Add, CheckCircle, FlipToBackOutlined, HorizontalRule, RemoveShoppingCart, MopedOutlined, Edit } from '@mui/icons-material'
import { Button, Card, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, FormLabel, Grid, IconButton, Radio, RadioGroup, TextField, Typography } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../contexts/UserContext'
import { useHistory } from 'react-router-dom';
//import { auth } from '../../firebaseConfig';
import { collection, where, getDocs, query, addDoc, getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { formatToCurrencyBR } from '../../services/functions';



export default function ShoppingCart() {

  const { idEstablishment, clientIdUrl } = useContext(UserContext)
  const history = useHistory();
  const { shoopingCart, setShoppingCart } = useContext(UserContext)
  const [confirmSave, setConfirmSave] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [dataTicket, setDataTicket] = useState({
    establishment: idEstablishment,
    local: clientIdUrl?.id,
    name: clientIdUrl?.id,
    openingDate: new Date(),
    status: 1,
    type: parseInt(clientIdUrl?.typeId),
    closingDate: ''
  })
  const [isOpenDialogAdreess, setIsOpenDialodAdreess] = useState(false)
  const [isLoadingDialog, setIsLoadingDialog] = useState(false)
  const [dataAddress, setDataAddress] = useState({
    zipCode: "",
    address: "",
    number: "",
    city: "",
    state: "",
    phoneNumber: "",
    neighborhood: "",
    name: "",
    obs: "",
    paymentType: "CASH"
  })
  const [stageModal, setStageModal] = useState(0) //cep 

  const addShoppingCart = (idItem) => {
    const copyCart = [...shoopingCart]
    copyCart.forEach((item) => {
      if (item.idItem === idItem) {
        item.qty = item.qty + 1;
      }
    });
    setShoppingCart(copyCart)
  }

  useEffect(() => {
    if(isOpenDialogAdreess){
      const addressString = localStorage.getItem("user")
      const localDataAddress = JSON.parse(addressString)
      if(localDataAddress){
        setDataAddress(localDataAddress)
      }
    }
  }, [isOpenDialogAdreess])

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

  const getTicketNumber = async () => {
    console.log('obtendo ticket da mesa...')
    try {
      const q = query(
        collection(db, 'Ticket'),
        where('establishment', '==', idEstablishment),
        where('local', '==', dataTicket?.local),
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

  useEffect(() => {
    const getDataTicket = async () => {
      console.log(clientIdUrl)
      if (clientIdUrl.typeId === '1' || clientIdUrl.typeId === '4') {//Ticket QrCode || NFC
        setIsLoading(true)
        try { //Pesquisa dados do ticket
          const docRef = doc(db, 'Ticket', clientIdUrl.id)
          const docSnapshot = await getDoc(docRef)
          const currDataTicket = docSnapshot.data()
          if (currDataTicket) {
            if (currDataTicket.status !== 1) //comanda fechada
              setDataTicket(null)
            else {
              console.log('curr', currDataTicket)
              setDataTicket(currDataTicket)
            }
          } else {
            setDataTicket(null)
          }
        }
        catch (e) {
          setDataTicket(null)
          console.log('erro..', e)
        } finally {
          setIsLoading(false)
        }
      }
    }
    getDataTicket()
  }, [clientIdUrl, idEstablishment])

  const saveItemsOrder = async (dataOrder) => {
    setIsLoading(true)
    try {
      const orderItemsRef = collection(db, "OrderItems")
      const saveOrder = await addDoc(orderItemsRef, dataOrder)
      if (saveOrder)
        return saveOrder
      return null
    } catch (e) {
      console.log(e)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const sumTotalOrder = () => {
    let total = 0
    shoopingCart?.forEach(item => {
      total = total + (item?.price * item?.qty)
    })
    return total
  }

  const sendOrder = async () => {
    if (dataTicket) {
      console.log('dataTicket', dataTicket)
      if (dataTicket.type === 2) { //Comanda fixa/mesa -> Buscar Id da comanda caso a comanda esteja aberta.
        const ticketNumber = await getTicketNumber()
        if (!ticketNumber) {//comanda fechada
          console.log('sem comanda?')
          setIsLoading(true)
          try { //Abre a comanda
            const ticketRef = collection(db, "Ticket")
            const saveTicket = await addDoc(ticketRef, dataTicket)
            if (saveTicket) {
              const dataOrder = {
                date: new Date(),
                establishment: idEstablishment,
                items: shoopingCart,
                local: dataTicket?.local,
                order_id: saveTicket.id,
                status: 1,
                name: dataTicket?.name,
                type: dataTicket?.type,
                //totalOrder: sumTotalOrder(),
                obs: dataAddress?.obs,
               // paymentType: dataAddress?.paymentType
              }
              const isSaveOrderItems = await saveItemsOrder(dataOrder)
              if (isSaveOrderItems) {
                setConfirmSave(true)
              } else {
                alert('erro ao pedir')
              }
            }
          } catch (e) {
            console.log(e)
          } finally {
            setIsLoading(false)
          }
        } else {
          console.log('com comanda?')
          //Comanda aberta, faço somente o pedido
          const dataOrder = {
            date: new Date(),
            establishment: idEstablishment,
            items: shoopingCart,
            local: dataTicket?.local,
            order_id: ticketNumber,
            status: 1,
            name: dataTicket?.name,
            type: dataTicket?.type,
            //totalOrder: sumTotalOrder(),
            obs: dataAddress?.obs,
          //  paymentType: dataAddress?.paymentType
          }
          const isSaveOrderItems = await saveItemsOrder(dataOrder)
          if (isSaveOrderItems) {
            console.log('mandou')
            setConfirmSave(true)
          } else {
            alert('erro ao pedir')
          }
        }
      } else if (clientIdUrl.typeId === '3') {// Delivery
        console.log('Deliveryy', dataTicket)
        let copyDataTicket = { ...dataTicket }
        copyDataTicket.local = `${dataAddress.address}, ${dataAddress.number} - ${dataAddress.neighborhood} - ${dataAddress.city}/${dataAddress.state}`
        copyDataTicket.name = dataAddress.name
        copyDataTicket.phone = dataAddress.phoneNumber
        setDataTicket(copyDataTicket)
        const ticketRef = collection(db, "Ticket")
        const saveTicket = await addDoc(ticketRef, copyDataTicket)
        if (saveTicket) {
          const dataOrder = {
            date: new Date(),
            establishment: idEstablishment,
            items: shoopingCart,
            local: copyDataTicket?.local,
            order_id: saveTicket.id,
            status: 1,
            name: copyDataTicket?.name,
            type: dataTicket?.type,
            totalOrder: sumTotalOrder(),
            obs: dataAddress?.obs,
            paymentType: dataAddress?.paymentType
          }
          const isSaveOrderItems = await saveItemsOrder(dataOrder)
          if (isSaveOrderItems) {
            setConfirmSave(true)
          } else {
            alert('erro ao pedir')
          }
        }
      } else {//QrCode || NFC
        const dataOrder = {
          date: new Date(),
          establishment: idEstablishment,
          items: shoopingCart,
          local: dataTicket?.local,
          order_id: clientIdUrl.id,
          status: 1,
          name: dataTicket?.name,
          type: dataTicket?.type,
         // totalOrder: sumTotalOrder(),
          obs: dataAddress?.obs,
         // paymentType: dataAddress?.paymentType
        }
        const isSaveOrderItems = await saveItemsOrder(dataOrder)
        if (isSaveOrderItems) {
          setConfirmSave(true)
        } else {
          alert('erro ao pedir')
        }
      }
    } else {
      console.log('sem dataTicket', dataTicket)
    }
  }

  const redirectToMenu = () => {
    let urlMenu = `/menu/${idEstablishment}/${clientIdUrl.typeId}`
    if (clientIdUrl)
      urlMenu = urlMenu + `/${clientIdUrl.id}`
    history.push(urlMenu)
    setShoppingCart([])
  }


  const saveAddress = () => {
    if (stageModal === 0) {
      if (dataAddress.zipCode.length === 8) {
        setIsLoadingDialog(true)
        axios.get(`https://viacep.com.br/ws/${dataAddress.zipCode}/json/ `).then((res) => {
          // setDataAddress(prevData => ({
          //   ...prevData,
          //   address: res.data?.logradouro,
          //   city: res.data?.localidade,
          //   state: res.data?.uf,
          //   neighborhood: res.data?.bairro
          // }))
          let updatedData = {...dataAddress}
          updatedData.address = res.data?.logradouro
          updatedData.city = res.data?.localidade
          updatedData.state = res.data?.uf
          updatedData.neighborhood = res.data?.bairro
          setDataAddress(updatedData)
          localStorage.setItem('user', JSON.stringify(updatedData))

        }).catch((e) => {
          console.log(e)
        }).finally(() => {
          setStageModal(1)
          setIsLoadingDialog(false)
        })
      } else {
        setStageModal(1)
      }
    } else if (stageModal === 1) {
      setStageModal(2)
    } else if (stageModal === 2) {
      setIsOpenDialodAdreess(false)
    }
  }

  return (
    <div>
      {/* {clientIdUrl} */}
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
              onClick={() => history.push(sessionStorage.getItem('establishmentUrl'))}
            >
              Voltar</Button>
          </div>
        </>
        :
        isLoading ? <center><CircularProgress /></center> :
          <>
            <Typography variant="h6" align="center">
              Itens do pedido
            </Typography>
            <div>

              <Grid container spacing={2}>
                {shoopingCart.map((item, index) => (
                  <Grid item xs={18} md={3} sm={4}>
                    {/* <p>{item.itemName} Qtde: {item.qty}</p> */}
                    <Card
                      key={index}
                      style={{padding: "15px" }}>
                      <div style={{ float: "left", width: '50%' }}>
                        <p>{item.name} </p>
                        <p>{formatToCurrencyBR(item.price)}</p>
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
                  </Grid>
                ))}
              </Grid>
            </div>
            <br/>
            <Grid  container spacing={2}>
              <Grid item xs={12} md={3} sm={4}>
                {clientIdUrl.typeId === '3' && dataAddress.address &&//Delivery
                  <Card key={'address'} style={{ padding: 10, marginBottom: 80 }}>
                    {dataAddress.address !== "" &&
                      <div style={{ display: 'flex' }}>
                        <div>
                          <p style={{ marginBottom: -5 }}>Dados da entrega:</p>
                          <p style={{ marginBottom: -10 }}>Sr.(a) <strong>{dataAddress.name}</strong></p>
                          <p style={{ marginBottom: -15 }}>{dataAddress.address}, {dataAddress.number}</p>
                          <p style={{ marginBottom: -15 }}>{dataAddress.neighborhood}</p>
                          <p style={{ marginBottom: -15 }}>{dataAddress.city} - {dataAddress.state}</p>
                          <p style={{ marginBottom: 10 }}>{dataAddress.phoneNumber}</p>
                        </div>
                        <div style={{ marginLeft: 'auto' }}>
                          <IconButton color="primary" aria-label="add"
                            onClick={() => [setIsOpenDialodAdreess(true), setStageModal(0)]}
                          >
                            <Edit />
                          </IconButton>
                        </div>
                      </div>
                    }
                  </Card>
                }
              </Grid>
            </Grid>
            {isLoading && <center><CircularProgress /></center>}
            <div style={{ position: "fixed", bottom: "0", left: "0", right: "0", padding: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ flexBasis: "50%", padding: "5px" }}>
                  <Button variant="contained" style={{ width: "100%" }} onClick={() => history.goBack()}>Voltar</Button>
                </div>
                <div style={{ flexBasis: "50%", padding: "5px" }}>
                  <Button
                    variant="contained"
                    disabled={!dataTicket || dataTicket.status !== 1}
                    style={{ width: "100%" }}
                    onClick={() => clientIdUrl.typeId === '3' && dataAddress.address === "" ?
                      setIsOpenDialodAdreess(true) : sendOrder()}
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

      {/* Dialog Endereço / delivery */}
      <Dialog
        open={isOpenDialogAdreess}
        onClose={() => setIsOpenDialodAdreess(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <center>  <MopedOutlined /></center>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <Grid container spacing={1}>
              {stageModal === 0 &&
                <>
                  <Grid item sm={12} xs={12} >
                    <TextField
                      id='zipCode'
                      autoComplete
                      type='number'
                      variant="standard"
                      label="Insira o seu CEP"
                      fullWidth
                      value={dataAddress.zipCode}
                      onChange={(e) => {
                        setDataAddress(prevData => ({
                          ...prevData,
                          zipCode: e.target.value
                        }))
                      }}
                    />
                  </Grid>
                </>
              }
              {stageModal === 1 &&
                <>
                  <Grid item sm={10} xs={12} >
                    <TextField
                      id='address'
                      variant="standard"
                      label="Endereço"
                      fullWidth
                      value={dataAddress.address}
                      onChange={(e) => {
                        setDataAddress(prevData => ({
                          ...prevData,
                          address: e.target.value
                        }))
                      }}
                    />
                  </Grid>
                  <Grid item sm={2} xs={4} >
                    <TextField
                      variant="standard"
                      id='number'
                      label="Número"
                      type='number'
                      error={dataAddress.address && !dataAddress.number}
                      fullWidth
                      value={dataAddress.number}
                      onChange={(e) => {
                        setDataAddress(prevData => ({
                          ...prevData,
                          number: e.target.value
                        }))
                      }}
                    />
                  </Grid>
                  <Grid item sm={4} xs={8} >
                    <TextField
                      id='neighborhood'
                      variant="standard"
                      label="Bairro"
                      fullWidth
                      value={dataAddress.neighborhood}
                      onChange={(e) => {
                        setDataAddress(prevData => ({
                          ...prevData,
                          neighborhood: e.target.value
                        }))
                      }}
                    />
                  </Grid>
                  <Grid item sm={4} xs={9} >
                    <TextField
                      id='city'
                      variant="standard"
                      label="Cidade"
                      fullWidth
                      value={dataAddress.city}
                      onChange={(e) => {
                        setDataAddress(prevData => ({
                          ...prevData,
                          city: e.target.value
                        }))
                      }}
                    />
                  </Grid>
                  <Grid item sm={2} xs={3} >
                    <TextField
                      id='state'
                      variant="standard"
                      label="UF"
                      fullWidth
                      value={dataAddress.state}
                      onChange={(e) => {
                        setDataAddress(prevData => ({
                          ...prevData,
                          state: e.target.value
                        }))
                      }}
                    />
                  </Grid>
                </>
              }
              {stageModal === 2 &&
                <>
                  <Grid item sm={6} xs={12} >
                    <TextField
                      variant="standard"
                      id='name'
                      label="Nome"
                      fullWidth
                      value={dataAddress.name}
                      onChange={(e) => {
                        setDataAddress(prevData => ({
                          ...prevData,
                          name: e.target.value
                        }))
                      }}
                    />
                  </Grid>
                  <Grid item sm={6} xs={12} >
                    <TextField
                      id='phoneNumber'
                      variant="standard"
                      label="Telefone"
                      type='tel'
                      fullWidth
                      value={dataAddress.phoneNumber}
                      onChange={(e) => {
                        setDataAddress(prevData => ({
                          ...prevData,
                          phoneNumber: e.target.value
                        }))
                      }}
                    />
                  </Grid>

                  <Grid container spacing={2}>
                    <Grid item sm={5} xs={12}>
                      <div style={{ marginLeft: 10 }}>
                        <p>Total do pedido: <strong>{formatToCurrencyBR(sumTotalOrder())}</strong></p>
                      </div>
                      <div style={{ marginLeft: 10 }}>
                        <FormLabel id="radioPaymentType">Forma de pagamento:</FormLabel>
                        <RadioGroup
                          aria-labelledby="radioPaymentType"
                          defaultValue="CASH"
                          name="radio-buttons-group"
                        >
                          <FormControlLabel
                            style={{ marginTop: 0 }}
                            value="CASH"
                            control={<Radio />}
                            label="Dinheiro"
                            onChange={(e) => setDataAddress(prevData => ({
                              ...prevData,
                              paymentType: e.target.value
                            }))}
                          />
                          <FormControlLabel
                            style={{ marginTop: -10 }}
                            value="CRD"
                            control={<Radio />}
                            label="Crédito"
                            onChange={(e) => setDataAddress(prevData => ({
                              ...prevData,
                              paymentType: e.target.value
                            }))}
                          />
                          <FormControlLabel
                            style={{ marginTop: -10 }}
                            value="DBT"
                            control={<Radio />}
                            label="Débito"
                            onChange={(e) => setDataAddress(prevData => ({
                              ...prevData,
                              paymentType: e.target.value
                            }))}
                          />
                        </RadioGroup>
                      </div>

                    </Grid>
                    <Grid item sm={12} xs={12}
                      style={{ margin: 10 }}
                    >
                      <TextField
                        id='obs'
                        variant="standard"
                        label="OBS: (Ex: Troco para 50)"
                        fullWidth
                        value={dataAddress.obs}
                        onChange={(e) => {
                          setDataAddress(prevData => ({
                            ...prevData,
                            obs: e.target.value
                          }))
                        }}
                      />
                    </Grid>
                  </Grid>

                </>
              }
            </Grid>
          </DialogContentText>
        </DialogContent>
        {isLoadingDialog && <center><CircularProgress /></center>}
        <DialogActions>
          <Button
            autoFocus
            onClick={() => {
              stageModal === 1 ? setStageModal(0) :
                stageModal === 0 ? setIsOpenDialodAdreess(false) :
                  setStageModal(1)
            }}
          >
            Voltar
          </Button>
          <Button
            autoFocus
            onClick={saveAddress}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* <button onClick={()=> console.log(sumTotalOrder())}>total</button>
      <button onClick={()=> console.log(shoopingCart)}>ShoppingCart</button> */}
    </div>
  )
}
