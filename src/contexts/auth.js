import { useState, createContext, useEffect } from 'react';
import { auth, db } from '../services/firebaseConnection';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export const AuthContext = createContext({});


function AuthProvider({ children }) {
  // Estados para gerenciar o usuário, status de carregamento e autenticação
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  // Obtém a função de navegação do React Router
  const navigate = useNavigate();

  // **Hook useEffect**

  useEffect(() => {
    async function loadUser() {
      // Tenta carregar o usuário do localStorage
      const storageUser = localStorage.getItem('@ticketsPRO');
      
      if (storageUser) {
        setUser(JSON.parse(storageUser));
      }

      setLoading(false); // Define a flag de carregamento como false
    }

    loadUser(); // Chama a função para carregar o usuário
  }, []);

  // **Função signIn**

  async function signIn(email, password) {
    setLoadingAuth(true); // Define a flag de carregamento de autenticação como true

    await signInWithEmailAndPassword(auth, email, password)
      .then(async (value) => {
        const uid = value.user.uid;

        // Obtém dados adicionais do usuário do banco de dados
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        const data = {
          uid: uid,
          nome: docSnap.data().nome,
          email: value.user.email,
          avatarUrl: docSnap.data().avatarUrl,
        };

        // Atualiza states, armazena o usuário no localStorage e navega para o dashboard
        setUser(data);
        storageUser(data);
        setLoadingAuth(false);
        toast.success("Bem-vindo(a) de volta!");
        navigate("/dashboard");
      })
      .catch((error) => {
        console.log(error);
        setLoadingAuth(false);
        toast.error("Ops algo deu errado!");
      });
  }

  // **Função signUp**

  async function signUp(email, password, name) {
    setLoadingAuth(true); // Define a flag de carregamento de autenticação como true

    await createUserWithEmailAndPassword(auth, email, password)
      .then(async (value) => {
        const uid = value.user.uid;

        // Cria um documento do usuário no banco de dados
        await setDoc(doc(db, "users", uid), {
          nome: name,
          avatarUrl: null,
        })
          .then(() => {
            const data = {
              uid: uid,
              nome: name,
              email: value.user.email,
              avatarUrl: null,
            };

            // Atualiza states, armazena o usuário no localStorage e navega para o dashboard
            setUser(data);
            storageUser(data);
            setLoadingAuth(false);
            toast.success("Seja bem-vindo ao sistema!");
            navigate("/dashboard");
          });
      })
      .catch((error) => {
        console.log(error);
        setLoadingAuth(false);
      });
  }

  // **Função storageUser**

  function storageUser(data) {
    localStorage.setItem('@ticketsPRO', JSON.stringify(data)); // Armazena o usuário no localStorage
  }

  // **Função logout**

  async function logout() {
    await signOut(auth); // Desconecta o usuário
    localStorage.removeItem('@ticketsPRO'); // Remove o usuário do localStorage
    setUser(null); // Atualiza o state do usuário
  }
  return(
    <AuthContext.Provider 
      value={{
        signed: !!user,
        user,
        signIn,
        signUp,
        logout,
        loadingAuth,
        loading,
        storageUser,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider;