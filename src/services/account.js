module.exports = (app) => {
   const findAll = () => {
      return app.db('accounts');
   }

   const save = (account) => {
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
   return {findAll, save, findOne, updateOne};
}