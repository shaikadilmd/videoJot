const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const userSchema = require('../models/User');


module.exports = (passport) => {
    passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
        userSchema.findOne({ email: email })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: 'No user found' });
                }
                bcryptjs.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'password incorrect' });
                    }

                })
            })
    }));
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        userSchema.findById(id, function (err, user) {
            done(err, user);
        });
    });
}