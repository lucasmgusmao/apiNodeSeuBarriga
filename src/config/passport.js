const passport = require('passport');
const passportJWT = require('passport-jwt');
const secret = 'Segredo!';


const { Strategy, ExtractJwt} = passportJWT;

module.exports = (app) => {
   const params = {
      secretOrKey: secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
   }

   const strategy = new Strategy(params, (payload, done) => {
      app.services.user.findOne({id: payload.id})
      .then(result => {
         if (result){
            done(null, { ... payload});
         }
         else {
            done(null, false);
         }
      }).catch(err => done(err, false));
   })

   passport.use(strategy);

   return {
      authenticate : () => passport.authenticate('jwt', {session : false})
   }
}