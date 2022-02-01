const request = require('supertest');
const app = require('../../src/app');
const mail = `${Date.now()}@mail.com`;

const jwt = require('jwt-simple');

const MAIN_ROUTE = '/v1/users';

let user;

beforeAll( async () => {
   const res = await app.services.user.save({name: 'UserAccount',
                                            email: `${Date.now()}@mail.com`,
                                            senha: '123456'});
   user = {... res[0] };
   user.token = jwt.encode(user, 'Segredo!');
})


test('Deve listar os usuários.', () => {
   return request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${user.token}`)
      .then(res => {
         expect(res.status).toBe(200);
         expect(res.body.length).toBeGreaterThan(0);
      });
});

test('Deve inserir usuario com sucesso.', () => {
   return request(app).post(MAIN_ROUTE)
      .send({name: "Walter Mitty", email: mail, senha: "123456"})
      .set('authorization', `bearer ${user.token}`)
      .then(res => {
         expect(res.status).toBe(201);
         expect(res.body.name).toBe("Walter Mitty");
         expect(res.body).not.toHaveProperty("senha");
      });
})

test('Deve armazenar senha criptografada.', async () => {
   const result = await request(app).post(MAIN_ROUTE)
   .send({name: "Walter Mitty", email: `${Date.now()}@mail.com`, senha: "123456"})
   .set('authorization', `bearer ${user.token}`);
   expect(result.status).toBe(201);

   const {id} = result.body;
   const usrDB = await app.services.user.findOne({id});
   expect(usrDB.senha).not.toBeUndefined();
   expect(usrDB.senha).not.toBe('123456');
})

test('Nao deve inserir usuario sem nome', () => {
   return request(app).post(MAIN_ROUTE)
   .send({
      email: "walter@mail.com",
      senha: "123456"
   })
   .set('authorization', `bearer ${user.token}`)
   .then(res => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Nome é um atributo obrigatório.');
   });
})

test('Nao deve inserir usuario sem email.', async () => {
   const result = await request(app).post(MAIN_ROUTE)
      .send({
         name: "Walter Mitty",
         senha: "123456"
      })
      .set('authorization', `bearer ${user.token}`);
   expect(result.status).toBe(400);
   expect(result.body.error).toBe('Email é um atributo obrigatório.');
});

test('Nao deve inserir usuario sem senha.', (done) => {
   request(app).post(MAIN_ROUTE)
      .send({
         name: "Walter Mitty",
         email: mail
      })
      .set('authorization', `bearer ${user.token}`)
      .then((res) => {
         expect(res.status).toBe(400);
         expect(res.body.error).toBe('Senha é um atributo obrigatório.');
         done();
      })
      .catch(err => done.fail(err));
});

test('Não deve inserir usuário com email existente.', () => {
   request(app).post(MAIN_ROUTE)
   .send({
      name: "Walter Mitty",
      email: '1643204152645@mail.com',
      senha: "123456"
   })
   .set('authorization', `bearer ${user.token}`)
   .then(res => {
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Já existe um usuário com esse email.");
   });
});