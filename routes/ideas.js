const express = require('express');
const router = express.Router();
const ideaSchema = require('../models/Idea');
const { ensureAuthenticated } = require('../helper/auth');

router.get('/', ensureAuthenticated, (req, res) => {
    ideaSchema.find({ user: req.user.id })
        .sort({ date: 'desc' })
        .lean()
        .then(ideas => {
            res.render('ideas/index', {
                ideas: ideas
            });
        });
});

router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('ideas/add');
})

router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    ideaSchema.findById(req.params.id)
        .lean()
        .then(idea => {
            if (idea.user != req.user.id) {
                req.flash('error_msg', 'Not Authorized');
                res.redirect('/ideas');
            } else {
                res.render('ideas/edit', {
                    idea: idea
                });
            }

        });
});
router.put('/:id', ensureAuthenticated, (req, res) => {
    ideaSchema.findById(req.params.id)
        .then(idea => {
            idea.title = req.body.title;
            idea.details = req.body.details;
            idea.save()
                .then(() => {
                    req.flash('success_msg', 'Video idea updated');
                    res.redirect('/ideas');
                })
        });
});
router.delete('/:id', ensureAuthenticated, (req, res) => {
    ideaSchema.findByIdAndDelete(req.params.id)
        .then(idea => {
            req.flash('success_msg', 'Video idea removed');
            res.redirect('/ideas');
        });
});
router.post('/', ensureAuthenticated, (req, res) => {
    let errors = [];
    if (!req.body.title)
        errors.push({ text: 'Please add title' });
    if (!req.body.details)
        errors.push({ text: 'Please add details' });
    if (errors.length > 0) {
        res.render('ideas/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        })
    }
    else {
        const user = {
            title: req.body.title,
            details: req.body.details,
            user: req.user.id
        }
        new ideaSchema(user)
            .save
            ().then(idea => {
                req.flash('success_msg', 'Video idea added');
                res.redirect('/ideas');
            })
    }
});


module.exports = router;