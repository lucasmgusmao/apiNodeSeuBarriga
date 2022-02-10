const { mutateExecOptions } = require("nodemon/lib/config/load");
const app = require("../app");
const express = require('express');
const RescursoIndevido = require('../errors/ResursoIndevidoError');

module.exports = (app) =>{
   const router = express.Router();
   
   router.param('id', (req, res, next) => {
      app.services.account.findOne({id : req.params.id})
      .then((acc) => {
         if (acc.user_id !== req.user.id){
            throw new RescursoIndevido();
         }
         else next();
      }).catch(e => next(e));
   });

   router.post('/', (req, res, next) => {
      app.services.account.save({... req.body, user_id: req.user.id})
      .then(result => {return res.status(201).json(result[0])})
      .catch(e => next(e));
   });

   router.get('/', (req, res, next) => {
      app.services.account.findAll(req.user.id)
      .then(result => res.status(200).json(result))
      .catch(error => next(error));
   });
   
   router.get('/:id', (req, res, next) => {
      app.services.account.findOne({id : req.params.id})
      .then(result => {
         if (result.user_id !== req.user.id)
            return res.status(403).json({error: 'Este recurso nao pertence ao usuario'});
         return res.status(200).json(result);
      })
      .catch(error => next(error));
   });

   router.put('/:id', (req, res, next) => {
      app.services.account.updateOne(req.params.id, req.body)
      .then(result => {
         res.status(200).json(result[0]);
      })
      .catch(error => next(error));
   });

   router.delete('/:id', (req, res, next) => {
      app.services.account.deleteOne(req.params.id)
      .then(result =>{
         res.status(204).send();
      })
      .catch(error => next(error));
   });

   return router;
};