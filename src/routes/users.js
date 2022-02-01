const express = require('express');

module.exports = (app) =>{
   const router = express.Router();
   
   router.get('/', (req, res, next) => {      
      app.services.user.findAll()
         .then(result => {
            res.status(200).json(result);
         })
         .catch(e => next(e));
   }); 

   router.post('/', async (req, res, next) => {
      try {
         const result = await app.services.user.save(req.body);     
         res.status(201).json(result[0]);
      }catch(e){   
         return next(e);         
      }
   });
   return router;
};