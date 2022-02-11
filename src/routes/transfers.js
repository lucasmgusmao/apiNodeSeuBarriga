const express = require('express');
const RescursoIndevido = require('../errors/ResursoIndevidoError');

module.exports = (app) => {
   const router = express.Router();

   router.param('id', (req, res, next) => {
      app.services.transfer.findOne({id: req.params.id})
      .then(result => {
         if (req.user.id !== result.user_id){
            throw new RescursoIndevido();
         }
         next();
      })
      .catch(e => next(e));
   });

   const validate = (req, res, next) => {
      app.services.transfer.validate({... req.body, user_id: req.user.id})
      .then(() => next())
      .catch(e => next(e));
   }

   router.get('/', (req, res, next) => {
      app.services.transfer.find({user_id: req.user.id})
      .then(result => res.status(200).json(result))
      .catch(e => next(e));
   })

   router.get('/:id', (req, res, next) => {
      app.services.transfer.findOne({id: req.params.id})
      .then(result => res.status(201).json(result))
      .catch(e => next(e));
   })

   router.post('/', validate, (req, res, next) => {
      const transf = {... req.body, user_id: req.user.id}
      app.services.transfer.save(transf)
         .then(result => {
            res.status(201).json(result[0]);
         })
         .catch(e => next(e));
   })

   router.put('/:id', validate, (req, res, next) => {
      app.services.transfer.update(req.params.id, {... req.body, user_id: req.user.id})
         .then(result => {
            res.status(200).json(result[0]);
         })
         .catch(e => next(e));
   })

   router.delete('/:id', (req, res, next) => {
      app.services.transfer.remove(req.params.id)
      .then( () => res.status(204).send())
      .catch(e => next(e));
   })

   return router;
}