import { generateHashedToken, calculateExpiryTime, sendResetPasswordEmail, createHash, isValidPassword, sendDeletionAlertEmail } from '../../utils.js';
import userModel from "../models/users.model.js";

const baseURL = 'http://localhost:3030/'

export const resetPassword = async (req, res) => {
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
}

export const getUsers = async (req, res) => {
    try {
        const users = await userModel.find().select('firstName lastName email role');
        res.status(200).send(users);
    } catch (error) {
        req.logger.error(`cannot get users - ${new Date().toLocaleTimeString()}`);
        res.status(500).send('Error occurred');

    }

}

export const deleteInactives = async (req, res) => {
    const users = await userModel.find();
    for (const user of users) {
        const now = new Date();
        const lastConnection = new Date(user.last_connection);
        const resta = (now - lastConnection) / (1000 * 60 * 60);

        if (resta > 48 || isNaN(resta)) {
            console.log(user.email, resta, 'usuario inactivo');
            await userModel.deleteOne({ _id: user._id });
            sendDeletionAlertEmail(user.email);
        }
    }
    res.status(200).send('Usuarios eliminados');
}

export const setPassword = async (req, res) => {
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
}

export const setNewPassword = async (req, res) => {
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
                req.session.errorMessage = null
            }
        }
    } catch (error) {
        req.logger.error(`cannot set new user password - ${new Date().toLocaleTimeString()}`);
        res.status(500).send('Error occurred');
    }
}

export const selectRole = async (req, res) => {
    const uid = req.params.uid
    const user = await userModel.findOne({ _id: uid });
    if (user.doc_account && user.doc_address && user.doc_id) {
        res.render('selectRole', { user: user, id: uid });
    } else {
        res.status(401).send('Usuario no autorizado por documentación incompleta, o en proceso de subida');
    }
}

export const changeRole = async (req, res) => {
    const uid = req.body.uid
    const role = req.body.role
    const user = await userModel.findOne({ _id: uid });
    user.role = role
    await user.save()
    req.logger.info(`role modified - ${new Date().toLocaleTimeString()}`);
    res.status(200).send('Rol modificado');
}
export const logout = async (req, res) => {
    const user = await userModel.findOne({ email: req.session.user });
    user.last_connection = new Date();
    try {
        await user.save(); // Save the changes to the document
        console.log('User last connection updated successfully.');
    } catch (error) {
        console.error('Error updating user last connection:', error);
    }
    req.session.destroy(err => {
        if (!err) res.redirect(baseURL);
        else res.send({ status: 'Error al hacer logout', body: err })
    });
}

export const current = async (req, res) => {
    res.send(req.session.user);
}

export const userInfo = async (email) => {
    const user = await userModel.findOne({ email: email });
    return user;
}

export const uploadFile = async (req, res) => {

    const user = await userModel.findOne({ email: req.session.email });
    // const emailFake = req.body.emailFake
    // const user = await userModel.findOne({ email: emailFake });
    if (!user) {
        res.status(401).send('Invalid user');
        return;
    } else {
        // harcodeo la validación del tipo de documento, según el nombre del archivo 🤷🏻‍♂️
        const { originalname } = req.file;

        switch (true) {
            case /id/i.test(originalname):
                // Handle scenario for 'id' in the filename
                console.log('Processing ID file');
                user.doc_id = req.file.path;
                break;

            case /domicilio/i.test(originalname):
                // Handle scenario for 'domicilio' in the filename
                console.log('Processing Domicilio file');
                user.doc_address = req.file.path;
                break;

            case /cuenta/i.test(originalname):
                // Handle scenario for 'cuenta' in the filename
                console.log('Processing Cuenta file');
                user.doc_account = req.file.path;
                break;

            default:
                res.status(401).send('Invalid file type');
                break;
        }

        await user.save();
    }
    res.status(200).send('File processing completed');
}


