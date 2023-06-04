import {} from 'dotenv/config';
import GithubStrategy from 'passport-github2';
import passport from 'passport';
import local from 'passport-local';
import { createHash, isValidPassword } from "../utils.js";
import userModel from "../dao/models/users.model.js"


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
            const newUser = {
                firstName,
                lastName,
                email,
                age,
                password: createHash(password) 
            }
            let result = await userModel.create(newUser);
            return done(null,result);
        } catch (error) {
            return done("Error getting user: "+error);
        }
    }));

    passport.use('login', new LocalStrategy({ passReqToCallback:true, usernameField: 'email' }, async (req, email, password, done) => {
        try {
            const user = await userModel.findOne({ email: email });
            if (!user) {
                req.session.errorMessage = 'Usuario inexistente';
                return done(null, false);
            }
            if (!isValidPassword(user, password)) {
                req.session.errorMessage = 'Contraseña incorrecta';
                return done(null, false);
            } else {
                req.session.errorMessage = '';
                delete user.password;
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

    const verifyAuthGithubTEST = async (accessToken, refreshToken, profile, done) => {
        try {
           
            const email = profile._json.email;
            email ? console.log(email) : console.log('no hay email');
            // if (email) {
                const user = await userModel.findOne({ email: email });
                console.log(user);
                if (!user) {
                    // const newUser = {
                    //     firstName: profile._json.name,
                    //     lastName: '',
                    //     email: profile._json.email,
                    //     age:'',
                    //     password: ''
                    // }
                    // let result = await userModel.create(newUser);
                    // console.log(result);
                    // done(null,result);
                    
                } else {
                    console.log('vine por el else');
                    done(null, user);
                }
            // } else {
            //     console.log('Email not provided by GitHub');
            //     done('Email not provided by GitHub');
            // }
        } catch (err) {
            return done(err.message);
        }
    }

    const verifyAuthGithub = async (accessToken, refreshToken, profile, done) => {
        try {
            // console.log(profile._json);
            const user = await userModel.findOne({ email: profile._json.email });

            if (!user) {
                // const [first, last] = fullName.split(' ');
                done(null, false);
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