const jwt = require('jwt-simple');
const bCrypt = require('bcrypt-nodejs');
const secret = 'Segredo!';
const ValidationError = require('../errors/ValidationError');
const express = require('express');

module.exports = (app) => {
   const router = express.Router();
   router.post('/signin',  (req, res, next) => {
      app.services.user.findOne({email: req.body.email})
      .then((user) => {
         if (!user){
            throw new ValidationError('Usuario ou senha invalidos');
         }
         if (bCrypt.compareSync(req.body.senha, user.senha)){
            const payload = {
               id: user.id,
               nome: user.name,
               mail: user.email
            }
            const token = jwt.encode(payload, secret);
            res.status(200).json({token});
         } else{
            throw new ValidationError('Usuario ou senha invalidos');
         }
      }).catch(e =>  next(e));
   });

   router.post('/signup',  async (req, res, next) => {
      try {
         const result = await app.services.user.save(req.body);     
         res.status(201).json(result[0]);
      }catch(e){   
         return next(e);         
      }
   });

   return router;
}