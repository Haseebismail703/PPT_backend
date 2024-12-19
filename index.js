import express from 'express'
import cors from 'cors'
import { configDotenv } from 'dotenv'
import Db_connection from './src/confiq/db.js'
import route from './src/route/routes.js'
import cookieParser from 'cookie-parser';
configDotenv()

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 3000



const Db = Db_connection.connection
Db.on('error', console.error.bind(console, 'Error connection'))
Db.once('open', () => {
    console.log('Db connected');
})


const corsOptions = {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow credentials (cookies)
};

app.use(cors(corsOptions));
app.use('/api', route)
app.use(cookieParser());
app.listen(PORT, () => {
    console.log(`Server is running http://localhost:${PORT}`);

})