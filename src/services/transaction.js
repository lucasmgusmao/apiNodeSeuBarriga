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
      return app.db('transactions')
         .insert(trans, '*');
   }

   const updateById = (filter, trans) => {
      return app.db('transactions')
      .where(filter)
      .update(trans, '*');
   }

   // Abaixo os métodos são exportados para as rotas.
   return {find, save, findById, updateById};
}