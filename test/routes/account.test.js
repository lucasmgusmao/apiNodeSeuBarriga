const request = require('supertest');
const app = require('../../src/app');

const MAIN_ROUTE = '/accounts';
let user;

beforeAll( async () => {
   const res = await app.services.user.save({name: 'UserAccount',
                                            email: `${Date.now()}@mail.com`,
                                            senha: '123456'});
   user = {... res[0] };   
})

test('Deve inserir uma conta com sucesso.', () => {
   return request(app).post(MAIN_ROUTE)
      .send({
            name: 'Acc #1',
            user_id:user.id
            })
      .then(result => {
         expect(result.status).toBe(201);
         expect(result.body.name).toBe('Acc #1');
      })
})

test('Deve listar todas as contas', () => {
   return app.db('accounts')
      .insert({name: 'Acc list',
              user_id: user.id})
      .then(() => {
         request(app).get(MAIN_ROUTE)
         .then(result => {
            expect(result.status).toBe(200);
            expect(result.body.length).toBeGreaterThan(0);
         })
      });
});

test('Deve retornar uma conta por ID', () => {
   return app.db('accounts')
      .insert({name: 'Acc by id', user_id: user.id}, ['id'])
      .then(contas => request(app).get(`${MAIN_ROUTE}/${contas[0].id}`))
      .then(result => {    
            expect(result.status).toBe(200);
            console.log(result.body);
            expect(result.body.name).toBe('Acc by id');
            expect(result.body.user_id).toBe(user.id);
         })
         .catch(error => console.log(error))
});

test('Deve alterar uma conta', () => {
   return app.db('accounts')
      .insert({name: 'Acc to update', user_id: user.id}, ['id'])
      .then(contas => request(app).put(`${MAIN_ROUTE}/${contas[0].id}`)
                        .send({name: 'Acc updated'}))         
      .then(res => {
         expect(res.status).toBe(200);
         expect(res.body.name).toBe('Acc updated');
      });
})