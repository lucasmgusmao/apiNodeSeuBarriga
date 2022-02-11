const express = require('express');
const RescursoIndevido = require('../errors/ResursoIndevidoError');

module.exports = (app) => {
   const router = express.Router();

   router.get('/', (req, res,) => {
      app.services.transfer.find({user_id: req.user.id})
      .then(result => res.status(200).json(result))
      .catch(e => next(e));
   })

   router.post('/', (req, res, next) => {
      const transf = {... req.body, user_id: req.user.id}
      app.services.transfer.save(transf)
         .then(result => {
            res.status(201).json(result[0]);
         })
         .catch(e => next(e));
   })

   return router;
}