const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
require('dotenv').config();

const app = express();

// SONARQUBE FIX (S5689): Ocultar a tecnologia usada no backend por segurança
app.disable('x-powered-by');

const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL || `http://localhost:${PORT}`;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Catálogo Inteligente - UNIFOR',
      version: '1.0.0',
      description: 'Documentação da API para gerenciamento de produtos em nuvem',
    },
    servers: [{ url: API_URL }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    paths: {
      '/': {
        get: {
          summary: 'Verificar status do servidor',
          responses: { 200: { description: 'Servidor rodando' } }
        }
      },
      '/produtos': {
        get: {
          summary: 'Listar todos os produtos',
          responses: { 200: { description: 'Sucesso' } }
        },
        post: {
          summary: 'Cadastrar novo produto',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object' } } }
          },
          responses: { 201: { description: 'Criado' } }
        }
      },
      '/produtos/{id}': {
        put: {
          summary: 'Atualizar produto',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Atualizado' } }
        },
        delete: {
          summary: 'Remover produto',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Removido' } }
        }
      }
    }
  },
  apis: [], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// SONARQUBE FIX (S5122): Configurar o CORS de forma menos permissiva
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} em ${req.url}`);
  next();
});

// =========================================================================
// REFATORAÇÃO (Segurança): O filtro blindado para a Chave Privada
// =========================================================================
let chavePrivada = process.env.FIREBASE_PRIVATE_KEY || "";

// SONARQUBE FIX: Remove aspas apenas das extremidades e formata as quebras de linha
chavePrivada = chavePrivada.replace(/^"|"$/g, '').replaceAll('\\n', '\n');

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: chavePrivada
};
// =========================================================================

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

console.log('A tentar conectar ao Firebase Firestore... 🔥');
db.collection('teste').add({ status: 'online', data: new Date() })
    .then(() => console.log('Conectado ao Firebase com sucesso! ✅'))
    .catch(err => {
        // SONARQUBE FIX (S2486): Tratar e registar o erro adequadamente
        console.error('Erro de conexão inicial no Firebase:', err.message);
    });

const verificarAuth = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'Acesso negado.' });
  try {
    await admin.auth().verifyIdToken(token);
    next();
  } catch (error) {
    // SONARQUBE FIX (S2486)
    console.error('Erro na autenticação:', error.message);
    res.status(401).json({ error: 'Sessão expirada.' });
  }
};

app.get('/', (req, res) => {
  res.send('🚀 Backend do Catálogo Inteligente a correr!');
});

app.get('/produtos', async (req, res) => {
  try {
    const snapshot = await db.collection('produtos').get();
    const produtos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(produtos);
  } catch (error) {
    // SONARQUBE FIX (S2486)
    console.error('Erro ao listar produtos:', error.message);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

app.post('/produtos', verificarAuth, async (req, res) => { 
  try {
    const { nome, preco, categoria } = req.body;
    if (!nome || typeof preco !== 'number' || preco <= 0) {
      return res.status(400).json({ error: 'Dados inválidos.' });
    }
    const docRef = await db.collection('produtos').add({
        nome,
        preco: Number(preco),
        categoria: categoria || 'Geral',
        criadoEm: new Date()
    });
    res.status(201).json({ id: docRef.id });
  } catch (error) {
    // SONARQUBE FIX (S2486)
    console.error('Erro ao criar produto:', error.message);
    res.status(500).json({ error: 'Erro ao registar' });
  } 
});

app.put('/produtos/:id', verificarAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, preco, categoria } = req.body;
    await db.collection('produtos').doc(id).update({
      nome,
      preco: Number(preco),
      categoria,
      atualizadoEm: new Date()
    });
    res.status(200).json({ message: 'Produto atualizado!' });
  } catch (error) {
    // SONARQUBE FIX (S2486)
    console.error('Erro ao atualizar produto:', error.message);
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
});

app.delete('/produtos/:id', verificarAuth, async (req, res) => { 
  try {
    const { id } = req.params;
    await db.collection('produtos').doc(id).delete();
    res.status(200).json({ message: 'Removido com sucesso!' });
  } catch (error) {
    // SONARQUBE FIX (S2486)
    console.error('Erro ao eliminar produto:', error.message);
    res.status(500).json({ error: 'Erro ao eliminar' });
  } 
});

app.listen(PORT, () => {
  console.log(`🚀 SERVIDOR ATIVO NA PORTA ${PORT}`);
});