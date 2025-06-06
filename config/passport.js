import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from '../model/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

const userIdGenerator = async () => {
  const count = await User.countDocuments();
  return `USR${1000 + count + 1}`;
};

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:7003/google/callback',
    passReqToCallback : true,
},
async (req, accessToken, refreshToken, profile, done) => {
    try {
        
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
            return done(null, user);
        }
        
        
        user = await User.findOne({ email: profile.emails[0].value });
        console.log(user)
    if (!user) {
      return done(null, false);
    }
    
    if (user.isBlocked) {
      // Instead of returning user, return false to reject authentication
      return done(null, false, { errorMessage : "You are blocked by the admin." });
    }

        if (user) {
            user.googleId = profile.id;
            await user.save();
            req.session.user =  user;
            return done(null, user);
        }
        
      
        const userId = await userIdGenerator();
        user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            userId,
            isVerified: true
        });

        await user.save();
        req.session.user = user;
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id); 
        if (!user) {
      return done(null, false);
    }
    
    if (user.isBlocked) {
      // Instead of returning user, return false to reject authentication
      return done(null, false, { errorMessage : "You are blocked by the admin." });
    }
        done(null, user);
    } catch (err) {
        done(err);
    }
});

export default passport;