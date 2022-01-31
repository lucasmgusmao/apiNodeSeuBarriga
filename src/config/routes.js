const app = require("../app");

module.exports = (app) => {
   app.route('/users')
      .all(app.config.passport.authenticate())
      .get(app.routes.users.findAll)
      .post(app.routes.users.create);
   
   app.route('/accounts')
      .all(app.config.passport.authenticate())
      .get(app.routes.account.findAll)
      .post(app.routes.account.create);
   
   app.route('/accounts/:id')
      .all(app.config.passport.authenticate())
      .get(app.routes.account.findOne)
      .put(app.routes.account.updateOne)
      .delete(app.routes.account.deleteOne);

   app.route('/auth/signin')
      .post(app.routes.auth.signin);

   app.route('/auth/signup')
      .post(app.routes.users.create);
};