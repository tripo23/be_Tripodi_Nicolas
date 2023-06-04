import { Router } from "express";
import passport from 'passport';


const router = Router();

const baseURL = 'http://localhost:3030/'


router.get('/login', (req,res) => {
    if (req.session.errorMessage !== '') {
        res.render('login', { sessionInfo: { errorMessage: req.session.errorMessage } }); 
    } else {
        res.render('login');
    }
    
})

router.post('/login', passport.authenticate('login', { failureRedirect: 'login' }), async (req, res) => {
    console.log(req.user);
    if (!req.user) {
        req.session.userValidated = false;
        req.session.errorMessage = 'Tu usuario o contraseña son incorrectos.';
        res.render('login', { sessionInfo: { errorMessage: req.session.errorMessage } });
    } else {
        req.session.userValidated = true;
        req.session.errorMessage = '';
        req.session.user = req.user.email;
        req.session.role = req.user.role;
        if (req.user.email === 'adminCoder@coder.com') { // si es la cuenta de la consigna, harcodeo el rol admin.
            req.session.role = 'admin';
        }      
        res.redirect(baseURL+'products');

    }
});

router.get('/faillogin', (req,res) => {
    req.session.errorMessage = 'Tu usuario o contraseña son incorrectos.';
    res.render('login', { sessionInfo: { errorMessage: req.session.errorMessage } });
})


router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (!err) res.redirect(baseURL);
        else res.send({ status: 'Error al hacer logout', body: err })
    });
});

router.get('/sessions/github', passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => {
});

router.get('/api/sessions/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), async (req, res) => {
    
    // req.session.userValidated = true;
    // req.session.errorMessage = '';
    req.session.user = req.user.email;
    req.session.role = req.user.role;
    res.redirect(baseURL+'products');
});

export default router;