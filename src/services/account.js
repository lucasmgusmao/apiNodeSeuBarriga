const ValidationError = require('../errors/ValidationError');

module.exports = (app) => {
   const findAll = (user_id) => {
      return app.db('accounts').where({user_id});
   }

   const save = async (account) => {
      if (!account.name) throw new ValidationError('Nome é um atributo obrigatório');      
      const conta = await findOne({name: account.name, user_id: account.user_id});
      if (conta) throw new ValidationError('Já existe uma conta com esse nome');
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