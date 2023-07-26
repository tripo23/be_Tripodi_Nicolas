import {} from 'dotenv/config';
import GithubStrategy from 'passport-github2';
import passport from 'passport';
import local from 'passport-local';
import { createHash, isValidPassword } from "../utils.js";
import userModel from "../dao/models/users.model.js"
import { AddNewCart } from "../dao/controllers/cart_controller.js";


const LocalStrategy = local.Strategy;
const initializePassport = () => {

    passport.use('register', new LocalStrategy({
        passReqToCallback:true,usernameField:'email'
    }, async (req,username,password,done) => {
        const {firstName, lastName, email, age} = req.body;
        try {
            let user = await userModel.findOne({email: username});
            if (user) {
                return done(null, false);
            }
            const cartID = await AddNewCart();
            const newUser = {
                firstName,
                lastName,
                email,
                age,
                password: createHash(password),
                role: 'user',
                cart: cartID
            }
            let result = await userModel.create(newUser);
            req.logger.info(`new user created - ${new Date().toLocaleTimeString()}`);
            return done(null,result);
        } catch (error) {
            req.logger.error(`cannot register user - ${new Date().toLocaleTimeString()}`);
            return done("Error getting user: "+error);
        }
    }));

    passport.use('login', new LocalStrategy({ passReqToCallback:true, usernameField: 'email' }, async (req, email, password, done) => {
        try {
            const user = await userModel.findOne({ email: email });
            if (!user) {
                req.session.errorMessage = 'Usuario inexistente';
                req.logger.error(`wrong user - ${new Date().toLocaleTimeString()}`);
                return done(null, false);
            }
            if (!isValidPassword(user, password)) {
                req.logger.error(`wrong password - ${new Date().toLocaleTimeString()}`);
                req.session.errorMessage = 'Contraseña incorrecta';
                return done(null, false);
            } else {
                req.session.errorMessage = '';
                delete user.password;
                req.logger.info(`${user.email} logged in - ${new Date().toLocaleTimeString()}`);
                return done(null, user);
            }
        } catch (error) {
            return done(error);
        }
    }));

    //Estrategia GitHub
    const githubData = {
        clientID: process.env.GH_clientID,
        clientSecret: process.env.GH_clientSecret,
        callbackUrl: process.env.GH_callbackUrl,
        scope: ['user:email'] 
    };

    const verifyAuthGithub = async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await userModel.findOne({ email: profile._json.email });

            if (!user) {
                user = await userModel.findOne({ email: `${profile._json.id}@github.com` });
                if (!user) {
                    const cartID = await AddNewCart();
                    const newUser = {
                        firstName: profile._json.name || 'gitHub user',
                        lastName: 'gitHub lastName',
                        email:`${profile._json.id}@github.com`,
                        age:'1',
                        password: '',
                        role: 'user',
                        cart: cartID
                    }
                    user = await userModel.create(newUser);
                    req.logger.info(`github user created - ${new Date().toLocaleTimeString()}`);
                    done(null,user);
                } else {
                    req.logger.error(`github login error - ${new Date().toLocaleTimeString()}`);
                    done(null,user);
                }
                
            } else {
                done(null, user);
            }
        } catch (err) {
            return done(err.message);
        }
    }
    
    passport.use('github', new GithubStrategy(githubData, verifyAuthGithub));

    passport.serializeUser((user,done) => {
        done(null,user._id);
    });

    passport.deserializeUser(async (id, done) => {
        let user = await userModel.findById(id);
        done(null,user)
    });

    
}

export default initializePassport;