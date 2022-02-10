const request = require('supertest');
const app = require('../../src/app');

test('Deve criar o usuario via SignUp', () => {
   return request(app).post('/auth/signup')
   .send({name: 'Walter', email: `${Date.now()}@mail.com`, senha: '123456'})
   .then(result => {
      expect(result.status).toBe(201);
      expect(result.body.name).toBe('Walter');
      expect(result.body).toHaveProperty('email');
      expect(result.body).not.toHaveProperty('senha');
   })
})

test('Deve receber token ao logar', () => {
   const mail = `${Date.now()}@mail.com`;
   return app.services.user.save(
      {name: 'Walter', email: mail, senha: '123456'})
   .then(() => request(app).post('/auth/signin')
      .send({email: mail, senha: '123456'}))
   .then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
   })
});

test('Nao deve autenticar usuario com senha errada', () => {
   const mail = `${Date.now()}@mail.com`;
   return app.services.user.save(
      {name: 'Walter', email: mail, senha: '123456'})
   .then(() => request(app).post('/auth/signin')
      .send({email: mail, senha: 'xxxxxx'}))
   .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Usuario ou senha invalidos');
   })
})

test('Nao deve autenticar usuario com senha errada', () => {
   return request(app).post('/auth/signin')
      .send({email: 'xxxx@mail.com', senha: 'xxxxxx'})
   .then((res) => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Usuario ou senha invalidos');
   })
})

test('Nao deve acesar as rotas protegidas sem token', () => {
   return request(app).get('/v1/users')
   .then(result => {
      expect(result.status).toBe(401);
   })
})