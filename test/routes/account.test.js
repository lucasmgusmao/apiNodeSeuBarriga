const request = require('supertest');
const app = require('../../src/app');

const jwt = require('jwt-simple');

const MAIN_ROUTE = '/v1/accounts';
let user;

beforeAll( async () => {
   const res = await app.services.user.save({name: 'UserAccount',
                                            email: `${Date.now()}@mail.com`,
                                            senha: '123456'});
   user = {... res[0] };
   user.token = jwt.encode(user, 'Segredo!');
})

test('Deve inserir uma conta com sucesso.', () => {
   return request(app).post(MAIN_ROUTE)
      .send({
            name: 'Acc #1',
            user_id:user.id
            })
      .set('authorization', `bearer ${user.token}`)
      .then(result => {
         expect(result.status).toBe(201);
         expect(result.body.name).toBe('Acc #1');
      })
})

test('Nao deve inserir uma conta sem nome', () => {
   return request(app).post(MAIN_ROUTE)
      .send({
            user_id:user.id
            })
      .set('authorization', `bearer ${user.token}`)
      .then(result => {
         expect(result.status).toBe(400);
         expect(result.body.error).toBe('Nome é um atributo obrigatório');
      })
})

test.skip('Nao deve inserir uma conta com nome duplicado para o mesmo usuario', () => {

})

test('Deve listar todas as contas', () => {
   return app.db('accounts')
      .insert({name: 'Acc list',
              user_id: user.id})
      .then(() => {
         request(app).get(MAIN_ROUTE)
         .set('authorization', `bearer ${user.token}`)
         .then(result => {
            expect(result.status).toBe(200);
            expect(result.body.length).toBeGreaterThan(0);
         })
      });
});

test.skip('Deve listar apenas as contas do usuario.', () => {

})

test.skip('Não deve retornar uma conta de outro usuário.', () => {

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