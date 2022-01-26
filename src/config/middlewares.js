module.exports = (app) => {
   const bodyParser = require('body-parser');
   app.use(bodyParser.json());
};