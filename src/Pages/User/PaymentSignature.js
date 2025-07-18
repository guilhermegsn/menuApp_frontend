import React, { useState } from 'react'
import { CircularProgress, Grid, Paper, TextField } from '@mui/material'
import './Signature.css'
import { createSubscription, generateCardToken } from '../../services/MercadoPago'

export default function PaymentSignature(props) {

  const { estabId } = props.match.params
  const [isLoading, setIsLoading] = useState(false)
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
    document: "",
    email: ""
  })

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

  const handleCardNumberChange = (text) => {
    // Remove qualquer caractere que não seja número
    let cleaned = text.replace(/\D/g, "")
    // Limita a 16 dígitos (tamanho máximo de um cartão)
    cleaned = cleaned.slice(0, 16)
    // Adiciona espaços a cada 4 dígitos
    const formatted = cleaned.replace(/(\d{4})/g, "$1 ").trim()
    setCardData((prev) => ({ ...prev, number: formatted }))
  }


  const subscribe = async () => {
    const cardToken = await generateCardToken(cardData)
    if (cardToken) {
      setIsLoading(true)
      try {
        // Chama a função para criar a assinatura e obter a URL do Mercado Pago
        const response = await createSubscription(estabId, 'test_user_942569659@testuser.com', 'XCdH9yM9ZqqMmI1mlirx', cardToken)
        console.log('response', response)
        if (response.status === 'active') {
          alert('Sua assinatura foi atualizada!')
        } else {
          alert('Não foi possível processar o seu pagamento.')
        }
      } catch (error) {
        alert(`Não foi possível processar o seu pagamento.`)
        console.error('Erro ao tentar assinar:', error);
      } finally {
        setIsLoading(false)
      }
    }

  }


  return (
    <div>
      <div style={{ textAlign: 'center' }}>
        <img src="/logo512.png" width={140} height={'auto'} alt="Minha Imagem" />
      </div>

      <Grid container spacing={1} justifyContent="center" alignItems="center">
        <Grid item xs={12} md={4} lg={4}>
          <p className='subTitle'>Plano Wise</p>

          <p className='subTitle'>Apenas 99,90/Mês.</p>

          <p className='subtext' style={{ marginTop: 5 }}>* Comandas individuais</p>
          <p className='subtext'>* Comandas coletivas (Mesa)</p>
          <p className='subtext'>* Comandas via NFC (Tag/cartão)</p>
          <p className='subtext'>* Opção de pagamento na entrega/caixa ou Online</p>
          <p className='subtext'>* Pagamentos com taxas reduzidas</p>
        </Grid>
      </Grid>
      <br />
      <Grid container spacing={1} justifyContent="center" alignItems="center" style={{ marginBottom: 20 }}>
        <Grid item xs={12} md={4} lg={4}>
          <p className='subTitle'>Pagamento recorrente</p>
          <p className='limitText'>Não compromete o limite do seu cartão.</p>
          <p className='subTitle'>Cancele quando quiser.</p>
        </Grid>
      </Grid>

      <Grid container spacing={1} justifyContent="center" alignItems="center" style={{ marginBottom: 20 }}>
        <Grid item xs={12} md={4} lg={4}>
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
      <Grid container spacing={1} justifyContent="center" alignItems="center" style={{ marginBottom: 20 }}>
        <Grid item xs={12} md={4} lg={4}>
          <div
            className={'btn'}
            onClick={() => subscribe()}
          >
            <p className={'btnText'}> {isLoading && <CircularProgress color="inherit" size={15} />} Assinar</p>
          </div>
        </Grid>

      </Grid>
    </div>
  )
}
