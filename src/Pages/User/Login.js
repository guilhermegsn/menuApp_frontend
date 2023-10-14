import React, { useContext, useEffect, useState } from 'react'
import './Login.css'
import { Button, TextField } from '@mui/material'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { auth } from '../../firebaseConfig'
import { UserContext } from '../../contexts/UserContext'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'


export default function Login() {

  const history = useHistory();
  const { dataUser, login, signInWithGoogle, isAuthenticated } = useContext(UserContext)

  const [user, setUser] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  })

  useEffect(() => {
    if(isAuthenticated){
      history.push('/establishment/menu/list')
    }
  }, [history, isAuthenticated])

  const [isRegister, setIsRegister] = useState(true)

  const register = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.password
      )
      await sendEmailVerification(userCredential.user);
      alert("Criado!")
    } catch (error) {
      alert("erro")
      console.log(error)
    }
  }

  return (
    <div>
      <div id="recaptcha-container"></div>
      <div className="login-container" >
        <br />
        <div className="login-box">
          <h2>Entrar</h2>
          <p className='subtext'> Para fazer um pedido, é necessário estar registrado.</p>
          <br />
          <form>
            <div className="form-group">
              <TextField
                variant="standard"
                type='email'
                label="E-mail"
                fullWidth
                value={user.email}
                onChange={(e) => {
                  setUser((prevState) => ({
                    ...prevState,
                    email: e.target.value
                  }))
                }}
              />
            </div>
            <div className="form-group">
              <TextField
                variant="standard"
                label="Senha"
                type='password'
                fullWidth
                value={user.password}
                onChange={(e) => {
                  setUser((prevState) => ({
                    ...prevState,
                    password: e.target.value
                  }))
                }}
              />
            </div>
            {isRegister &&
              <div className="form-group">
                <TextField
                  variant="standard"
                  label="Confirmar Senha"
                  type='password'
                  fullWidth
                  value={dataUser.confirmPassword}
                  onChange={(e) => {
                    setUser((prevState) => ({
                      ...prevState,
                      confirmPassword: e.target.value
                    }))
                  }}
                />
              </div>}
            <br />
            <Button
              variant="contained"
              style={{ width: "100%" }}
              onClick={() => isRegister ? register() : [login(user.email, user.password)]}
            >{isRegister ? "Cadastrar-se" : "Entrar"}
            </Button>
          </form>
          <br />
          <center>
            {!isRegister ?
              <p>Nâo possui uma conta?
                <strong
                  onClick={() => setIsRegister(true)}
                  style={{ cursor: "pointer" }}> Inscreva-se
                </strong>
              </p> :
              <p>Já possui uma conta?
                <strong
                  onClick={() => setIsRegister(false)}
                  style={{ cursor: "pointer" }}> Login
                </strong>
              </p>}
          </center>
        </div>
      </div>
      <br />
      <button onClick={() => signInWithGoogle()}>Logar com google</button>
    </div>
  )
}
