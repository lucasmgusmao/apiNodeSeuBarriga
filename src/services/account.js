const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
   const findAll = () => {
      return app.db('accounts');
   }

   const save = async (account) => {
      if (!account.name) throw new ValidationError('Nome é um atributo obrigatório');
      return app.db('accounts').insert(account, '*');
   }

   const findOne = (filter = {}) => {
      return app.db('accounts').where(filter).first();
   }

   const updateOne = (id, account) => {
      return app.db('accounts')
      .where({id})
      .update(account, '*');
   }

   const deleteOne = (id) => {
      return app.db('accounts')
      .where({id})
      .delete();
   }

   return {findAll, save, findOne, updateOne, deleteOne};
}