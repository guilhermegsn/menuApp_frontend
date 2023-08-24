import { Box, Button, CircularProgress, FormControl, Grid, InputLabel, MenuItem, Modal, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, TextareaAutosize, Typography } from '@mui/material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

export default function MenuRegistry() {

  const headers = [
    {
      key: "itemName",
      header: "Nome"
    },
    {
      key: "itemPrice",
      header: "Preço"
    },
  ]

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%', // Defina uma largura padrão, que será ajustada com base no tamanho da tela
    maxWidth: 600, // Largura máxima
    bgcolor: 'background.paper',
    borderRadius: '15px 50px',
    boxShadow: 29,
    p: 4,
  };



  const [emptyItemMenu] = useState({
    itemName: "",
    itemDescription: "",
    itemPrice: "",
    itemUnitMeasure: "",
    itemMeasure: ""
  })
  const [itemMenu, setItemMenu] = useState(emptyItemMenu)
  const [itemsMenu, setItemsMenu] = useState([])
  const [menuName, setMenuName] = useState("")
  const [openModal, setOpenModal] = useState(false)
  const [openModalName, setOpenModalName] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const add = () => {
    let copyItemMenu = JSON.parse(JSON.stringify(itemMenu));
    copyItemMenu.itemName = copyItemMenu.itemName + ' ' + copyItemMenu.itemMeasure + copyItemMenu.itemUnitMeasure
    setItemsMenu(prevData => [...prevData, copyItemMenu])
  }

  const save = () => {
    const body = {
      menuName: menuName,
      menuItems: itemsMenu
    }
    setIsLoading(true)
    axios.post(' http://127.0.0.1:3001/establishment/64d442c645841a5a831e8ec2/menu', body).then(() => {
      alert('Criado com sucesso!')
    }).catch((e) => {
      console.log(e)
      alert('Ocorreu um erro')
    }).finally(() => setIsLoading(false))
  }

  return (
    <div>
      <Grid >
        <h2>{menuName}</h2>
      </Grid>
      <Grid>
        <Button variant="contained"
          onClick={() => setOpenModal(true)}
        >Adicionar item</Button>
        <Button variant="contained"
          style={{ marginLeft: "10px" }}
          onClick={() => save()}
        > {isLoading &&
          <CircularProgress style={{ marginRight: "10px" }} color="inherit" size={20} />}
          Salvar
        </Button>
      </Grid>
      <br />
      <Grid>
        <TableContainer component={Paper}>
          <br />
          <Table sx={{ minWidth: 500 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                {headers.map((item) => (
                  <TableCell key={item.key}>{item.header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {itemsMenu.map((row) => (
                <TableRow
                  key={row.key}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.itemName}
                  </TableCell>
                  <TableCell>{row.itemPrice}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <br />

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Incluir novo item
          </Typography>
          <br />
          <Grid container spacing={1} style={{ padding: 10 }}>
            <TextField
              variant="standard"
              label="Nome"
              fullWidth
              value={itemMenu.itemName}
              onChange={(e) => {
                setItemMenu((prevState) => ({
                  ...prevState,
                  itemName: e.target.value
                }))
              }}
            />
          </Grid>
          <Grid container spacing={1} style={{ padding: "2px" }}>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="standard"
                label="Medida"
                fullWidth
                value={itemMenu.itemMeasure}
                onChange={(e) => {
                  setItemMenu((prevState) => ({
                    ...prevState,
                    itemMeasure: e.target.value
                  }))
                }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="standard">
                <InputLabel id="demo-simple-select-label">Unidade de medida</InputLabel>
                <Select
                  label="Unidade de medida"
                  variant="standard"
                  value={itemMenu.itemUnitMeasure}
                  onChange={(e) => {
                    setItemMenu((prevState) => ({
                      ...prevState,
                      itemUnitMeasure: e.target.value
                    }))
                  }}
                >
                  <MenuItem key={'g'} value={'G'}>Gramas (G)</MenuItem>
                  <MenuItem key={'kg'} value={'KG'}>Kilo (KG)</MenuItem>
                  <MenuItem key={'ml'} value={'ML'}>Mililitro (ML)</MenuItem>
                  <MenuItem key={'lt'} value={'LT'}>Litro (LT)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Grid container spacing={1} style={{ padding: 10 }}>
            <TextField
              variant="standard"
              label="Preço"
              fullWidth
              value={itemMenu.itemPrice}
              onChange={(e) => {
                setItemMenu((prevState) => ({
                  ...prevState,
                  itemPrice: e.target.value
                }))
              }} />
          </Grid>
          <Grid container spacing={1} style={{ padding: 10 }}>
            <TextField
              variant="standard"
              label="Descrição"
              helperText="(Opcional)"
              fullWidth
              value={itemMenu.itemDescription}
              onChange={(e) => {
                setItemMenu((prevState) => ({
                  ...prevState,
                  itemDescription: e.target.value
                }))
              }}
            />
          </Grid>
          <br />
          <Button onClick={() => setOpenModal(false)}>Fechar</Button>
          <Button onClick={() => console.log(itemMenu)}>itemMenu</Button>
          <Button onClick={() => [add(), setOpenModal(false)]}>add</Button>
        </Box>
      </Modal>


      <Modal
        open={openModalName}
        onClose={() => setOpenModalName(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Qual o nome você quer dar a esta sessão do cardápio?
          </Typography>
          <p>Ex: "Bebidas" ou "Pratos quentes"</p>
          <br />
          <Grid container spacing={1} style={{ padding: 10 }}>
            <TextField
              variant="filled"
              label="Informe o nome da sessão do cardápio"
              fullWidth
              value={menuName}
              onChange={(e) => {
                setMenuName(e.target.value)
              }}
            />
          </Grid>
          <br />
          <Button onClick={() => setOpenModalName(false)}>OK</Button>
        </Box>

      </Modal>
    </div>
  )
}
