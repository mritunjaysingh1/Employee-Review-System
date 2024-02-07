const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");

// Authentication using passport
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true,
    },
    function (req, email, password, done) {
      User.findOne({ email: email }, async function (err, user) {
        if (err) {
          req.flash("error", err);
          return done(err);
        }

        if (!user) {
          req.flash("error", "Invalid username or password");
          return done(null, false);
        }

        const isPasswordCorrect = await user.isValidatedPassword(password);

        if (!isPasswordCorrect) {
          req.flash("error", "Invalid username or password");
          return done(null, false);
        }

        return done(null, user);
      });
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    if (err) {
      console.log("Error in finding user - Passport");
      return done(err);
    }

    return done(null, user);
  });
});

// Check if user authenticated (middleware)
passport.checkAuthentication = function (req, res, next) {
  console.log("inside check authentication: ", req);
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect("/");
};

passport.setAuthenticatedUser = function (req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
  }
  next();
};

module.exports = passport;
