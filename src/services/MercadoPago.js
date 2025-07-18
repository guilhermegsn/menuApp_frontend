import axios from "axios";
import config from "../configs";

export const generateCardToken = async (cardData) => {
  const PUBLIC_KEY = process.env.REACT_APP_PUBLIC_KEY_MERCADO_PAGO
  console.log('pulickey-->', PUBLIC_KEY)
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
      'https://api.mercadopago.com/v1/card_tokens', body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          public_key: PUBLIC_KEY,
        }
      }
    );
    console.log('token: ', response.data.id)
    return response.data.id; // Retorna o token do cartão
  } catch (error) {
    console.error('Erro ao gerar token:', error.response.data);
    throw error;
  }
};

export const createSubscription = async (establishmentId, email, planId, cardToken) => {
  const API_URL = `${config.api_url}/createSubscription`

  try {
    const response = await axios.post(API_URL, {
      establishmentId,
      email,
      planId,
      cardToken
    }
    )
    // O URL de pagamento que o usuário irá acessar
    return response.data//response.data.subscriptionUrl;
  } catch (error) {
    console.error("Erro ao criar assinatura:", error);
    throw error;
  }

}

export const createUnsubscribe = async (establishmentId) => {
  const API_URL = `${config.api_url}/unsubscribe`

  try {
    const response = await axios.post(API_URL, { establishmentId })
    // O URL de pagamento que o usuário irá acessar
    return response.data//response.data.subscriptionUrl;
  } catch (error) {
    console.error("Erro ao cancelar assinatura:", error);
    throw error;
  }

};