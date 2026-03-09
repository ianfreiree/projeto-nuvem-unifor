const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

const serviceAccount = require("./firebase-key.json");


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} em ${req.url}`);
  next();
});


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

console.log('Tentando conectar ao Firebase Firestore... 🔥');
db.collection('teste').add({ status: 'online', data: new Date() })
    .then(() => console.log('Conectado ao Firebase com sucesso! ✅'))
    .catch(err => console.error('Erro no Firebase:', err));


const verificarAuth = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Faça login primeiro!' });
  }
  try {
    await admin.auth().verifyIdToken(token);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
  }
};


app.get('/', (req, res) => {
  res.send('🚀 Backend do Catálogo Inteligente rodando via Docker!');
});

app.get('/produtos', async (req, res) => {
  try {
    const snapshot = await db.collection('produtos').get();
    const produtos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(produtos);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});


app.post('/produtos', verificarAuth, async (req, res) => { 
  try {
    const { nome, preco, categoria } = req.body;
    if (!nome || typeof preco !== 'number' || preco <= 0) {
      return res.status(400).json({ 
        error: 'Dados inválidos: nome é obrigatório e preço deve ser um número maior que zero.' 
      });
    }
    const docRef = await db.collection('produtos').add({
        nome,
        preco: Number(preco),
        categoria: categoria || 'Geral',
        criadoEm: new Date()
    });
    res.status(201).json({ id: docRef.id });
  } catch (error) {
    console.error('Erro ao cadastrar:', error);
    res.status(500).json({ error: 'Erro ao cadastrar' });
  } 
});

app.put('/produtos/:id', verificarAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, preco, categoria } = req.body;
    if (!nome || preco <= 0) {
      return res.status(400).json({ error: 'Nome e preço positivo são obrigatórios para atualizar.' });
    }
    await db.collection('produtos').doc(id).update({
      nome,
      preco: Number(preco),
      categoria,
      atualizadoEm: new Date()
    });
    res.status(200).json({ message: 'Produto atualizado com sucesso! 🔄' });
  } catch (error) {
    console.error('Erro ao atualizar:', error);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

app.delete('/produtos/:id', verificarAuth, async (req, res) => { 
  try {
    const { id } = req.params;
    await db.collection('produtos').doc(id).delete();
    console.log(`Produto ${id} removido com sucesso! 🗑️`);
    res.status(200).json({ message: 'Produto removido com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar:', error);
    res.status(500).json({ error: 'Erro ao deletar o produto' });
  } 
});


app.listen(PORT, () => {
  console.log(`🚀 SERVIDOR ATIVO NA PORTA ${PORT}`);
});