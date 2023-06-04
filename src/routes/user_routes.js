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

// router.post('/signup', async (req, res) => {

//     const existing = await user.checkAvailability(req.body.email)
//     if (existing === 1) {
//         let errorMessage = 'Este email ya se encuentra registrado'
//         res.render('signup', { signupInfo: errorMessage });
//     } else {
//         const newUser = await user.newUser(req.body);
//         if (user.checkStatus === 1) {
//             res.status(200).render('signupConfirmed', { email: newUser })
//         } else {
//             res.status(400).send({ message: 'Error al crear usuario' })
//         }
//     }
// });


router.post('/signup', passport.authenticate('register',{failureRedirect: 'failregister'}), async (req, res) => {
    const email = req.user.email
    res.status(200).render('signupConfirmed', { email: email })
});

router.get('/failregister', async (req, res) => {
    let errorMessage = 'Este email ya se encuentra registrado'
    res.render('signup', { signupInfo: errorMessage });
});


export default router;