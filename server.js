import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import path from "path";
import env from "dotenv";
import userRoute from "./routes/user.js";
import adminRoute from "./routes/admin.js";
import homeRoute from "./routes/homeRoute.js";
import connectDB from "./config/db.js";
import session from "express-session";
import passport from "./config/passport.js";
env.config();
connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "yourSecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',  
      maxAge: 24 * 60 * 60 * 1000  
    }
  })
);

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const port = process.env.PORT || 3000;
const publicPath = join(__dirname, "public");

app.use(express.static(publicPath));
app.set("view engine", "ejs");
app.set("views", join(__dirname, "views"));
app.use(express.static(path.join(publicPath)));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});//This for accessing the name of the from everywhere from the session even with login of google**//

app.use("/user", userRoute);
app.use("/admin", adminRoute);
app.use("/", homeRoute);



app.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
app.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/register" }),
  (req, res) => {
    req.session.user = req.user;
    res.render("home");
  }
);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
