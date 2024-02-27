import { useContext, useEffect, useState } from 'react'
import {AuthContext} from '../../contexts/auth'
import Header from '../../components/Header'
import Title from '../../components/Title'
import { FiPlus, FiMessageSquare, FiSearch, FiEdit2 } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { format } from 'date-fns';
import Modal from '../../components/Modal';
import { collection, getDocs, orderBy, limit, startAfter, query} from 'firebase/firestore'
import { db } from '../../services/firebaseConnection'

import './dashboard.css'

const listRef = collection(db, "chamados")

export default function Dashboard(){
  const { logout } = useContext(AuthContext);
  const [chamados, setChamados] = useState([])
  const [loading, setLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false)
  const[lastDocs, setLastDocs] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [detail , setDetail] = useState();

  useEffect(() => {
    // **Função loadChamados**
  
    async function loadChamados() {
      // Cria uma consulta ordenada e limitada a 5 documentos
      const q = query(listRef, orderBy('criado', 'desc'), limit(5));
  
      // Busca os documentos da consulta
      const querySnapshot = await getDocs(q);
  
      // Inicializa a lista de chamados vazia
      setChamados([]);
  
      // Atualiza o estado com os dados recuperados (feito dentro da função updateState)
      await updateState(querySnapshot);
  
      // Define a flag de carregamento como false após a busca
      setLoading(false);
    }
  
    // Chama a função loadChamados na montagem do componente
    loadChamados();
  
    // Função de limpeza (vazia por enquanto)
    return () => { }
  }, []);
  
  // **Função updateState**
  
  async function updateState(querySnapshot) {
    // Verifica se a coleção está vazia
    const isCollectionEmpty = querySnapshot.size === 0;
  
    if (!isCollectionEmpty) {
      let lista = []; // Inicializa uma lista vazia
  
      // Itera por cada documento no snapshot
      querySnapshot.forEach((doc) => {
        // Extrai dados do documento e formata a data
        lista.push({
          id: doc.id,
          assunto: doc.data().assunto,
          cliente: doc.data().cliente,
          clienteId: doc.data().clienteId,
          created: doc.data().created,
          createdFormat: format(doc.data().criado.toDate(), 'dd/MM/yyyy'),
          status: doc.data().status,
          complemento: doc.data().complemento,
        });
      });
  
      // Recupera o último documento da consulta
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
  
      // Atualiza o estado com a lista de chamados (concatenando com a existente)
      setChamados(chamados => [...chamados, ...lista]);
      // Atualiza o estado com o último documento para paginação
      setLastDocs(lastDoc);
    } else {
      // Define a flag indicando que a coleção está vazia
      setIsEmpty(true);
    }
  
    // Define a flag de carregamento de mais dados como false
    setLoadingMore(false);
  }
  
  // **Função handleMore**
  
  async function handleMore() {
    // Define a flag de carregamento de mais dados como true
    setLoadingMore(true);
  
    // Cria uma consulta usando o último documento para paginação e limita a 5 documentos
    const q = query(listRef, orderBy('criado', 'desc'), startAfter(lastDocs), limit(5));
  
    // Busca os documentos da consulta
    const querySnapshot = await getDocs(q);
  
    // Atualiza o estado com os dados recuperados (feito dentro da função updateState)
    await updateState(querySnapshot);
  }
  
  // **Função toggleModal**
  
  function toggleModal(item) {
    // Inverte o estado do modal de visualização de postagem
    setShowPostModal(!showPostModal);
    // Define o item selecionado para o modal
    setDetail(item);
  }
  

  if(loading){
    return(
      <div>
        <Header/>
        <div className='content'>
          <Title name="Chamados">
            <FiMessageSquare size={25} />
          </Title>
        
          <div className='container deashboard'>
              <span>Buscando Chamados...</span>
          </div>
        </div>
      </div>
    )
    
  }


  return(
    <div>
      <Header/>

      <div className="content">
        <Title name="Chamados">
          <FiMessageSquare size={25} />
        </Title>

        <>
          {chamados.length === 0 ? (
            <div className="container dashboard">
              <span>Nenhum chamado encontrado...</span>
              <Link to="/new" className="new">
                <FiPlus color="#FFF" size={25} />
                Novo chamado
              </Link>  
            </div>
          ) : (
            <>
              <Link to="/new" className="new">
                <FiPlus color="#FFF" size={25} />
                Novo chamado
              </Link>  

              <table>
                <thead>
                  <tr>
                    <th scope="col">Cliente</th>
                    <th scope="col">Assunto</th>
                    <th scope="col">Status</th>
                    <th scope="col">Cadastrando em</th>
                    <th scope="col">#</th>
                  </tr>
                </thead>
                <tbody>
                 {chamados.map((item, index) => {
                    return(
                      <tr key={index}>
                      <td data-label="Cliente">{item.cliente}</td>
                      <td data-label="Assunto">{item.assunto}</td>
                      <td data-label="Status">
                        <span className="badge" style={{ backgroundColor: item.status === 'Aberto' ? '#5cb85c' : '#999'}}>
                          {item.status}
                        </span>
                      </td>
                      <td data-label="Cadastrado">{item.createdFormat}</td>
                      <td data-label="#">
                        <button className="action" style={{ backgroundColor: '#3583f6' }} onClick={() => toggleModal(item)}>
                          <FiSearch color='#FFF' size={17}/>
                        </button>
                        <Link  to={`/new/${item.id}`} className="action" style={{ backgroundColor: '#f6a935' }}>
                          <FiEdit2 color='#FFF' size={17}/>
                        </Link>
                      </td>
                    </tr>
                    )
                 })}
                </tbody>
              </table>  

              {loadingMore &&  <h3>Buscando mais chamados</h3>}
              {!loadingMore && !isEmpty &&  <button onClick={handleMore} className='btn-more'>Buscar mais</button>}
                    
            </>
          )}
        </>

      </div>
        {showPostModal && (
          <Modal
          conteudo = {detail}
          close ={ () => setShowPostModal(!showPostModal)}
          />
        )}
    </div>
  )
}