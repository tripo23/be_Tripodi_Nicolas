import * as url from 'url';
import bcrypt from 'bcrypt';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const createHash = (pass) => {
    return bcrypt.hashSync(pass, bcrypt.genSaltSync(10));
}

const isValidPassword = (userInDb, pass) => {
    return bcrypt.compareSync(pass, userInDb.password);
}

function auth(req, res, next) {
    if (req.session?.user) {
        return next();
    }
    res.render('login', {
        sessionInfo: req.sessionStore
    });
}

function adminOnly(req, res, next) {
    if (req.session?.role == 'admin') {
        console.log(req.session.role);
        return next();
    } else {
        console.log(req.session.role);
        res.render('forbidden');
    }
}

function userOnly(req, res, next) {
    if (req.session?.role == 'user') {
        console.log(req.session.role);
        return next();
    } else {
        console.log(req.session.role);
        res.render('forbidden');
    }
}

export { __filename, __dirname, createHash, isValidPassword, auth, adminOnly, userOnly };