import React, { useEffect, useState } from 'react'
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Grid, Table } from '@mui/material';
import axios from 'axios';


export default function EstablishmentList() {

  const headers = [
    {
      key: "name",
      header: "Nome"
    },
    {
      key: "email",
      header: "E-mail"
    },
    {
      key: "city",
      header: "Cidade"
    },
    {
      key: "state",
      header: "Estado"
    },
  ]
  
  const [data, setData] = useState([])
  
  const getData = () => {
    axios.get('http://127.0.0.1:3001/establishment').then((res)=> {
      setData(res.data)
    }).catch((e) => {
      console.log(e)
    })
  }
  
  useEffect(()=> {
    getData()
  }, [])
  

  return (
    <div>
       <Grid container spacing={2} style={{ marginLeft: 5 }}>
        <h2>Lista de Clientes</h2>
      </Grid>
      <br/>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              {headers.map((item) => (
                <TableCell key={item.key}>{item.header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow
                key={row.key}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell>{row.email}</TableCell> 
                <TableCell>{row.city}</TableCell> 
                <TableCell>{row.state}</TableCell> 
              </TableRow>
            ))}
          </TableBody>
        </Table>

      </TableContainer>
    </div>
  )
}
