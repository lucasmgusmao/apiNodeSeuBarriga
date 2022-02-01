const request = require('supertest');
const app = require('../../src/app');

const jwt = require('jwt-simple');

const MAIN_ROUTE = '/v1/accounts';
let user;
let user2;

beforeEach( async () => {
   const res = await app.services.user.save({name: 'UserAccount',
                                            email: `${Date.now()}@mail.com`,
                                            senha: '123456'});
   user = {... res[0] };
   user.token = jwt.encode(user, 'Segredo!');

   const res2 = await app.services.user.save({name: 'UserAccount 2',
                                            email: `${Date.now()}@mail.com`,
                                            senha: '123456'});
   user2 = {... res2[0] };
})

test('Deve listar apenas as contas do usuario.', () => {
   return app.db('accounts').insert([
      {name: 'Acc User #1', user_id: user.id},
      {name: 'Acc User #2', user_id: user2.id},
      
   ]).then( () => {
      request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${user.token}`)
      .then(result => {
         expect(result.status).toBe(200);
         expect(result.body.length).toBe(1);
         expect(result.body[0].name).toBe('Acc User #1');
      })
   })
})

test('Deve inserir uma conta com sucesso.', () => {
   return request(app).post(MAIN_ROUTE)
      .send({name: 'Acc #1'})
      .set('authorization', `bearer ${user.token}`)
      .then(result => {
         expect(result.status).toBe(201);
         expect(result.body.name).toBe('Acc #1');
      })
})

test('Nao deve inserir uma conta sem nome', () => {
   return request(app).post(MAIN_ROUTE)
      .send({})
      .set('authorization', `bearer ${user.token}`)
      .then(result => {
         expect(result.status).toBe(400);
         expect(result.body.error).toBe('Nome é um atributo obrigatório');
      })
})

test('Nao deve inserir uma conta com nome duplicado para o mesmo usuario', () => {
   return app.db('accounts').insert({name: 'Acc duplicada', user_id: user.id})
   .then( () => {
      console.log('Test user B');
      request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${user.token}`)
      .send({name: "Acc duplicada"})
      .then( result => {
         expect(result.status).toBe(400);
         expect(result.body.error).toBe('Já existe uma conta com esse nome');
      })
   })
})

test('Não deve retornar uma conta de outro usuário.', () => {
   return app.db('accounts')
      .insert({name: 'Acc User #2', user_id: user2.id}, ['id'])
      .then( acc => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`)
         .set('authorization', `bearer ${user.token}`))
      .then( res => {
         expect(res.status).toBe(403);
         expect(res.body.error).toBe('Este recurso nao pertence ao usuario');
      })
})

test('Deve retornar uma conta por ID', () => {
   return app.db('accounts')
      .insert({name: 'Acc by id', user_id: user.id}, ['id'])
      .then(contas => request(app).get(`${MAIN_ROUTE}/${contas[0].id}`).set('authorization', `bearer ${user.token}`))
      .then(result => {    
            expect(result.status).toBe(200);
            expect(result.body.name).toBe('Acc by id');
            expect(result.body.user_id).toBe(user.id);
         });
});

test('Deve alterar uma conta', () => {
   return app.db('accounts')
      .insert({name: 'Acc to update', user_id: user.id}, ['id'])
      .then(contas => request(app).put(`${MAIN_ROUTE}/${contas[0].id}`)
                        .send({name: 'Acc updated'})
                        .set('authorization', `bearer ${user.token}`))
      .then(res => {
         expect(res.status).toBe(200);
         expect(res.body.name).toBe('Acc updated');
      });
})


test.skip('Não deve alterar uma conta de outro usuário.', () => {
   
})

test('Deve remover uma conta', () => {
   return app.db('accounts')
      .insert({name: 'Acc to Remove', user_id: user.id}, ['id'])
      .then(acc => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`).set('authorization', `bearer ${user.token}`))
      .then(result => {
         expect(result.status).toBe(204);
      })
})


test.skip('Não deve remover uma conta de outro usuário.', () => {
   
})