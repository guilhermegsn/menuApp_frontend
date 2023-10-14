import { useContext } from "react"
import { UserContext } from "../contexts/UserContext"
import { Redirect } from "react-router-dom"


const withAuthentication = (Component) => (props) => {

  const {isAuthenticated} = useContext(UserContext)

  if(isAuthenticated){
    console.log('Autenticado!')
    return <Component {...props} />
  }else{
    console.log('Não Autenticado!')
    return <Redirect 
    to={{pathname: '/login'}}
  />
  }

 

}

export default withAuthentication