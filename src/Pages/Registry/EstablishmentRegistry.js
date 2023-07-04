import React, { useState } from 'react'
import {
  Grid, Paper, TextField, Button, CircularProgress,
} from '@mui/material';
import axios from 'axios';
import BrazilianStates from '../../Components/Select/BrazilianStates';

export default function EstablishmentRegistry() {
  const [establishment, setEstablishment] = useState({
    name: "",
    fullname: "",
    email: "",
    state_registration: "",
    address: "",
    neighborhood: "",
    city: "",
    state: "",
    country: "",
    complement: "",
    phone: "",
    cellphone: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const getCep = () => {
    axios.get(`http://viacep.com.br/ws/${establishment.cep}/json/`).then((res) => {
      setEstablishment(prevState => ({
        ...prevState,
        address: res.data.logradouro,
        neighborhood: res.data.bairro,
        city: res.data.localidade,
        state: res.data.uf

      }));
    })
  }

  const save = () => {
    console.log(establishment)
    setIsLoading(true)
    axios.post(' http://127.0.0.1:3001/establishment', establishment).then(()=> {
      alert('Criado com sucesso!')
    }).catch((e)=> {
      console.log(e)
      if(e.response.data.message === "E-mail already exists"){
        return alert('O e-mail informado já está cadastrado.')
      }
      alert('Ocorreu um erro\n'+e.response.data.message)
    }).finally(()=> setIsLoading(false))
  }

  return (
    <div>
      
      <Grid container spacing={2} style={{ marginLeft: 5 }}>
        <h2>Cadastro de Clientes</h2>
      </Grid>
      <Grid item xs={12} >
        <Paper style={{ padding: 5 }} elevation={3}>
          <Grid container spacing={2} style={{ padding: 5 }}>
            <Grid item xs={12} sm={8}>
              <TextField
                variant="filled"
                label="Nome do estabelecimento"
                fullWidth
                required
                InputLabelProps={{ shrink: true }} 
                value={establishment.name}
                onChange={(e) => {
                  setEstablishment((prevState) => ({
                    ...prevState,
                    name: e.target.value
                  }))
                  
                }}
                />
            </Grid>
          </Grid>
          <Grid container spacing={2} style={{ padding: 5 }}>
            <Grid item xs={12} sm={8}>
              <TextField
                variant="filled"
                label="Razão social"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={establishment.fullname}
                onChange={(e) => {
                  setEstablishment((prevState) => ({
                    ...prevState,
                    fullname: e.target.value
                  }))
                  
                }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} style={{ padding: 5 }}>

            <Grid item xs={12} sm={2}>
              <TextField
                variant="filled"
                label="CNPJ"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={establishment.state_registration}
                onChange={(e) => {
                  setEstablishment((prevState) => ({
                    ...prevState,
                    state_registration: e.target.value
                  }))
                  
                }}
                
                />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                variant="filled"
                label="E-mail"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={establishment.email}
                onChange={(e) => {
                  setEstablishment((prevState) => ({
                    ...prevState,
                    email: e.target.value
                  }))
                  
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                variant="filled"
                label="Telefone comercial"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={establishment.phone}
                onChange={(e) => {
                  setEstablishment((prevState) => ({
                    ...prevState,
                    phone: e.target.value
                  }))
                  
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                variant="filled"
                label="Telefone celular"
                fullWidth
                required
                InputLabelProps={{ shrink: true }} 
                value={establishment.cellphone}
                onChange={(e) => {
                  setEstablishment((prevState) => ({
                    ...prevState,
                    cellphone: e.target.value
                  }))
                  
                }}
                
                />
            </Grid>
          </Grid>
          <Grid container spacing={2} style={{ padding: 5 }}>
            <Grid item xs={12} sm={2}>
              <TextField
                variant="filled"
                label="CEP"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={establishment.cep}
                onChange={(event) => {
                  setEstablishment((prevState) => ({
                    ...prevState,
                    cep: event.target.value
                  }))
                }}
                onBlur={() => getCep()}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                variant="filled"
                label={"Rua"}
                fullWidth
                required
                placeholder="Digite a rua"
                InputLabelProps={{ shrink: true }}
                value={establishment.address}
                onChange={(event) => {
                  setEstablishment((prevState) => ({
                    ...prevState,
                    address: event.target.value
                  }))
                }}
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <TextField
                variant="filled"
                label="Número"
                fullWidth
                required
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                variant="filled"
                label="Bairro"
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
                value={establishment.neighborhood}
                onChange={(e) => {
                  setEstablishment((prevState) => ({
                    ...prevState,
                    neighborhood: e.target.value
                  }))
                  
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                variant="filled"
                label="Cidade"
                fullWidth
                required
                value={establishment.city}
                InputLabelProps={{ shrink: true }}
                onChange={(event) => {
                  setEstablishment((prevState) => ({
                    ...prevState,
                    city: event.target.value
                  }))
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              {/* <TextField
                variant="filled"
                InputLabelProps={{ shrink: true }}
                label="Estado"
                fullWidth
                required
                value={establishment.state}
              /> */}
              <BrazilianStates
                value={establishment.state}
                onChange={(e) => {
                  setEstablishment((prevState) => ({
                    ...prevState,
                    state: e.target.value
                  }))
                  
                }}
              />
            </Grid>
            <br />

          </Grid>
        
        </Paper>
        <br />
        <Button variant="contained" onClick={()=> save()}>
       
      {isLoading ?   <CircularProgress color="inherit" size={15}/> : null}
       
          Salvar
        </Button>

      </Grid>
    </div>
  )
}
