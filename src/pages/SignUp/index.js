import { useState, useContext } from 'react';
import logo from '../../assets/logo.png';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/auth';
export default function SignUp() {

  // **Gerenciamento de estado**
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp, loadingAuth } = useContext(AuthContext);

  // Função assíncrona para lidar com a submissão do formulário
  async function handleSubmit(e) {
    // Evita o comportamento padrão de submissão do formulário (atualização da página)
    e.preventDefault();
    // Verifica se todos os campos estão preenchidos
    if (name !== '' && email !== '' && password !== '') {

      // Chama a função "signUp" do contexto, passando as credenciais do usuário
      // e aguardando a resposta assíncrona
      await signUp(email, password, name);
    }
  }


  return (
    <div className="container-center">
      <div className="login">
        <div className="login-area">
          <img src={logo} alt="Logo do sistema de chamados" />
        </div>

        <form onSubmit={handleSubmit}>
          <h1>Nova conta</h1>
          <input
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="text"
            placeholder="email@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">
            {loadingAuth ? 'Carregando...' : 'Cadastrar'}
          </button>

          <Link to="/">Já possui uma conta? Faça login</Link>
        </form>
      </div>
    </div>
  );
}
