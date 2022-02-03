const request = require('supertest');
const app = require('../../src/app');
const jwt = require('jwt-simple');

const MAIN_ROUTE = '/v1/transactions';
let user;
let user2;

let accUser;
let accUser2;

beforeAll(async () => {
   await app.db('transactions').del();
   await app.db('accounts').del();
   await app.db('users').del();
   users = await app.db('users').insert([
      {
       name: 'User #1',
       email: 'user@mail.com',
       senha: '$2a$10$rJhUWN9qNPkjfd0N9vH.tu92NRj017Um4CrI9NsgY4FOmqb9ggqG2'
      },
      {
         name: 'User #2',
         email: 'user2@mail.com',
         senha: '$2a$10$rJhUWN9qNPkjfd0N9vH.tu92NRj017Um4CrI9NsgY4FOmqb9ggqG2'
      }
   ], '*');
   [user, user2] = users;

   delete user.senha;
   user.token = jwt.encode(user, 'Segredo!');
   
   accs = await app.db('accounts').insert([
      {name: 'Acc #1', user_id: user.id},
      {name: 'Acc #2', user_id: user2.id}
   ], '*');

   [accUser, accUser2] = accs;

})

test('Deve listar apenas as transacoes do usuario', () => {
   return app.db('transactions').insert([
      {description: 'T1', date: new Date(), ammount: 100, type: 'I', acc_id: accUser.id},
      {description: 'T2', date: new Date(), ammount: 300, type: 'I', acc_id: accUser2.id}
   ])
   .then(()=>request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${user.token}`))
   .then(result => {
      expect(result.status).toBe(200);
      expect(result.body).toHaveLength(1);
      expect(result.body[0].description).toBe('T1');
   });
})

test('Deve funcionar com os snippets', () => {
   return request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${user.token}`)
      .then(res => {
         expect(res.status).toBe(200);
         expect(res.body[0].description).toBe('T1');
      });
})