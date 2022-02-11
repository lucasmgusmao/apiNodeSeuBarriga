const { db } = require("../app");
const ValidationError = require("../errors/ValidationError");

module.exports = (app) => {
   beforeAll(() => {
      return app.db.seed.run();
   });

   const find = (filter = {}) => {
      return app.db('transfers')
      .where(filter)
      .select();
   }

   const findOne = (filter) => {
      return app.db('transfers')
         .where(filter)
         .first();
   }

   const validate = async (transf) => {
      if (!transf.description){
         throw new ValidationError('Descricao é um atributo obrigatório.');
      }

      if (!transf.ammount){
         throw new ValidationError('Valor é um atributo obrigatório.');
      }

      if (!transf.date){
         throw new ValidationError('Data é um atributo obrigatório.');
      }

      if (!transf.acc_ori_id){
         throw new ValidationError('Conta de origem é um atributo obrigatório.');
      }

      if (!transf.acc_dest_id){
         throw new ValidationError('Conta de destino é um atributo obrigatório.');
      }
      
      
      if (transf.acc_dest_id === transf.acc_ori_id){
         throw new ValidationError('Contas devem ser diferentes');
      }
      
      const accounts = await app.db('accounts').whereIn('id', [transf.acc_dest_id, transf.acc_ori_id]);
      accounts.forEach(acc => {
         if (acc.user_id !== parseInt(transf.user_id, 10))
            throw new ValidationError('Conta deve ser do mesmo usuario.');
      })
   }

   const save = async (transf) => {
      const transfer = await app.db('transfers').insert(transf, '*');
      const transferId = transfer[0].id;
      const transactions = [
         {description: `Transfer to acc #${transf.acc_dest_id}`, date: transf.date,  ammount: transf.ammount * -1, type: 'O', acc_id: transf.acc_ori_id, transfer_id: transferId},
         {description: `Transfer from acc #${transf.acc_ori_id}`, date: transf.date,  ammount: transf.ammount, type: 'I', acc_id: transf.acc_dest_id, transfer_id: transferId}
      ];
      await app.db('transactions').insert(transactions);
      return transfer;      
   }
   
   const update = async (id, transf) => {
      const result = await app.db('transfers')
      .where({id})
      .update(transf, '*');
      const transactions = [
         {description: `Transfer to acc #${transf.acc_dest_id}`, date: transf.date,  ammount: transf.ammount * -1, type: 'O', acc_id: transf.acc_ori_id, transfer_id: id},
         {description: `Transfer from acc #${transf.acc_ori_id}`, date: transf.date,  ammount: transf.ammount, type: 'I', acc_id: transf.acc_dest_id, transfer_id: id}
      ];
      await app.db('transactions').where({transfer_id: id}).del();
      await app.db('transactions').insert(transactions);
      return result;      
   }

   const remove = async (id) => {
      await app.db('transactions')
      .where({transfer_id: id})
         .del();
      return app.db('transfers')
         .where({id})
         .del();
   }
   return {find, save, findOne, update, validate, remove}
}