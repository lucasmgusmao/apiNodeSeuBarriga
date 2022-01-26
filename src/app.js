const app = require('express')();
const consign = require('consign');
const knex = require('knex');
const knexFile = require('../knexfile');
const knexLogger = require('knex-logger');


// TODO criar chaveamento dinâmico
app.db = knex(knexFile.test);

//app.use(knexLogger(app.db));

consign({cwd: 'src', verbose: false})
   .include('./config/middlewares.js')
   .then('./services')
   .then('./routes')
   .then('./config/routes.js')
   .into(app);

app.get('/', (req, res) => {
   res.status(200).send();
})

/* app.get('/users', (req, res) => {
   res.status(200).send({status: "OK"});
}) */
/* app.db.on('query', (query) => {
   console.log({
               sql: query.sql,
               bindings: query.bindings? query.bindings.join(', '): ""
            }
   )
}).on('query-response', (response) => {
   console.log(response);
}).on('error', (err) => {
   console.log(err);
}); */

module.exports = app;