import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import env from 'dotenv'
import userRoute from './routes/user.js';
import adminRoute from './routes/admin.js';
import homeRoute from './routes/homeRoute.js';
import connectDB from './config/db.js';
env.config()
connectDB();


const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const port = process.env.PORT || 3000;
const publicPath = join(__dirname, 'public');

app.use(express.static(publicPath));
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

app.get('/user',userRoute);
app.get('/admin',adminRoute);
app.get('/',homeRoute);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});




