import React from 'react';
import {
  Grid, Paper, TextField, FormControl, InputLabel, Select, MenuItem, Button
} from '@mui/material';


function ContactForm() {

  return (
    <div>
      <Grid container spacing={2} style={{ marginLeft: 30 }}>
        <h2>Cadastro de usuários</h2>
      </Grid>
      <Grid container spacing={2} style={{ padding: 15 }}>
        <Grid item xs={12}>
          <Paper style={{ padding: 16 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Nome" fullWidth required />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField label="RG" fullWidth required type='number' />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField label="CPF" fullWidth required type='number' />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Sobrenome" fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">Age</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="Age"
                  >
                    <MenuItem value={10}>Ten</MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={30}>Thirty</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField type="date" label="Data de Nascimento" fullWidth required InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Endereço" fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Cidade" fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Estado" fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="País" fullWidth required />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField label="CEP" fullWidth required />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" color="primary">Enviar</Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      <br /><br />
      <Grid container spacing={2} style={{ padding: 10 }}>
        <Grid item xs={12} sm={2}>
          <TextField label="Teste 1" fullWidth required />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField label="Teste 2" fullWidth required />
        </Grid>
      </Grid>
      <Grid container spacing={2} style={{ padding: 10 }}>
        <Grid item xs={12} sm={2}>
          <TextField label="Teste 3" fullWidth required />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField label="Teste 4"   id="filled-multiline-flexible"   variant="filled" fullWidth required />
        </Grid>
      </Grid>
     
    </div>

  )
}

export default ContactForm;
