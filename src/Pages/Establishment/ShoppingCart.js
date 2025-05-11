import { Add, CheckCircle, FlipToBackOutlined, HorizontalRule, RemoveShoppingCart } from '@mui/icons-material'
import { Button, Card, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, FormLabel, Grid, IconButton, Paper, Radio, RadioGroup, TextField, Typography } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../contexts/UserContext'
import { useHistory } from 'react-router-dom';
//import { auth } from '../../firebaseConfig';
import { collection, where, getDocs, query, addDoc, getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { formatToCurrencyBR, generateCardToken, proccessPayment } from '../../services/functions';


export default function ShoppingCart() {

  const api_url = process.env.REACT_APP_APIURL;
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
    closingDate: '',
    operator: 'Usuário',
    isOnlinePayment: false
  })

  const [dataAddress, setDataAddress] = useState({
    zipCode: "",
    address: "",
    number: "",
    city: "",
    state: "",
    phoneNumber: "",
    neighborhood: "",
    complement: "",
    name: "",
    obs: "",
    paymentType: "CASH",
    paymentMethod: ''
  })
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
    document: "",
    email: ""
  })
  const [totalOrder, setTotalOrder] = useState(0)




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
    const addressString = localStorage.getItem("user")
    const localDataAddress = JSON.parse(addressString)
    if (localDataAddress) {
      setDataAddress(localDataAddress)
    }
  }, [])

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
        collection(db, 'Establishment', idEstablishment, 'Tickets'),
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
          const docRef = doc(db, 'Establishment', idEstablishment, 'Tickets', clientIdUrl.id)
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
      const orderItemsRef = collection(db, 'Establishment', idEstablishment, 'Orders')
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

  useEffect(() => {
    let total = 0
    shoopingCart?.forEach(item => {
      total = total + (item?.price * item?.qty)
    })
    setTotalOrder(total)
  }, [shoopingCart])


  const saveTicket = async (dataTicket) => {
    let copyDataTicket = { ...dataTicket }
    copyDataTicket.local = `${dataAddress.address}, ${dataAddress.number} - ${dataAddress.neighborhood} - ${dataAddress.city}/${dataAddress.state}`
    copyDataTicket.name = dataAddress.name
    copyDataTicket.phone = dataAddress.phoneNumber
    setDataTicket(copyDataTicket)
    const ticketRef = collection(db, 'Establishment', idEstablishment, 'Tickets')
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
        totalOrder: totalOrder,
        obs: dataAddress?.obs,
        paymentType: dataAddress?.paymentType,
        operator: copyDataTicket?.name,
      }
      const isSaveOrderItems = await saveItemsOrder(dataOrder)
      if (isSaveOrderItems) {
        setConfirmSave(true)
      } else {
        alert('erro ao pedir')
      }
    }
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
            const ticketRef = collection(db, 'Establishment', idEstablishment, 'Tickets')
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
                operator: dataTicket?.name
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
            operator: dataTicket?.name
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
        setIsLoading(true)
        try {
          if (dataAddress.paymentMethod === "ONL" && dataAddress.paymentType === "CRD") {
            const cardToken = await generateCardToken(idEstablishment, cardData)
            console.log('cardToken: ', cardToken)
            if (cardToken) {
              try {
                const payment = await proccessPayment(idEstablishment, totalOrder, cardData.email, 'Wise Menu', cardToken)
                if (payment.status === 'approved') {
                  alert('Pagamento Aprovado!')
                  try {

                    const paymentData = {
                      id: payment?.id,
                      establishmentId: idEstablishment,
                      status: payment?.status,
                      status_detail: payment?.status_detail,
                      transaction_amount: payment?.transaction_amount,
                      description: payment?.description,
                      payment_method_id: payment?.payment_method_id,
                      date_approved: payment?.date_approved,
                      payer_email: payment?.payer?.email || null,
                    }

                    axios.post(`${api_url}/savePayment`, paymentData).then(res => {
                      console.log('ok.', res.data)
                    }).catch((e) => {
                      console.log('erro ao salvar pagamento', e)
                    })

                  } catch (e) {
                    console.log('Erro', e)
                  }
                  saveTicket({...dataTicket, isOnlinePayment: true})
                } else {
                  alert('Nâo foi possível concluir o pagamento.')
                }
              } catch (error) {
                alert('Erro ao processar pagamento.')
                console.log(error)
              }
            }
          } else {
            saveTicket(dataTicket)
          }
        } catch {
          alert('Erro ao solicitar o pedido')
        } finally {
          setIsLoading(false)
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
          operator: dataTicket?.name,
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
    let urlMenu = `/${idEstablishment}/${clientIdUrl.typeId}`
    if (clientIdUrl)
      urlMenu = urlMenu + `/${clientIdUrl.id}`
    history.push(urlMenu)
    setShoppingCart([])
  }

  const getZipCodeInfo = (zipCode) => {
    axios.get(`https://viacep.com.br/ws/${zipCode}/json/ `).then((res) => {
      let updatedData = { ...dataAddress }
      updatedData.address = res.data?.logradouro
      updatedData.city = res.data?.localidade
      updatedData.state = res.data?.uf
      updatedData.neighborhood = res.data?.bairro
      updatedData.zipCode = zipCode
      setDataAddress(updatedData)
      localStorage.setItem('user', JSON.stringify(updatedData))
    }).catch((e) => console.log(e))
  }


  const handleCardNumberChange = (text) => {
    // Remove qualquer caractere que não seja número
    let cleaned = text.replace(/\D/g, "")
    // Limita a 16 dígitos (tamanho máximo de um cartão)
    cleaned = cleaned.slice(0, 16)
    // Adiciona espaços a cada 4 dígitos
    const formatted = cleaned.replace(/(\d{4})/g, "$1 ").trim()
    setCardData((prev) => ({ ...prev, number: formatted }))
  }

  const handleExpiryChange = (text) => {
    // Remove qualquer caractere que não seja número
    let cleaned = text.replace(/\D/g, "")
    // Limita a 4 dígitos (MMYY)
    cleaned = cleaned.slice(0, 4)
    // Adiciona a barra automaticamente após os 2 primeiros dígitos
    if (cleaned.length >= 3) {
      cleaned = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`
    }
    // Atualiza o estado
    setCardData((prev) => ({ ...prev, expiry: cleaned }))
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
              onClick={() => history.push(localStorage.getItem('establishmentUrl'))}
            >
              Voltar</Button>
          </div>
        </>
        :
        isLoading ? <center><CircularProgress /></center> :
          <>
            <Typography variant="h6" align="center">
              Detalhes do pedido
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={6}>

                <Grid container spacing={1} justifyContent="center" alignItems="center" style={{ marginBottom: 30 }}>
                  <Grid item xs={12} md={8} lg={8}>
                    {shoopingCart.map((item, index) => (
                      <Card style={{ padding: "15px", marginTop: 10 }}>
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <p>{item.name}</p>
                            <p>{formatToCurrencyBR(item.price)}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ marginTop: "15px" }}>
                              <IconButton
                                color="primary"
                                aria-label="remove"
                                onClick={() => removeShoppingCart(item.idItem)}
                              >
                                <HorizontalRule />
                              </IconButton>
                              {item.qty}
                              <IconButton
                                color="primary"
                                aria-label="add"
                                onClick={() => addShoppingCart(item.idItem)}
                              >
                                <Add />
                              </IconButton>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                    <br /><p>Total do pedido: <strong>{formatToCurrencyBR(totalOrder)}</strong></p>
                  </Grid>
                </Grid>

              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Grid container spacing={1} justifyContent="center" alignItems="center" style={{ marginBottom: 30 }}>
                  <Grid item xs={12} md={8} lg={8}>
                    <Paper elevation={3} style={{ padding: "20px" }}>
                      <h4>Dados para entrega</h4>

                      <Grid container spacing={1}>

                        <Grid item lg={12} xs={12}>
                          <TextField
                            variant="filled"
                            label="Nome"
                            name="name"
                            fullWidth
                            style={{ marginBottom: "12px" }}
                            value={dataAddress.name}
                            onChange={(e) => {
                              setDataAddress(prevData => ({
                                ...prevData,
                                name: e.target.value
                              }))
                            }}
                          />
                        </Grid>

                        <Grid item lg={3} xs={12}>
                          <TextField
                            variant="filled"
                            label="CEP"
                            name="cep"
                            fullWidth
                            style={{ marginBottom: "12px" }}
                            value={dataAddress.zipCode}
                            onChange={(e) => {
                              setDataAddress(prevData => ({
                                ...prevData,
                                zipCode: e.target.value
                              }))
                              if (e.target.value.length === 8) {
                                getZipCodeInfo(e.target.value)
                              }
                            }}

                          />
                        </Grid>
                        <Grid item lg={9} xs={12}>
                          <TextField
                            variant="filled"
                            label="Rua"
                            name="street"
                            fullWidth
                            required
                            style={{ marginBottom: "12px" }}
                            value={dataAddress.address}
                            onChange={(e) => {
                              setDataAddress(prevData => ({
                                ...prevData,
                                address: e.target.value
                              }))
                            }}
                          />
                        </Grid>
                        <Grid item lg={2} xs={12}>
                          <TextField
                            variant="filled"
                            label="Número"
                            name="number"
                            fullWidth
                            required
                            style={{ marginBottom: "12px" }}
                            value={dataAddress.number}
                            onChange={(e) => {
                              setDataAddress(prevData => ({
                                ...prevData,
                                number: e.target.value
                              }))
                            }}
                          />
                        </Grid>
                        <Grid item lg={4} xs={12}>
                          <TextField
                            variant="filled"
                            label="Complemento"
                            name="complement"
                            fullWidth
                            style={{ marginBottom: "12px" }}
                            value={dataAddress.complement}
                            onChange={(e) => {
                              setDataAddress(prevData => ({
                                ...prevData,
                                complement: e.target.value
                              }))
                            }}
                          />
                        </Grid>
                        <Grid item lg={6} xs={12}>
                          <TextField
                            variant="filled"
                            label="Bairro"
                            name="neighborhood"
                            fullWidth
                            required
                            style={{ marginBottom: "12px" }}
                            value={dataAddress.neighborhood}
                            onChange={(e) => {
                              setDataAddress(prevData => ({
                                ...prevData,
                                neighborhood: e.target.value
                              }))
                            }}
                          />
                        </Grid>
                        <Grid item lg={8} xs={12}>
                          <TextField
                            variant="filled"
                            label="Cidade"
                            name="city"
                            fullWidth
                            required
                            style={{ marginBottom: "12px" }}
                            value={dataAddress.city}
                            onChange={(e) => {
                              setDataAddress(prevData => ({
                                ...prevData,
                                city: e.target.value
                              }))
                            }}
                          />
                        </Grid>
                        <Grid item lg={4} xs={12}>
                          <TextField
                            variant="filled"
                            label="Estado"
                            name="state"
                            fullWidth
                            required
                            style={{ marginBottom: "12px" }}
                            value={dataAddress.state}
                            onChange={(e) => {
                              setDataAddress(prevData => ({
                                ...prevData,
                                state: e.target.value
                              }))
                            }}
                          />
                        </Grid>
                        <Grid item lg={6} xs={12}>
                          <TextField
                            variant="filled"
                            label="Telefone"
                            name="phone"
                            fullWidth
                            required
                            style={{ marginBottom: "12px" }}
                            value={dataAddress.phoneNumber}
                            onChange={(e) => {
                              setDataAddress(prevData => ({
                                ...prevData,
                                phoneNumber: e.target.value
                              }))
                            }}
                          />
                        </Grid>
                      </Grid>


                    </Paper>
                    <Grid container spacing={1}>
                      <Grid item xs={12} lg={6}>
                        <div style={{ marginLeft: 10, marginTop: 20 }}>
                          <FormLabel id="radioPaymentType">Tipo de pagamento:</FormLabel>
                          <RadioGroup
                            aria-labelledby="radioPaymentType"
                            defaultValue="CASH"
                            name="radio-buttons-group"
                            value={dataAddress.paymentMethod}
                          >
                            <FormControlLabel
                              style={{ marginTop: 0 }}
                              value="ONL"
                              control={<Radio />}

                              label="Pagamento online"
                              onChange={(e) => setDataAddress(prevData => ({
                                ...prevData,
                                paymentMethod: e.target.value
                              }))}
                            />
                            <FormControlLabel
                              style={{ marginTop: -10 }}
                              value="ENT"
                              control={<Radio />}
                              label="Pagar na entrega"
                              onChange={(e) => setDataAddress(prevData => ({
                                ...prevData,
                                paymentMethod: e.target.value
                              }))}
                            />
                          </RadioGroup>
                        </div>
                      </Grid>
                      <br />


                      <Grid item xs={12} lg={6}>
                        {dataAddress.paymentMethod !== "" &&
                          <div style={{ marginLeft: 10, marginTop: 20 }}>
                            <FormLabel id="radioPaymentType">Forma de pagamento:</FormLabel>
                            <RadioGroup
                              aria-labelledby="radioPaymentType"
                              defaultValue="CASH"
                              name="radio-buttons-group2"
                              value={dataAddress.paymentType}
                            >
                              {dataAddress.paymentMethod !== 'ONL' &&
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
                              }
                              {dataAddress.paymentMethod !== 'ONL' &&
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
                              }
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
                                value="PIX"
                                control={<Radio />}
                                label="Pix"
                                onChange={(e) => setDataAddress(prevData => ({
                                  ...prevData,
                                  paymentType: e.target.value
                                }))}
                              />
                            </RadioGroup>
                          </div>

                        }
                      </Grid>

                    </Grid>
                  </Grid>

                </Grid>




                {dataAddress.paymentType === 'CRD' && dataAddress.paymentMethod === 'ONL' &&

                  <Grid container spacing={1} justifyContent="center" alignItems="center" style={{ marginBottom: 100 }}>
                    <Grid item xs={12} md={4} lg={8}>
                      <Paper elevation={3} style={{ padding: "20px" }}>
                        <h4>Pagamento com Cartão de Crédito</h4>

                        <TextField
                          variant="filled"
                          label="Número do Cartão"
                          name="cardNumber"
                          fullWidth
                          style={{ marginBottom: "15px" }}
                          value={cardData.number}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                        />
                        <TextField
                          variant="filled"
                          label="Nome do Titular"
                          name="cardHolder"
                          fullWidth
                          style={{ marginBottom: "15px" }}
                          value={cardData.name}
                          onChange={(e) => {
                            setCardData(prevData => ({
                              ...prevData,
                              name: e.target.value.toUpperCase()
                            }))
                          }}
                        />
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <TextField
                              variant="filled"
                              label="Data de Validade (MM/AA)"
                              name="expiryDate"
                              fullWidth
                              style={{ marginBottom: "15px" }}
                              value={cardData.expiry}
                              onChange={(e) => handleExpiryChange(e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              variant="filled"
                              label="CVV"
                              name="cvv"
                              fullWidth
                              style={{ marginBottom: "15px" }}
                              value={cardData.cvv}
                              onChange={(e) => {
                                setCardData(prevData => ({
                                  ...prevData,
                                  cvv: e.target.value
                                }))
                              }}
                            />
                          </Grid>
                        </Grid>
                        <TextField
                          variant="filled"
                          label="CPF"
                          name="cpf"
                          fullWidth
                          style={{ marginBottom: "15px" }}
                          value={cardData.document}
                          onChange={(e) => {
                            setCardData(prevData => ({
                              ...prevData,
                              document: e.target.value
                            }))
                          }}
                        />
                        <TextField
                          variant="filled"
                          type='email'
                          label="E-mail"
                          name="email"
                          fullWidth
                          style={{ marginBottom: "15px" }}
                          value={cardData.email}
                          onChange={(e) => {
                            setCardData(prevData => ({
                              ...prevData,
                              email: e.target.value
                            }))
                          }}
                        />
                      </Paper>
                    </Grid>
                  </Grid>
                }

              </Grid>

            </Grid>


            {isLoading && <center><CircularProgress /></center>}



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
                  <Button
                    variant="contained"
                    disabled={!dataTicket || dataTicket.status !== 1 || dataTicket?.establishment !== idEstablishment}
                    style={{ width: "100%" }}
                    onClick={sendOrder}
                  >Pedir!</Button>
                </Grid>
              </Grid>
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















      <button onClick={() => console.log(totalOrder)}>total</button>
      <button onClick={() => console.log(shoopingCart)}>ShoppingCart</button>
      <button style={{ marginBottom: 100 }} onClick={() => console.log(dataAddress)}>dataAddress</button>
    </div >
  )
}
