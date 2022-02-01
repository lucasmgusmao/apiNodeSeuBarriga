const { mutateExecOptions } = require("nodemon/lib/config/load");
const app = require("../app");
const express = require('express');

module.exports = (app) =>{
   const router = express.Router();
   
   router.post('/', (req, res, next) => {
      app.services.account.save(req.body)
      .then(result => {return res.status(201).json(result[0])})
      .catch(e => next(e));
   });

   router.get('/', (req, res, next) => {
      app.services.account.findAll()
      .then(result => res.status(200).json(result))
      .catch(error => next(error));
   });
   
   router.get('/:id', (req, res, next) => {
      app.services.account.findOne({id : req.params.id})
      .then(result => {
         res.status(200).json(result);
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

   router.delete('/:id', (req, res) => {
      app.services.account.deleteOne(req.params.id)
      .then(result =>{
         res.status(204).send();
      })
      .catch(error => next(error));
   });

   return router;
};