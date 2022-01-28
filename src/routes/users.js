module.exports = (app) =>{
   const findAll = (req, res, next) => {      
      app.services.user.findAll()
         .then(result => {
            res.status(200).json(result);
         })
         .catch(e => next(e));
      };   
   
   const create = async (req, res, next) => {
      try {
         const result = await app.services.user.save(req.body);     
         res.status(201).json(result[0]);
      }catch(e){   
         return next(e);         
      }
   }

   return {
      findAll, create
   };
};