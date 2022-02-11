const request = require('supertest');
const app = require('../../src/app');
const MAIN_ROUTE = '/v1/transfers';

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAsIm5hbWUiOiJVc2VyICMxIiwiZW1haWwiOiJ1c2VyMUBtYWlsLmNvbSJ9.4FZv8ptQjvtBnO0DfLuZhaYnDgjSx6Uab2mrVfCyYm4';

beforeAll(async () => {
/*    await app.db.migrate.rollback();
   await app.db.migrate.latest(); */
   await app.db.seed.run();
})

test('Deve listar apenas as transferencias do usuario', () => {
   return request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .then(res => {
         expect(res.status).toBe(200);
         expect(res.body).toHaveLength(1);
         expect(res.body[0].description).toBe('Transfer #1');
      });
})

test('Deve inserir uma transferencia com sucesso.', () => {
   return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({description: 'Regular Transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date()})
      .then(async res => {
         expect(res.status).toBe(201);
         expect(res.body.description).toBe('Regular Transfer');
         const transactions = await app.db('transactions').where({transfer_id: res.body.id});
         expect(transactions).toHaveLength(2);
         expect(transactions[0].description).toBe('Transfer to acc #10001');
         expect(transactions[1].description).toBe('Transfer from acc #10000');
         expect(transactions[0].ammount).toBe('-100.00');
         expect(transactions[1].ammount).toBe('100.00');
         expect(transactions[0].acc_id).toBe(10000);
         expect(transactions[1].acc_id).toBe(10001);         
      });
})

describe('Ao salvar uma transferencia valida...', () => {
   let transferId;
   let income;
   let outcome;

   test('Deve retornar o status 201 e os dados da transferencia', () => {
      return request(app).post(MAIN_ROUTE)
         .set('authorization', `bearer ${TOKEN}`)
         .send({description: 'Regular Transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date()})
         .then(async (res) => {
            expect(res.status).toBe(201);
            expect(res.body.description).toBe('Regular Transfer');
            transferId = res.body.id;
         });
   });

   test('As transacoes equivalentes devem ter sido geradas', async () => {
      const transactions = await app.db('transactions').where({transfer_id: transferId}).orderBy('ammount');
      expect(transactions).toHaveLength(2);
      [outcome, income] = transactions;
   });

   test('A transacao de saida deve ser negativa', () => {
      expect(outcome.description).toBe('Transfer to acc #10001');
      expect(outcome.ammount).toBe('-100.00');
      expect(outcome.acc_id).toBe(10000); 
   });

   test('A transacao de entrada deve ser positiva', () => {
      expect(income.description).toBe('Transfer from acc #10000');
      expect(income.ammount).toBe('100.00');      
      expect(income.acc_id).toBe(10001);
   });

   test('Ambas devem referenciar a transaferencia que as originou', () => {
      expect(income.transfer_id).toBe(transferId);
      expect(outcome.transfer_id).toBe(transferId);      
   })
})

describe('Ao tentar salvar uma transferencia invalida', () => {
   let tran1;
   let tran2;
   const testTemplate = async (newData, errorMessage) => {
      const validTransfer = {description: 'Regular Transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date()};
      return request(app).post(MAIN_ROUTE)
         .set('authorization', `bearer ${TOKEN}`)
         .send({... validTransfer, ... newData})
         .then(async (res) => {
            expect(res.status).toBe(400);
            expect(res.body.error).toBe(errorMessage);
         });
   }
   // 
   test('Não deve inserir sem descricao', () => testTemplate({description: null}, 'Descricao é um atributo obrigatório.'));

   test('Não deve inserir sem valor', () => testTemplate({ammount: null}, 'Valor é um atributo obrigatório.'));

   test('Não deve inserir sem data', () => testTemplate({date: null}, 'Data é um atributo obrigatório.'));

   test('Não deve inserir sem conta de origem', () => testTemplate({acc_ori_id: null}, 'Conta de origem é um atributo obrigatório.'));

   test('Não deve inserir sem conta de destino', () => testTemplate({acc_dest_id: null}, 'Conta de destino é um atributo obrigatório.'));

   test('Não deve inserir se as contas de destino e origem forem as mesmas', () => testTemplate({acc_dest_id: 10000}, 'Contas devem ser diferentes'));

   test('Se as contas pertencerem a outro usuario', () => testTemplate({acc_ori_id: 10002}, 'Conta deve ser do mesmo usuario.'));
})

test('Deve retornar uma transferencia pro ID', () => {
   return request(app).get(`${MAIN_ROUTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .then(res => {
         expect(res.status).toBe(201);
         expect(res.body.description).toBe('Transfer #1');
      });
})


describe('Ao alterar uma transferencia valida...', () => {
   let transferId;
   let income;
   let outcome;

   test('Deve retornar o status 200 e os dados da transferencia', () => {
      return request(app).put(`${MAIN_ROUTE}/10000`)
         .set('authorization', `bearer ${TOKEN}`)
         .send({description: 'Transfer updated', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 500, date: new Date()})
         .then(async (res) => {
            console.log(res.body);
            expect(res.status).toBe(200);
            expect(res.body.description).toBe('Transfer updated');
            expect(res.body.ammount).toBe('500.00');
            transferId = res.body.id;
         });
   });

   test('As transacoes equivalentes devem ter sido geradas', async () => {
      const transactions = await app.db('transactions').where({transfer_id: transferId}).orderBy('ammount');
      expect(transactions).toHaveLength(2);
      [outcome, income] = transactions;
   });

   test('A transacao de saida deve ser negativa', () => {
      expect(outcome.description).toBe('Transfer to acc #10001');
      expect(outcome.ammount).toBe('-500.00');
      expect(outcome.acc_id).toBe(10000); 
   });

   test('A transacao de entrada deve ser positiva', () => {
      expect(income.description).toBe('Transfer from acc #10000');
      expect(income.ammount).toBe('500.00');      
      expect(income.acc_id).toBe(10001);
   });

   test('Ambas devem referenciar a transaferencia que as originou', () => {
      expect(income.transfer_id).toBe(transferId);
      expect(outcome.transfer_id).toBe(transferId);      
   })
})

describe('Ao tentar alterar uma transferencia invalida', () => {
   let tran1;
   let tran2;
   const testTemplate = async (newData, errorMessage) => {
      const validTransfer = {description: 'Regular Transfer', user_id: 10000, acc_ori_id: 10000, acc_dest_id: 10001, ammount: 100, date: new Date()};
      return request(app).put(`${MAIN_ROUTE}/10000`)
         .set('authorization', `bearer ${TOKEN}`)
         .send({... validTransfer, ... newData})
         .then(async (res) => {
            expect(res.status).toBe(400);
            expect(res.body.error).toBe(errorMessage);
         });
   }
   // 
   test('Não deve inserir sem descricao', () => testTemplate({description: null}, 'Descricao é um atributo obrigatório.'));

   test('Não deve inserir sem valor', () => testTemplate({ammount: null}, 'Valor é um atributo obrigatório.'));

   test('Não deve inserir sem data', () => testTemplate({date: null}, 'Data é um atributo obrigatório.'));

   test('Não deve inserir sem conta de origem', () => testTemplate({acc_ori_id: null}, 'Conta de origem é um atributo obrigatório.'));

   test('Não deve inserir sem conta de destino', () => testTemplate({acc_dest_id: null}, 'Conta de destino é um atributo obrigatório.'));

   test('Não deve inserir se as contas de destino e origem forem as mesmas', () => testTemplate({acc_dest_id: 10000}, 'Contas devem ser diferentes'));

   test('Se as contas pertencerem a outro usuario', () => testTemplate({acc_ori_id: 10002}, 'Conta deve ser do mesmo usuario.'));
})

describe('Ao remover uma transferencia', () => {
   test('Deve retornar o status 204', () => {
      return request(app).delete(`${MAIN_ROUTE}/10000`)
         .set('authorization', `bearer ${TOKEN}`)
         .then(res => {
            expect(res.status).toBe(204);
         });   
   });

   test('O registro deve ser apagado do banco', () => {
      return app.db('transfers')
         .where({id: 10000})
         .then(result => {
            expect(result).toHaveLength(0);
         })
   });

   test('As transacoes associadas devem ser removidas', () => {
      return app.db('transactions')
         .where({transfer_id: 10000})
         .then(result => {
            expect(result).toHaveLength(0);
         })       
   });
})

test('Nao deve retornar transferencia de outro usuario', () => {
   return request(app).get(`${MAIN_ROUTE}/10001`)
      .set('authorization', `bearer ${TOKEN}`)
      .then(res => {
         expect(res.status).toBe(403);
         expect(res.body.error).toBe('Este recurso nao pertence ao usuario');
      });
})