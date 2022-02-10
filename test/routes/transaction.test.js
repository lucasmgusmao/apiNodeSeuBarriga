const request = require('supertest');
const app = require('../../src/app');
const jwt = require('jwt-simple');
const { restart } = require('nodemon');

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

test('Deve inserir uma transacao com sucesso', () => {
   return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${user.token}`)
      .send({description: "New T", date: new Date(), ammount: 100, type: "I", acc_id: accUser.id})
      .then(res => {
         expect(res.status).toBe(201);
         expect(res.body.acc_id).toBe(accUser.id);
         expect(res.body.ammount).toBe('100.00');
      });
})

test('Transacoes de entrada devem ser positivas', () => {
   return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${user.token}`)
      .send({description: "New T", date: new Date(), ammount: -100, type: "I", acc_id: accUser.id})
      .then(res => {
         expect(res.status).toBe(201);
         expect(res.body.acc_id).toBe(accUser.id);
         expect(res.body.ammount).toBe('100.00');
      });
})

test('Transacoes de saida devem ser negativas', () => {
   return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${user.token}`)
      .send({description: "New T", date: new Date(), ammount: 100, type: "O", acc_id: accUser.id})
      .then(res => {
         expect(res.status).toBe(201);
         expect(res.body.acc_id).toBe(accUser.id);
         expect(res.body.ammount).toBe('-100.00');
      });
})

describe('Ao tentar inserir uma transacao válida', () => {
   const testTemplate = (newData, errorMessage) => {
      return request(app).post(MAIN_ROUTE)
         .set('authorization', `bearer ${user.token}`)
         .send({description: "New T", date: new Date(), ammount: 100, type: "I", acc_id: accUser.id, ...newData})
         .then(res => {
            expect(res.status).toBe(400);
            expect(res.body.error).toBe(errorMessage);
         });
   }
   test('Nao deve inserir uma transação sem descricao', () => {
      testTemplate({description: null}, 'Descricao é um atributo obrigatório.');
   });
   
   test('Nao deve inserir uma transação sem valor', () => {
      testTemplate({ammount: null}, 'Valor é um atributo obrigatório.');
   })
   
   test('Nao deve inserir uma transação sem data', () => {
      testTemplate({date: null}, 'Data é um atributo obrigatório.');
   })
   
   test('Nao deve inserir uma transação sem conta', () => {
      testTemplate({acc_id: null}, 'Conta é um atributo obrigatório.');
   })
   
   test('Nao deve inserir uma transação sem tipo', () => {
      testTemplate({type: null}, 'Tipo é um atributo obrigatório.');
   })
})

test('Deve retornar uma transacao por ID', () => {
   return app.db('transactions').insert(
      {description: "T ID", date: new Date(), ammount: 100, type: "I", acc_id: accUser.id}, ['id']
   )
   .then(result => request(app).get(`${MAIN_ROUTE}/${result[0].id}`)
      .set('authorization', `bearer ${user.token}`)
      .then(res => {
         expect(res.status).toBe(200);
         expect(res.body.id).toBe(result[0].id);
         expect(res.body.description).toBe('T ID');
      }))
})

test('Deve alterar uma transacao', () => {
   return app.db('transactions')
      .insert({description: "T UP", date: new Date(), ammount: 100, type: "I", acc_id: accUser.id}, ['id']
   )
   .then(result => request(app).put(`${MAIN_ROUTE}/${result[0].id}`)
      .send({description: 'T UPDATED'})
      .set('authorization', `bearer ${user.token}`)
      .then(res => {
         expect(res.status).toBe(200);
         expect(res.body.description).toBe('T UPDATED');
      }));

})

test('Deve remover uma transacao', () => {
   return app.db('transactions')
      .insert({description: "T DEL", date: new Date(), ammount: 100, type: "I", acc_id: accUser.id}, ['id']
   )
   .then(result => request(app).delete(`${MAIN_ROUTE}/${result[0].id}`)
      .send({description: 'T UPDATED'})
      .set('authorization', `bearer ${user.token}`)
      .then(res => {
         expect(res.status).toBe(204);
   }));
})

test('Não remover uma transacao de outro usuário', () => {
   return app.db('transactions')
      .insert({description: "T DEL", date: new Date(), ammount: 100, type: "I", acc_id: accUser2.id}, ['id']
   )
   .then(result => request(app).delete(`${MAIN_ROUTE}/${result[0].id}`)
      .send({description: 'T UPDATED'})
      .set('authorization', `bearer ${user.token}`)
      .then(res => {
         expect(res.status).toBe(403);
         expect(res.body.error).toBe('Este recurso nao pertence ao usuario');
   }));

})

 test('Nao deve remover conta com transacao', () => {
   return app.db('transactions')
      .insert({description: "T DEL", date: new Date(), ammount: 100, type: "I", acc_id: accUser.id}, ['id']
   )
   .then(() => request(app).delete(`/v1/accounts/${accUser.id}`)
      .set('authorization', `bearer ${user.token}`)
      .then(res => {
         expect(res.status).toBe(400);
         expect(res.body.error).toBe('Essa conta possui transacoes associadas.');
   }));
})