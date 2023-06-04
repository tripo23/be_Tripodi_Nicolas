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
    }))

    passport.serializeUser((user,done) => {
        done(null,user._id);
    });

    passport.deserializeUser(async (id, done) => {
        let user = await userModel.findById(id);
        done(null,user)
    });
}

export default initializePassport;