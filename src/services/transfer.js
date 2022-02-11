module.exports = (app) => {
   beforeAll(() => {
      return app.db.seed.run();
   });

   const find = (filter = {}) => {
      return app.db('transfers')
      .where(filter)
      .select();
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
   return {find, save}
}