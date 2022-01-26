const request = require('supertest');
const app = require('../../src/app');
const mail = `${Date.now()}@mail.com`;

test('Deve listar os usuários.', () => {
   return request(app).get('/users')
      .then(res => {
         expect(res.status).toBe(200);
         expect(res.body.length).toBeGreaterThan(0);
      })
      .catch(error => console.log(error));
});

test('Deve inserir usuario com sucesso.', () => {
   return request(app).post('/users')
      .send({
         name: "Walter Mitty",
         email: mail,
         senha: "123456"
      })
      .then(res => {
         expect(res.status).toBe(201);
         expect(res.body.name).toBe("Walter Mitty");
      })
      .catch(error => console.log(error));
})

test('Nao deve inserir usuario sem nome', () => {
   return request(app).post('/users')
   .send({
      email: "walter@mail.com",
      senha: "123456"
   })
   .then(res => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Nome é um atributo obrigatório.');
   })
   .catch(error => console.log(error));
})

test('Nao deve inserir usuario sem email.', async () => {
   const result = await request(app).post('/users')
      .send({
         name: "Walter Mitty",
         senha: "123456"
      });
   expect(result.status).toBe(400);
   expect(result.body.error).toBe('Email é um atributo obrigatório.');
});

test('Nao deve inserir usuario sem senha.', (done) => {
   request(app).post('/users')
      .send({
         name: "Walter Mitty",
         email: mail
      })
      .then((res) => {
         expect(res.status).toBe(400);
         expect(res.body.error).toBe('Senha é um atributo obrigatório.');
         done();
      })
      .catch(err => done.fail(err));
});

test('Não deve inserir usuário com email existente.', () => {
   return request(app).post('/users')
   .send({
      name: "Walter Mitty",
      email: '1643204152645@mail.com',
      senha: "123456"
   })
   .then(res => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Já existe um usuário com esse email.");
   })
   .catch(error => console.log(error));
});