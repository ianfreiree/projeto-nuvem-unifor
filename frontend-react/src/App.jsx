import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [isLogged, setIsLogged] = useState(false)
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [produtos, setProdutos] = useState([])
  const [form, setForm] = useState({ id: '', nome: '', preco: '', categoria: '' })
  
  const API_URL = 'https://projeto-nuvem-unifor.onrender.com'

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsLogged(true)
      listarProdutos()
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const userCredential = await window.firebase.auth().signInWithEmailAndPassword(credentials.email, credentials.password)
      const token = await userCredential.user.getIdToken()
      localStorage.setItem('token', token)
      setIsLogged(true)
      listarProdutos()
    } catch (error) {
      alert("Usuário ou senha inválidos!")
    }
  }

  const listarProdutos = async () => {
  try {
    
    const response = await fetch(`${API_URL}/produtos`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });

  
    const data = await response.json();
    setProdutos(data);
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
  }
};

  const salvarProduto = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    const metodo = form.id ? 'PUT' : 'POST'
    const url = form.id ? `${API_URL}/${form.id}` : API_URL

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': token 
        },
        body: JSON.stringify({ ...form, preco: Number(form.preco) })
      })

      if (res.ok) {
        alert(form.id ? 'Produto atualizado! 🔄' : 'Produto cadastrado! ✅')
        setForm({ id: '', nome: '', preco: '', categoria: '' }) 
        listarProdutos()
      } else {
        alert("Erro na operação. Verifique o login.")
      }
    } catch (err) {
      alert("Erro de conexão com o servidor Docker.")
    }
  }

  const excluirProduto = async (id) => {
    if (!confirm('Deseja excluir?')) return
    const token = localStorage.getItem('token')
    await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': token }
    })
    listarProdutos()
  }

  if (!isLogged) {
    return (
      <div className="container">
        <h1>🚀 Login - Catálogo Inteligente</h1>
        <form onSubmit={handleLogin} className="cadastro">
          <input type="email" placeholder="E-mail" onChange={e => setCredentials({...credentials, email: e.target.value})} required />
          <input type="password" placeholder="Senha" onChange={e => setCredentials({...credentials, password: e.target.value})} required />
          <button type="submit" className="btn-principal">Entrar</button>
        </form>
      </div>
    )
  }

  return (
    <div className="container">
      <header>
  <h1>🚀 Catálogo Inteligente </h1>
  <button 
    onClick={() => { localStorage.removeItem('token'); setIsLogged(false) }} 
    className="btn-sair"
  >
    Sair
  </button>
</header>
      
      <section className="cadastro">
        <h2>{form.id ? 'Editar Produto' : 'Cadastrar Novo Produto'}</h2>
        <form onSubmit={salvarProduto}>
          <input type="text" placeholder="Nome" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
          <input type="number" placeholder="Preço" value={form.preco} onChange={e => setForm({...form, preco: e.target.value})} required />
          <input type="text" placeholder="Categoria" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} />
          <button type="submit" className="btn-principal">{form.id ? 'Atualizar' : 'Salvar na Nuvem 🔥'}</button>
          {form.id && <button type="button" onClick={() => setForm({ id: '', nome: '', preco: '', categoria: '' })}>Cancelar</button>}
        </form>
      </section>

      <hr />

      <section className="lista">
        <h2>Produtos no Estoque</h2>
        <div className="produtos-grid">
          {produtos.length === 0 && <p>Nenhum produto encontrado...</p>}
          {produtos.map(p => (
            <div key={p.id} className="produto-card">
              <h3>{p.nome}</h3>
              <p>R$ {p.preco}</p>
              <small>{p.categoria}</small>
              <div className="acoes">
                <button onClick={() => setForm(p)} className="btn-editar">Editar ✏️</button>
                <button onClick={() => excluirProduto(p.id)} className="btn-excluir">Excluir 🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default App