const { mutateExecOptions } = require("nodemon/lib/config/load");
const app = require("../app");

module.exports = (app) =>{
   const findAll = (req, res, next) => {
      app.services.account.findAll()
      .then(result => res.status(200).json(result))
      .catch(error => next(error));
   }

   const create = (req, res, next) => {
      app.services.account.save(req.body)
      .then(result => {return res.status(201).json(result[0])})
      .catch(e => next(e));
   }

   const findOne = (req, res, next) => {
      app.services.account.findOne({id : req.params.id})
      .then(result => {
         res.status(200).json(result);
      })
      .catch(error => next(error));
   }

   const updateOne = (req, res, next) => {
      app.services.account.updateOne(req.params.id, req.body)
      .then(result => {
         res.status(200).json(result[0]);
      })
      .catch(error => next(error));
   }

   const deleteOne = (req, res) => {
      app.services.account.deleteOne(req.params.id)
      .then(result =>{
         res.status(204).send();
      })
      .catch(error => next(error));
   }

   return {findAll, create, findOne, updateOne, deleteOne};
};