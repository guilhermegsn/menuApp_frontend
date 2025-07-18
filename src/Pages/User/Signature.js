import React from 'react'
import './Signature.css'
import { Grid } from '@mui/material'

export default function Signature(props) {
  const { estabId } = props.match.params


  return (
    <div>
      <Grid container spacing={1} justifyContent="center" alignItems="center" style={{ marginBottom: 20 }}>
        <Grid item xs={12} md={4} lg={4}>
          <h2>Assinatura</h2>
          <p className='subtext'>Ative agora sua assinatura e garanta acesso completo aos recursos do aplicativo.</p>
          <br />
          <p className='limitText'>Além do Cardápio digital com pedidos direto na tela, libere recursos como:</p>

          <p className='subtext' style={{ marginTop: 5 }}>* Comandas individuais</p>
          <p className='subtext'>* Comandas coletivas (Mesa)</p>
          <p className='subtext'>* Comandas via NFC (Tag/cartão)</p>
          <p className='subtext'>* Opção de pagamento na entrega/caixa ou Online</p>
          <p className='subtext'>* Pagamentos com taxas reduzidas</p>
        </Grid>
      </Grid>

      <Grid container spacing={1} justifyContent="center" alignItems="center" style={{ marginBottom: 20 }}>
        <Grid item xs={12} md={4} lg={4}>
          <div
            className={'btn'}
            onClick={() => window.location.href = `/${estabId}/assinatura/pagamento`}
          >
            <p className={'btnText'}>Conferir</p>
          </div>
        </Grid>

      </Grid>


    </div>
  )
}
