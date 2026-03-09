const API_URL = 'http://localhost:3000/produtos';


window.onload = () => {
    verificarSessao();
    listarProdutos();
};


function verificarSessao() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Acesso restrito! Por favor, faça login primeiro.");
        window.location.href = 'login.html';
    }
}


async function listarProdutos() {
    try {
        const response = await fetch(API_URL);
        const produtos = await response.json();
        
        const grid = document.getElementById('produtos-grid');
        grid.innerHTML = ''; 

        produtos.forEach(p => {
            grid.innerHTML += `
                <div class="produto-card">
                    <h3>${p.nome}</h3>
                    <p>Preço: R$ ${p.preco}</p>
                    <small>Categoria: ${p.categoria}</small>
                    <div style="margin-top: 10px;">
                        <button onclick="prepararEdicao('${p.id}', '${p.nome}', ${p.preco}, '${p.categoria}')" style="background-color: #ffa500; margin-right: 5px;">Editar ✏️</button>
                        <button class="btn-excluir" onclick="excluirProduto('${p.id}')">Excluir 🗑️</button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Erro ao listar:', error);
    }
}


function prepararEdicao(id, nome, preco, categoria) {
    document.getElementById('produto-id').value = id; 
    document.getElementById('nome').value = nome;
    document.getElementById('preco').value = preco;
    document.getElementById('categoria').value = categoria;

    
    const btn = document.querySelector('#cadastro button');
    btn.innerText = "Atualizar na Nuvem 🔄";
}


async function salvarProduto() {
    const id = document.getElementById('produto-id').value; 
    const nome = document.getElementById('nome').value;
    const preco = document.getElementById('preco').value;
    const categoria = document.getElementById('categoria').value;
    
    const token = localStorage.getItem('token');

    try {
        
        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/${id}` : API_URL;

        const response = await fetch(url, {
            method: metodo,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token 
            },
            body: JSON.stringify({ 
                nome, 
                preco: Number(preco), 
                categoria: categoria || 'Geral' 
            })
        });

        if (response.ok) {
            alert(id ? 'Produto atualizado com sucesso! 🔄' : 'Produto cadastrado com sucesso! ✅');
            location.reload(); 
        } else {
            const erro = await response.json();
            alert('Erro: ' + (erro.error || 'Não autorizado'));
        }
    } catch (error) {
        alert('Erro de conexão com o servidor.');
    }
}


async function excluirProduto(id) {
    if (!confirm('Deseja realmente excluir este produto?')) return;
    
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token 
            }
        });

        if (response.ok) {
            alert('Produto removido! 🗑️');
            listarProdutos();
        } else {
            alert('Erro ao excluir. Verifique se você está logado.');
        }
    } catch (error) {
        console.error('Erro ao deletar:', error);
    }
}


function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}