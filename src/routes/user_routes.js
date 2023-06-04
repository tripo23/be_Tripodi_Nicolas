import { Router } from "express";
import ProductManager from '../dao/productManager.dbclass.js';
import UserManager from '../dao/userManager.dbclass.js';
import passport from 'passport';

const user = new UserManager();
const router = Router();

const baseURL = 'http://localhost:3030/'


router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', passport.authenticate('register',{failureRedirect: 'failregister'}), async (req, res) => {
    const email = req.user.email
    res.status(200).render('signupConfirmed', { email: email })
});

router.get('/failregister', async (req, res) => {
    let errorMessage = 'Este email ya se encuentra registrado'
    res.render('signup', { signupInfo: errorMessage });
});


export default router;