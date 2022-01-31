const res = require("express/lib/response");
const ValidationError = require('../errors/ValidationError');
const bCrypt = require('bcrypt-nodejs');

module.exports = (app) => {
   const findAll = () => {      
      return app.db('users').select(['id', 'name', 'email']);
   }

   const findOne = (filter = {}) => {    
      return app.db('users').where(filter).first();
   }

   const getSenhaHash = (senha) => {
      const salt = bCrypt.genSaltSync(10);
      return bCrypt.hashSync(senha, salt);
   }

   const save = async (user) => {
      if (!user.name) throw new ValidationError("Nome é um atributo obrigatório.");
      if (!user.email) throw new ValidationError("Email é um atributo obrigatório.");
      if (!user.senha) throw new ValidationError("Senha é um atributo obrigatório.");
      const userDb = await findOne({email : user.email});
      if (userDb && userDb.length > 0){
         return {error: "Já existe um usuário com esse email."};
      }
      const newUser = { ... user};
      newUser.senha = getSenhaHash(newUser.senha);
      return app.db('users').insert(newUser, ['id', 'name', 'email']);
   }

   return {findAll, save, findOne};
   
}