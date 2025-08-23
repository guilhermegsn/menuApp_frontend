import React, { useCallback, useEffect, useState } from 'react'
import config from '../../configs';
import axios from 'axios';
import { Box, Container, Divider, Paper, Typography } from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';

export default function OrderStatus(props) {

  const { estabId, orderId } = props.match.params;
  const [orderData, setOrderData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const getStatus = useCallback(() => {
    const params = {
      idEstablishment: estabId,
      orderId: orderId
    }
    axios.post(`${config.api_url}/getOrderStatus`, params).then((res) => {
      setOrderData(res.data)
    }).catch((e) => {
      setOrderData(null)
      console.log('erro', e)
    }).finally(() => setIsLoading(false))
  }, [orderId, estabId])

  const returnStatusName = (statusCode) => {
    switch (statusCode) {
      case 1: return 'Em aberto';
      case 2: return 'Em preparo';
      case 3: return 'Cancelado';
      case 0: return 'Finalizado';
      default: return 'Status desconhecido';
    }
  }

  useEffect(() => {
    getStatus()
    // const intervalId = setInterval(() => {
    //   getStatus();
    // }, 60 * 1000);

    // // Limpar o intervalo quando o componente for desmontado ou quando as dependências mudarem
    // return () => clearInterval(intervalId);
  }, [estabId, orderId, getStatus]);  // Dependências do efeito


  return (
    <div>
      {isLoading ? 'Carregando...' : orderData ?
        <Container maxWidth="sm" sx={{ my: 4 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h5" component="h1" gutterBottom fontWeight={700}>
              Pedido confirmado! 🎉
            </Typography>

            <Typography variant="body1" sx={{ mb: 2 }}>
              Obrigado pela sua compra. Abaixo está o QR Code referente ao seu pedido.
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
              <QRCodeCanvas value={orderId} size={126} />
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              ID do pedido: {orderData?.orderNumber.toString().padStart(4, '0')}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ textAlign: "left", mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Apresente este QR Code</strong> no local de retirada para receber seu pedido.
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Validade:</strong> Este código é válido apenas para este pedido.
              </Typography>
            </Box>

            <Typography variant="body3" display="block" color="text.secondary" sx={{ mt: 2 }}>
              Status do pedido: {returnStatusName(orderData?.status)}
            </Typography>
          </Paper>
        </Container>
        :

        <Container maxWidth="sm" sx={{ mt: 6 }}>
          <h2>404 - Pedido inválido</h2>
        </Container>

      }
    </div>
  )
}
