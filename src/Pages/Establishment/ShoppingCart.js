import { Add, CheckCircle, FlipToBackOutlined, HorizontalRule, RemoveShoppingCart } from '@mui/icons-material'
import { Button, Card, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, FormLabel, Grid, IconButton, Paper, Radio, RadioGroup, TextField, Typography } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../contexts/UserContext'
import { useHistory } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { formatToCurrencyBR, generateCardToken, proccessPayment } from '../../services/functions';
import configs from '../../configs';

export default function ShoppingCart() {

  const api_url = process.env.REACT_APP_APIURL
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
    paymentType: "",
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
      setDataAddress({ ...localDataAddress, paymentType: '' })
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


  useEffect(() => {
    const getDataTicket = async () => {
      console.log(clientIdUrl)
      if (clientIdUrl.typeId === '1' || clientIdUrl.typeId === '4') {//Ticket QrCode || NFC
        setIsLoading(true)
        try { //Pesquisa dados do ticket
          const res = await axios.post(`${configs.api_url}/getTicketData`, {idEstablishment: idEstablishment, ticketId: clientIdUrl.id})
          if(res.data){
            console.log('aq. vai tomar um mojito')
            const currDataTicket = res.data?.ticket
            if (currDataTicket) {
              if (currDataTicket.status !== 1) //comanda fechada
                setDataTicket(null)
              else {
                console.log('curr', currDataTicket)
                setDataTicket({...dataTicket, ...currDataTicket})
              }
            } else {
              setDataTicket(null)
            }
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


  useEffect(() => {
    let total = 0
    shoopingCart?.forEach(item => {
      total = total + (item?.price * item?.qty)
    })
    setTotalOrder(total)
  }, [shoopingCart])


  const sendOrder = async () => {
    setIsLoading(true)
    try {
      const isOnlineCreditPayment =
        dataTicket?.type === 3 &&
        dataAddress.paymentMethod === "ONL" &&
        dataAddress.paymentType === "CRD"
  
      if (isOnlineCreditPayment) {
        const cardToken = await generateCardToken(idEstablishment, cardData)
        if (!cardToken) {
          alert('Erro ao processar os dados do cartão. Por favor, tente novamente.')
          return
        }
  
        try {
          const payment = await proccessPayment(
            idEstablishment,
            totalOrder,
            cardData.email,
            'Wise Menu',
            cardToken
          )
  
          if (payment.status !== 'approved') {
            alert('Não foi possível concluir o pagamento. Verifique os dados e tente novamente.')
            return
          }
  
          // Salvar dados do pagamento
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
          
          try {
            await axios.post(`${api_url}/savePayment`, paymentData)
            console.log('Pagamento salvo com sucesso.')
            dataTicket.paymentId = payment?.id
            dataTicket.isOnlinePayment = true
          } catch (err) {
            console.log('Erro ao salvar pagamento:', err)
          }
  
        } catch (error) {
          alert('Erro ao processar o pagamento. Por favor, tente novamente.')
          console.log(error)
          return
        }
      }
  
      // Envia o pedido
      const data = {
        idEstablishment,
        dataTicket,
        shoopingCart,
        dataAddress,
        clientIdUrl,
        totalOrder
      }
  
      try {
        const res = await axios.post(`${api_url}/sendOrderSecure`, data)
        if (res.data) {
          alert('Pedido enviado.')
          console.log(res.data)
        }
      } catch (e) {
        console.log('Erro ao enviar pedido:', e)
      }
  
    } catch (e) {
      console.log('Erro geral no envio do pedido:', e)
    } finally {
      setIsLoading(false)
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

  const isInvalidFormSend = () => {
    if (dataTicket?.type === 3 && (dataTicket.status !== 1 || dataTicket?.establishment !== idEstablishment || !dataAddress?.paymentMethod ||
      !dataAddress.paymentType)
    )
      return true

    if (dataTicket?.type === 3 && (dataAddress.paymentMethod === 'ONL' && dataAddress.paymentType === 'CRD') &&
      (!cardData.number || !cardData?.name || !cardData.expiry || !cardData.email || !cardData.document || !cardData.cvv))
      return true

    if (dataTicket.type === 3 && (!dataAddress.address || !dataAddress.number || !dataAddress.neighborhood
      || !dataAddress.city || !dataAddress.phoneNumber))
      return true
    return false
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
                    <br />
                    {dataTicket?.type !== 2 &&
                      <p>Total do pedido: <strong>{formatToCurrencyBR(totalOrder)}</strong></p>
                    }
                  </Grid>
                </Grid>

              </Grid>

              {dataTicket?.type === 3 &&
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
                            name="emailAddress"
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

                </Grid>}

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
                    disabled={isInvalidFormSend()}
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
          //onClick={() => setConfirmSave(false)}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
      {/* <button onClick={() => console.log(dataTicket)}>dataTickett</button>
      <button onClick={() => console.log(shoopingCart)}>ShoppingCart</button>
      <button style={{ marginBottom: 100 }} onClick={() => console.log(dataAddress)}>dataAddress</button>
      <button onClick={() => console.log(cardData)}>cardDataaa</button>
      <button onClick={() => console.log(clientIdUrl)}>clientIdUrl</button> */}
    </div >
  )
}
