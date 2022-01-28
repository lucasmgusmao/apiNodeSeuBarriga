const app = require("../app");

module.exports = (app) => {
   app.route('/users')
      .get(app.routes.users.findAll)
      .post(app.routes.users.create);
   
   app.route('/accounts')
      .get(app.routes.account.findAll)
      .post(app.routes.account.create);
   
   app.route('/accounts/:id')
      .get(app.routes.account.findOne)
      .put(app.routes.account.updateOne)
      .delete(app.routes.account.deleteOne);
};