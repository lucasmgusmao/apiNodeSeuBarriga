const app = require('express')();
const consign = require('consign');
const knex = require('knex');
const knexFile = require('../knexfile');



// TODO criar chaveamento dinâmico
app.db = knex(knexFile.test);

consign({cwd: 'src', verbose: false})
   .include('./config/passport.js')
   .then('./config/middlewares.js')
   .then('./services')
   .then('./routes')
   .then('./config/router.js')
   .into(app);

app.get('/', (req, res) => {
   res.status(200).send();
})

app.use((err, req, res, next) => {
   const {name, message, stack } = err;
   if (name === 'ValidationError') {
      res.status(400).json({error: message});
   }else if (name === 'ResursoIndevidoError'){
      res.status(403).json({error: message})
   }else{
      res.status(500).json({name, message, stack})
   }
   next();
});


module.exports = app;