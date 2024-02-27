import { useState } from 'react';
import Header from '../../components/Header';
import Title from '../../components/Title';
import { FiPlusCircle } from 'react-icons/fi';
import { useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/auth';
import { db } from '../../services/firebaseConnection';
import { useParams, useNavigate } from 'react-router-dom'
import { collection, getDocs, getDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import './new.css';
const listRef = collection(db, "customres")

export default function New(){
    const {user} = useContext(AuthContext);
    const {id} = useParams();
    const [complemento, setComplemento] = useState();
    const [customers, setCustomers] = useState('');
    const [assunto, setAssunto] = useState('Suporte')
    const [status, setStatus] = useState('Aberto')
    const [customerSelected, setCustomerSelected] = useState(0)
    const [loadCustomer, setLoadCustomer] = useState(true);
    const [idCustomer, setIdCustomer] = useState(false);
    const navigate = useNavigate();

    useEffect(()=>{

        async function loadCustomers(){
             // Busca todos os documentos de clientes da coleção "customers
            const querySnapshot = await getDocs(listRef)
            .then((snapshot)=>{
               let lista = [];// Inicializa um array vazio para armazenar dados dos clientes
              
               // Itera por cada documento no snapshot
               snapshot.forEach((doc) => {
               // Extrai ID e nome fantasia do documento
                lista.push({
                    id: doc.id,
                    nomeFantasia: doc.data().nomeFantasia
                })
               })

               // Verifica se não há clientes encontrados
              if(snapshot.docs.size === 0){
                console.log("Nenhuma empresa encotrada");
                setCustomers([{id: "1", nomeFantasia: "freela"}])
              }
              setCustomers(lista);
              setLoadCustomer(false);

              if(id){
                loadId(lista);
              }

            })
            .catch((error)=>{
                console.log( "Erro ao buscar os clientes",error);
                 setLoadCustomer(false)
                 setCustomers([{id: "1", nomeFantasia: "freela"}])
            })
        }
        loadCustomers();
    }, [id])

    async function loadId(lista){
        const docRef = doc(db, "chamados", id);
        await getDoc(docRef)
        .then((snapshot)=>{
            setAssunto(snapshot.data().assunto)
            setStatus(snapshot.data().status)
            setComplemento(snapshot.data().complemento);

            let index = lista.findIndex(item => item.id === snapshot.data().clienteId)
            setCustomerSelected(index);
            setIdCustomer(true);
        })
        .catch((error)=>{
            console.log(error);
            setIdCustomer(false);
        })
    }

    function handleOptionChange(e){
        setStatus(e.target.value);
    }

    function handleChangeSelect(e){
         setAssunto(e.target.value);
    }

    function handleChangeCustomer(e){
        setCustomerSelected(e.target.value);
        console.log(e.target.value);
    }


    async function handleRegister(e){
        e.preventDefault();

        if(idCustomer){
           const docRef = doc(db, "chamados", id)
           await updateDoc(docRef,{
            cliente: customers[customerSelected].nomeFantasia,
            clienteId: customers[customerSelected].id,
            assunto: assunto,
            complemento: complemento,
            status: status,
            userId: user.uid,
           })
           .then(()=>{
                toast.info("Chamado Atualizado!");
                setCustomerSelected(0);
                setComplemento('')
                navigate('/dashboard');
           })
           .catch((error)=>{
            toast.error("Ops! erro ao atualizar o chamado");
            console.log(error);
           })
        }

       await addDoc(collection(db, "chamados"),{
        criado: new Date(),
        cliente: customers[customerSelected].nomeFantasia,
        clienteId: customers[customerSelected].id,
        assunto: assunto,
        complemento: complemento,
        status: status,
        userId: user.uid,
       })
       .then(() =>{
        toast.success("Chamado registrado!");
        setComplemento('');
        setCustomerSelected(0);
       })
       .catch((error)=>{
        toast.error("Ops! Erro ao registrar")
        console.log(error)
       })
    }

    return(
        <div>
            <Header/>

            <div className='content'>
                <Title name={id ? "Editando chamado" : "Novo chamado"}>
                    <FiPlusCircle size={25}/>
                </Title>
            </div>

            <div className='content'>
                <form className='form-profile' onSubmit={handleRegister}>
                    <label>Cliente</label>
                   {
                    loadCustomer ? (
                        <input type='text' disabled={true} value="carregando..."/>
                    ) : (
                        <select value={customerSelected} onChange={handleChangeCustomer}>
                            { customers.map((item, index) => {
                                return(
                                    <option key={index} value={index}>
                                        {item.nomeFantasia}
                                    </option>
                                )
                            })}
                        </select>
                    )
                   }

                    <label>Assuntos</label>
                    <select value={assunto} onChange={handleChangeSelect}>
                        <option value="Suporte">Suporte</option>
                        <option value="Visita Tecnica">Visita Técnica</option>
                        <option value="Financeiro">Financeiro</option>
                    </select>

                    <label>Status</label>
                    <div className='status'>
                        <input
                            type='radio'
                            name='radio'
                            value="Aberto"
                            onChange={handleOptionChange}
                            checked = {status === 'Aberto'}
                        />
                        <span>Em aberto</span>

                        <input
                            type='radio'
                            name='radio'
                            value="Progresso"
                            onChange={handleOptionChange}
                            checked = {status === 'Progresso'}
                        />
                        <span>Progresso</span>

                        <input
                            type='radio'
                            name='radio'
                            value="Atendido"
                            onChange={handleOptionChange}
                            checked = {status === 'Atendido'}
                        
                        />
                        <span>Atendido</span>
                    </div>

                    <label>Complemento</label>
                    <textarea
                        type="text"
                        placeholder='Descreva seu problema (opcional)'
                        value={complemento}
                        onChange={(e)=> setComplemento(e.target.value)}
                    />

                    <button type='submit'>Registrar</button>
                </form>
            </div>
        </div>
    )
}