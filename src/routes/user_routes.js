import { Router } from "express";
import passport from 'passport';
import { generateHashedToken, calculateExpiryTime, sendResetPasswordEmail, createHash, isValidPassword } from "../utils.js";
import userModel from "../dao/models/users.model.js"

const router = Router();

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', passport.authenticate('register', { failureRedirect: 'failregister' }), async (req, res) => {
    const email = req.user.email
    res.status(200).render('signupConfirmed', { email: email })
});

router.get('/failregister', async (req, res) => {
    let errorMessage = 'Este email ya se encuentra registrado'
    res.render('signup', { signupInfo: errorMessage });
});

router.get('/resetPassword', (req, res) => {
    res.render('resetPassword');
});

router.post('/resetPassword', async (req, res) => {
    const email = req.body.email;
    // Generate reset token and set its expiry time
    try {
        const resetToken = await generateHashedToken(32);
        const expiryTime = calculateExpiryTime(60);
        // Save the token and expiry time in the user's record in the database
        const user = await userModel.findOne({ email: email });
        if (!user) {
            req.session.errorMessage = 'Usuario inexistente';
            req.logger.error(`wrong user - ${new Date().toLocaleTimeString()}`);
        } else {
            // Update the resetToken and resetTokenExpiration directly on the user object
            user.resetToken = resetToken;
            user.resetTokenExpiration = expiryTime;

            // Save the updated user object to the database
            await user.save();
        }

        // Send the reset email with the link including the reset token as a query parameter
        const encodedToken = encodeURIComponent(resetToken);
        const resetTokenURL = `http://localhost:3030/setPassword/${email}/${encodedToken}`;
        sendResetPasswordEmail(email, resetTokenURL);

        // Redirect to a success page or show a success message
        res.render('resetEmailSent');
    } catch (error) {
        req.logger.error(`cannot set token - ${new Date().toLocaleTimeString()}`);
        res.status(500).send('Error occurred');
    }
});


router.get('/setPassword/:email/:token', async (req, res) => {
    const email = req.params.email;
    const token = req.params.token;
    try {
        const user = await userModel.findOne({ email: email });
        if (!user) {
            req.session.errorMessage = 'Usuario inexistente';
            req.logger.error(`wrong user - ${new Date().toLocaleTimeString()}`);
        } else {
            if (user.resetToken == token && user.resetTokenExpiration > Date.now()) {
                res.render('setPassword', { email: email, token: token });
            } else {
                req.session.errorMessage = 'Token invalido';
                req.logger.error(`wrong token - ${new Date().toLocaleTimeString()}`);
                res.render('resetPassword');
            }
        }

    } catch (error) {
        req.logger.error(`cannot set new user password - ${new Date().toLocaleTimeString()}`);
        res.status(500).send('Error occurred');
    }
});

router.post('/setNewPassword', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const token = req.body.token
    const encodedToken = encodeURIComponent(token);


    const hashedPass = createHash(req.body.password);
    try {
        const user = await userModel.findOne({ email: email });
        if (!user) {
            req.session.errorMessage = 'Usuario inexistente';
            req.logger.error(`wrong user - ${new Date().toLocaleTimeString()}`);
        } else {
            if (!isValidPassword(user, password)) {
                user.password = hashedPass;
                await user.save();
                req.logger.info(`password changed - ${new Date().toLocaleTimeString()}`);
                res.render('setPasswordSuccess');
            } else {
                req.session.errorMessage = 'Estás intentando poner la misma contraseña que tenés actualmente.';
                req.logger.error(`same password - ${new Date().toLocaleTimeString()}`);
                res.render('setPassword', {
                    email: email,
                    encodedToken: encodedToken,
                    sessionInfo: { errorMessage: req.session.errorMessage }
                });
                req.session.errorMessage= null
            }
        }
    } catch (error) {
        req.logger.error(`cannot set new user password - ${new Date().toLocaleTimeString()}`);
        res.status(500).send('Error occurred');
    }
})

router.get('/api/users/premium/:uid', async (req, res) => {
    const uid = req.params.uid
    const user = await userModel.findOne({ _id: uid });
    res.render('selectRole', { user: user, id: uid });
})

router.post('/changeRole', async (req, res) => {
    const uid = req.body.uid
    const role = req.body.role
    const user = await userModel.findOne({ _id: uid });
    user.role = role
    await user.save()
    req.logger.info(`role modified - ${new Date().toLocaleTimeString()}`);
    res.status(200).send('Rol modificado');
})

export default router;