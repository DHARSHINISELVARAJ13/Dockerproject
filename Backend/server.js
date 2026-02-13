import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import connectDB from './configs/db.js';
import adminRouter from './routes/adminRoutes.js';
import blogRouter from './routes/blogRoutes.js';
import userRouter from './routes/userRoutes.js';

const app = express();

await connectDB()

//middleware
app.use(cors())
app.use(express.json())

// Serve static files (uploaded images)
app.use('/uploads', express.static('uploads'))

app.get('/',(req,res)=>res.send("API is working"))
app.use('/api/admin',adminRouter)
app.use('/api/blog',blogRouter)
app.use('/api/user',userRouter)
const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log('Server is running on port ' + PORT)
})
export default app;