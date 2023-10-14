import { useState, createContext, useEffect } from "react";
import { getRedirectResult, signInWithEmailAndPassword, signInWithRedirect, signOut } from "firebase/auth";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { useHistory } from 'react-router-dom';

const provider = new GoogleAuthProvider();


export const UserContext = createContext({})

function UserProvider({ children }) {

  const auth = getAuth();


  const history = useHistory();
  const [dataUser, setDataUser] = useState({})
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [shoopingCart, setShoppingCart] = useState([])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user)
    });
    return () => unsubscribe();
  }, [auth]);


  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result.user) {
          // O usuário fez login com sucesso
          const user = result.user;
          console.log("Usuário logado com sucesso:", user);
          setDataUser(user)
          localStorage.setItem("user", JSON.stringify(user));
        }
      } catch (error) {
        console.error("Erro ao verificar o resultado de redirecionamento:", error);
      }
    };

    checkUserLoggedIn();
  }, [auth]);

  useEffect(() => {
    const updateContextFromLocalStorage = () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        setDataUser(storedUser);
        setIsAuthenticated(true)
      }
    };
    updateContextFromLocalStorage();
  }, []);

  
  const login = async (user, pass) => {
    try {
      const userLogin = await signInWithEmailAndPassword(
        auth,
        user,
        pass
      );
      if (userLogin) {
        setDataUser(userLogin.user)
        setIsAuthenticated(true)
        localStorage.setItem("user", JSON.stringify(userLogin.user));
        history.push('/shopping-cart')
      } 
    } catch (error) {
      console.log(error.message);
    }
  }

  const logout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false)
      setDataUser({})
      localStorage.removeItem("user");
    } catch (error) {
      console.log(error)
    }
  };

  //const auth = getAuth();

   
    const signInWithGoogle = async () => {
      try {
        await signInWithRedirect(auth, provider)
      } catch (error) {
        console.error("Erro ao fazer login com o Google:", error);
      }
    }
  
  return (
    <UserContext.Provider
      value={
        {
          dataUser, setDataUser,
          isAuthenticated, setIsAuthenticated,
          shoopingCart, setShoppingCart,
          login, logout, signInWithGoogle
        }
      }
    >
      {children}
    </UserContext.Provider>)
}

export default UserProvider