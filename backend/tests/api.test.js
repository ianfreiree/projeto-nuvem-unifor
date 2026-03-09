const request = require('supertest');
const app = require('../server');

describe('Testes de API - Catálogo Inteligente', () => {
  
  
  it('Deve retornar 200 na rota raiz', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Backend do Catálogo Inteligente');
  });

  
  it('Deve conseguir listar produtos (GET /produtos)', async () => {
    const res = await request(app).get('/produtos');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

});