const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
   const find = (userId, filter = {}) => {
      return app.db('transactions')
      .join('accounts', 'accounts.id', 'acc_id')
      .where(filter)
      .andWhere('accounts.user_id', '=', userId)
      .select();
   }
   
   const findById = (filter) => {
      return app.db('transactions')
      .where(filter)
      .first();
   }

   const save = (trans) => {
      if (!trans.description){         
         throw new ValidationError('Descricao é um atributo obrigatório.');
      }

      if (!trans.ammount){
         throw new ValidationError('Valor é um atributo obrigatório.');
      }

      if (!trans.date){
         throw new ValidationError('Data é um atributo obrigatório.');
      }

      if (!trans.acc_id){
         throw new ValidationError('Conta é um atributo obrigatório.');
      }

      if (!trans.type){
         throw new ValidationError('Tipo é um atributo obrigatório.');
      }

      const newTrans = { ... trans}
      if ((trans.type === 'I' && trans.ammount < 0)
         ||
         (trans.type === 'O' && trans.ammount > 0)){
         newTrans.ammount *= -1;
      }
      return app.db('transactions')
         .insert(newTrans,  '*');
   }

   const updateById = (filter, trans) => {
      return app.db('transactions')
      .where(filter)
      .update(trans, '*');
   }

   const deleteById = (filter) => {
      return app.db('transactions')
      .where(filter)
      .delete();
   }

   // Abaixo os métodos são exportados para as rotas.
   return {find, save, findById, updateById, deleteById};
}