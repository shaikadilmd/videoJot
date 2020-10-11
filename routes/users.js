const express = require('express');
const router = express.Router();
const userSchema = require('../models/User');
const bcryptjs = require('bcryptjs');
const passport = require('passport');

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/ideas',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);

});

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', (req, res) => {
    let errors = [];
    if (req.body.password != req.body.confirmpassword)
        errors.push({ text: 'password and confirm passwords do not match' });
    if (req.body.password.length < 4)
        errors.push({ text: 'password and must be at leat 4 characters' });
    if (errors.length > 0) {
        res.render('users/register', {
            errors: errors,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            confirmpassword: req.body.confirmpassword
        });
    } else {
        userSchema.findOne({ email: req.body.email })
            .then(user => {
                if (user) {
                    req.flash('error_msg', 'email already registered');
                    res.redirect('/users/register');
                } else {
                    const newUser = new userSchema({
                        name: req.body.name,
                        email: req.body.email,
                        password: req.body.password
                    });
                    bcryptjs.genSalt(10, (err, salt) => {
                        bcryptjs.hash(newUser.password, salt, (error, hash) => {
                            if (error) throw error;
                            newUser.password = hash
                            newUser.save()
                                .then(usr => {
                                    req.flash('success_msg', 'you are registered and can login now');
                                    res.redirect('/users/login')
                                });
                        });

                    });
                }
            });
    }

});
// Logout User
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;