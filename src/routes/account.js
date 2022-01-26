module.exports = (app) =>{
   const findAll = (req, res) => {
      app.services.account.findAll()
      .then(result => res.status(200).json(result));
   }

   const create = (req, res) => {
      app.services.account.save(req.body)
         .then((result) => {
            return res.status(201).json(result[0])
         });
   }

   const findOne = (req, res) => {
      app.services.account.findOne({id : req.params.id})
      .then(result => {
         res.status(200).json(result);
      })
      .catch(error => console.log(error));
   }

   const updateOne = (req, res) => {
      app.services.account.updateOne(req.params.id, req.body)
      .then(result => {
         res.status(200).json(result[0]);
      });
   }

   return {findAll, create, findOne, updateOne};
};