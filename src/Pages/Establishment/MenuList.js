import React, { useEffect, useState } from 'react'
import { Box, Button, CircularProgress, FormControl, Grid, InputLabel, MenuItem, Modal, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, TextareaAutosize, Typography } from '@mui/material'
import axios from 'axios'
export default function MenuList() {

  const headers = [
    {
      key: "menuName",
      header: ""
    },
  ]

  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    axios.get('http://127.0.0.1:3001/establishment/64d442c645841a5a831e8ec2').then((res) => {
      console.log(res.data.menu)
      setData(res.data)
    }).finally(() => setIsLoading(false))
  }, [])


  return (
    <div>
      {isLoading ? 'Loading...' :
        <Grid>
          <TableContainer component={Paper}>
            <br />
            <Table sx={{ minWidth: 500 }} aria-label="simple table">
              {/* <TableHead>
                <TableRow>
                  {headers.map((item) => (
                    <TableCell key={item.key}>{item.header}</TableCell>
                  ))}
                </TableRow>
              </TableHead> */}
              <TableBody>
                {data && data.menu?.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <strong>{row.menuName}</strong>
                      <hr/>
                      {row.menuItems.map((item) => (
                       
                      <div>
                           <p>{item.itemName}<br/>${item.itemPrice} </p>
                           <p>{item.itemDescription}</p>
                           <hr/>
                           </div>
                        


                      ))}    

                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>}
    </div>
  )
}
