import axios from "axios";

const api_url = process.env.REACT_APP_APIURL;

export const formatToCurrencyBR = (number) => {
  try {
    return number.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });
  } catch {
    return ""
  }
}

export const formatToDoubleBR = (number) => {
  try {
    return number.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  } catch {
    return ""
  }
}

export const formatCurrencyInput = (value) => {
  value = value.toString().replace(/\D/g, "")
  value = (parseFloat(value) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return value
}

export const generateUUID = () => {
  let d = new Date().getTime()
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now(); // use high-precision timer if available
  }
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  })
  return uuid
}

export const generateCardToken = async (idEstablishment, cardData) => {
  let publicKey;

  try {
    const response = await axios.post(`${api_url}/getPublicMpKey`, { establishmentId: idEstablishment })
    publicKey = response.data

    if (!publicKey) {
      throw new Error('Chave pública não encontrada.');
    }

  } catch (error) {
    console.error('Erro ao buscar chave pública:', error.message);
    throw new Error('Erro ao buscar chave pública.');
  }

  const body = {
    card_number: cardData.number.replace(/\s/g, ''),
    expiration_month: cardData.expiry.split('/')[0],
    expiration_year: `20${cardData.expiry.split('/')[1]}`,
    security_code: cardData.cvv,
    cardholder: {
      name: cardData.name,
      identification: {
        type: 'CPF',
        number: cardData.document,
      },
    },
  }

  try {
    const response = await axios.post(
      'https://api.mercadopago.com/v1/card_tokens',
      body,
      {
        headers: { 'Content-Type': 'application/json' },
        params: { public_key: publicKey },
      }
    )

    console.log('Token:', response.data.id);
    return response.data;
  } catch (error) {
    console.error('Erro ao gerar token do cartão:', error.response?.data || error.message);
    throw new Error('Erro ao gerar token do cartão.');
  }
}


export const proccessPayment = async (establishmentId, transactionAmount, payerEmail, description, cardToken) => {
  const body = {
    establishmentId,
    transactionAmount,
    payerEmail,
    description,
    cardToken: cardToken.id
  }
  console.log('body', body)
  try {
    const url = 'https://us-central1-appdesc-e1bf2.cloudfunctions.net/executePaymentToEstablishment'
    const response = await axios.post(url, body)
    return response.data
  } catch (error) {
    console.error('Erro ao chamar a função:', error);
    throw error;
  }
}




