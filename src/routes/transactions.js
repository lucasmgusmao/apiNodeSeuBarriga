const express = require('express');
const RescursoIndevido = require('../errors/ResursoIndevidoError');

module.exports = (app) => {
   const router = express.Router();

   router.param('id', (req, res, next) => {
      app.services.transaction.find(req.user.id, {'transactions.id': req.params.id})
      .then(result => {
         if (result.length > 0) next();
         else throw new RescursoIndevido('Este recurso nao pertence ao usuario');
      })
      .catch(e => next(e));
   })

   router.get('/', (req, res, next) => {
      app.services.transaction.find(req.user.id)
      .then(result => res.status(200).json(result))
      .catch(e => next(e));
   })

   router.post('/', (req, res, next) => {
      app.services.transaction.save(req.body)
         .then(result => res.status(201).json(result[0]))
         .catch(e => next(e));
   })

   router.get('/:id', (req, res, next) => {
      app.services.transaction.findById({id: req.params.id})
      .then(result => res.status(200).json(result))
      .catch(e => next(e));
   })

   router.put('/:id', (req, res, next) => {
      app.services.transaction.updateById({id: req.params.id}, req.body)
      .then(result => res.status(200).json(result[0]))
      .catch(e => {console.log(e); next(e)});
   })

   router.delete('/:id', (req, res, next) => {
      app.services.transaction.deleteById({id: req.params.id})
      .then(() => res.status(204).send())
      .catch(e => {console.log(e); next(e)});
   })

   return router;
}