import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import env from 'dotenv'
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import connectDB from './config/db.js';
env.config()
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const publicPath = join(__dirname, 'public');

app.use(express.static(publicPath));
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

app.get('/user',userRoutes);
app.get('/admin',adminRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});




