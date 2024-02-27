import { useContext, useState } from 'react'
import Header from '../../components/Header'
import Title from '../../components/Title'
import { FiSettings, FiUpload } from 'react-icons/fi'
import avatar from '../../assets/avatar.png'
import {AuthContext} from '../../contexts/auth'
import { db, storage } from '../../services/firebaseConnection'
import { doc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { toast } from 'react-toastify'
import './profile.css';

export default function Profile() {
  const { user, storageUser, setUser, logout } = useContext(AuthContext);
  const [avatarUrl, setAvatarUrl] = useState(user && user.avatarUrl);
  const [imageAvatar, setImageAvatar] = useState(null);
  const [nome, setNome] = useState(user && user.nome);
  const [email, setEmail] = useState(user && user.email);

  // Função para tratar a seleção de uma nova foto de perfil
  function handleFile(e) {
    if (e.target.files[0]) {
      const image = e.target.files[0];

      // Verifica se a imagem é do tipo JPEG ou PNG
      if (image.type === 'image/jpeg' || image.type === 'image/png') {
        setImageAvatar(image);
        setAvatarUrl(URL.createObjectURL(image)); // Mostra a imagem selecionada
      } else {
        alert("Envie uma imagem do tipo PNG ou JPEG");
        setImageAvatar(null);
        return;
      }
    }
  }

  // Função para fazer o upload da foto de perfil para o Firebase Storage
  async function handleUpload() {
    const currentUid = user.uid; // Pega o ID do usuário atual

    const uploadRef = ref(storage, `images/<span class="math-inline">\{currentUid\}/</span>{imageAvatar.name}`);

    const uploadTask = uploadBytes(uploadRef, imageAvatar)
      .then((snapshot) => {
        return getDownloadURL(snapshot.ref); // Obtém a URL pública da imagem
      })
      .then(async (downloadURL) => {
        const urlFoto = downloadURL;

        // Atualiza os dados do usuário no Firestore
        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, {
          avatarUrl: urlFoto,
          nome: nome,
        });

        // Atualiza os dados do usuário no estado e no contexto
        let data = {
          ...user,
          nome: nome,
          avatarUrl: urlFoto,
        };
        setUser(data);
        storageUser(data);
        toast.success("Atualizado com sucesso!"); // Mostra uma notificação de sucesso
      });
  }

  // Função para tratar a submissão do formulário de perfil
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (imageAvatar === null && nome !== '') {
        // Atualiza apenas o nome do usuário
        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, {
          nome: nome,
        });

        // Atualiza os dados do usuário no estado e no contexto
        let data = {
          ...user,
          nome: nome,
        };
        setUser(data);
        storageUser(data);
        toast.success("Atualizado com sucesso!");

      } else if (nome !== '' && imageAvatar !== null) {
        // Atualiza tanto nome quanto a foto
        await handleUpload();
      }
    } catch (error) {
      console.error(error); // Trata eventuais erros
      toast.error("Erro ao atualizar perfil");
    }
  }

  return(
    <div>
      <Header/>

      <div className="content">
        <Title name="Minha conta">
          <FiSettings size={25} />
        </Title>

       <div className="container">

        <form className="form-profile" onSubmit={handleSubmit}>
          <label className="label-avatar">
            <span>
              <FiUpload color="#FFF" size={25} />
            </span>

            <input type="file" accept="image/*" onChange={handleFile}  /> <br/>
            {avatarUrl === null ? (
              <img src={avatar} alt="Foto de perfil" width={250} height={250} />
            ) : (
              <img src={avatarUrl} alt="Foto de perfil" width={250} height={250} />
            )}

          </label>

          <label>Nome</label>
          <input type="text" value={nome} onChange={(e) =>  setNome(e.target.value)}/>

          <label>Email</label>
          <input type="text" value={email} disabled={true} />
          
          <button type="submit">Salvar</button>
        </form>

       </div>

       <div className="container">
         <button className="logout-btn" onClick={ () => logout() }>Sair</button>
       </div>

      </div>

    </div>
  )
}