import { Router } from "express";
import passport from 'passport';
import userModel from "../dao/models/users.model.js";
import config from "../config/config.js";


const router = Router();

const baseURL = `${config.serverURL}/`;
//const baseURL = `${config.serverURL}:${config.port}`;

router.post('/signup', passport.authenticate('register', { failureRedirect: 'failregister' }), async (req, res) => {
    const email = req.user.email
    res.status(200).render('signupConfirmed', { email: email })
});

router.get('/login', (req, res) => {
    if (req.session.errorMessage !== '') {
        res.render('login', { sessionInfo: { errorMessage: req.session.errorMessage } });
    } else {
        res.render('login');
    }
})

router.post('/login', passport.authenticate('login', { failureRedirect: 'login' }), async (req, res) => {
    if (!req.user) {
        req.session.userValidated = false;
        req.session.errorMessage = 'Tu usuario o contraseña son incorrectos.';
        res.render('login', { sessionInfo: { errorMessage: req.session.errorMessage } });
    } else {
        req.session.userValidated = true;
        req.session.errorMessage = '';
        req.session.user = req.user.email;
        req.session.role = req.user.role;
        req.session.cart = req.user.cart
        //Agrego el timestamp
        const user = await userModel.findOne({ email: req.session.user });
        user.last_connection = new Date();
        try {
            await user.save(); // Save the changes to the document
            console.log('User last connection updated successfully.');
        } catch (error) {
            console.error('Error updating user last connection:', error);
        }
        if (req.user.email === 'admincoder@coder.com') { // si es la cuenta de la consigna, harcodeo el rol admin.
            req.session.role = 'admin';
        }
        if (req.session.role == 'admin') {
            res.redirect(baseURL + 'api/productmanager');
        } else {
            res.redirect(baseURL + 'products');
        }
    }
});


router.get('/sessions/github', passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => {
});

router.get('/api/sessions/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), async (req, res) => {

    console.log('Github callback');
    req.session.user = req.user.email;
    req.session.role = req.user.role;
    req.session.cart = req.user.cart;
    res.redirect(baseURL + 'products');
});


export default router;