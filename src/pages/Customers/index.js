import { useState } from 'react'
import Header from '../../components/Header'
import Title from '../../components/Title'
import { addDoc, collection } from 'firebase/firestore'
import { toast } from 'react-toastify'; 
import { FiUser } from 'react-icons/fi'
import { db } from '../../services/firebaseConnection'

export default function Customers(){
  const [nome, setNome] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [endereco, setEndereco] = useState('')

  async function handleRegister(e) {
    e.preventDefault(); // Impede o comportamento padrão de envio do formulário
  
    // Valida se os campos estão preenchidos
    if (nome !== '' && cnpj !== '' && endereco !== '') {
      // Cria um novo documento na coleção "customres" com os dados informados
      await addDoc(collection(db, "customres"), {
        nomeFantasia: nome,
        cnpj: cnpj,
        endereco: endereco,
      })
        .then(() => {
          // Limpa os campos após o registro com sucesso
          setNome('');
          setCnpj('');
          setEndereco('');
  
          // Exibe uma notificação toast de sucesso
          toast.success("Empresa Registrada!");
        })
        .catch((error) => {
          console.log(error); // Registra o erro no console
  
          // Exibe uma notificação toast de erro
          toast.error("Erro ao cadastrar a empresa :(");
        });
    } else {
      // Exibe uma notificação toast de aviso caso algum campo esteja vazio
      toast.error("Preencha todos os campos");
    }
  }

  return(
    <div>
      <Header/>

      <div className="content">
        <Title name="Clientes">
          <FiUser size={25} />
        </Title>

        <div className="container">
          <form className="form-profile" onSubmit={handleRegister}>
              <label>Nome fantasia</label>
              <input
                type="text"
                placeholder="Nome da empresa"
                value={nome}
                onChange={(e) => setNome(e.target.value) }
              />

              <label>CNPJ</label>
              <input
                type="text"
                placeholder="Digite o CNPJ"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value) }
              />

              <label>Endereço</label>
              <input
                type="text"
                placeholder="Endereço da empresa"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value) }
              />

              <button type="submit">
                Salvar
              </button>
          </form>
        </div>

      </div>

    </div>
  )
}