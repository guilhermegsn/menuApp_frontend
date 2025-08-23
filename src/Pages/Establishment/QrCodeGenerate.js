import { Box, Button, Container, Paper, Typography } from '@mui/material'
import React from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import './QrCodeGenerate.css'

export default function QrCodeGenerate(props) {

  const { estabId, type, estabName } = props.match.params;

  // useEffect(()=> {
  //   handlePrint()
  // }, [])


  const handlePrint = () => {
    window.print()
  }

  const urlCode = () => {
    let qrCodeUrl = ""
    if (type === '3') {
      qrCodeUrl = `https://www.wisemenu.com.br/${estabId}/3/Delivery`
    }else if(type === '5'){
      qrCodeUrl = `https://www.wisemenu.com.br/${estabId}/5/autoatendimento`
    }
    return qrCodeUrl
  }

  return (
    <div>
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            {estabName}
          </Typography>

          <Box my={3}>
            <QRCodeCanvas value={urlCode()} size={256} />
          </Box>

          <Typography variant="body1" gutterBottom>
            Aponte a câmera para fazer seu pedido.
          </Typography>

          {/* <Typography variant="caption" color="text.secondary">
            <p>{urlCode()}</p>
          </Typography> */}

          <Box className="no-print" mt={4}>
            <Button variant="contained" color="primary" onClick={handlePrint}>
              Imprimir
            </Button>
          </Box>
        </Paper>
      </Container>
    </div>
  )
}
