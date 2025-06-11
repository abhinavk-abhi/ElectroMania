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
    callbackURL: "https://electromania.shop/google/callback",
    // callbackURL: 'http://localhost:7003/google/callback',
    passReqToCallback: true,
},
async (req, accessToken, refreshToken, profile, done) => {
    try {
        // First, check if user already has Google ID linked
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
            // User found with Google ID - check if blocked
            if (user.isBlocked) {
                return done(null, false, { errorMessage: "You are blocked by the admin." });
            }
            req.session.user = user;
            return done(null, user);
        }
        
        // Check if user exists with this email (but no Google ID)
        user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
            // User exists with email but no Google ID
            if (user.isBlocked) {
                return done(null, false, { errorMessage: "You are blocked by the admin." });
            }
            
            // Link Google ID to existing account
            user.googleId = profile.id;
            await user.save();
            req.session.user = user;
            return done(null, user);
        }
        
        // No user found - create new user
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
            return done(null, false, { errorMessage: "You are blocked by the admin." });
        }
        
        done(null, user);
    } catch (err) {
        done(err);
    }
});

export default passport;