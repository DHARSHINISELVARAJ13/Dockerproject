import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import connectDB from './configs/db.js';
import { metricsHandler, metricsMiddleware, startSystemMetricsCollection, stopSystemMetricsCollection } from './configs/metrics.js';
import adminRouter from './routes/adminRoutes.js';
import blogRouter from './routes/blogRoutes.js';
import userRouter from './routes/userRoutes.js';

const app = express();

await connectDB()

// Start lightweight background sampling so Prometheus can see process health even when traffic is idle.
startSystemMetricsCollection();

//middleware
app.use(cors())
app.use(express.json())

// Expose metrics directly on the app instead of through /api so Prometheus can scrape it without public routing.
app.get('/metrics', metricsHandler)
app.use(metricsMiddleware)

// Serve static files (uploaded images)
app.use('/uploads', express.static('uploads'))

app.get('/',(req,res)=>res.send("API is working"))
app.use('/api/admin',adminRouter)
app.use('/api/blog',blogRouter)
app.use('/api/user',userRouter)
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT,()=>{
    console.log('Server is running on port ' + PORT)
})

const shutdown = (signal) => {
    console.log(`Received ${signal}, shutting down gracefully...`);

    stopSystemMetricsCollection();

    server.close(() => {
        process.exit(0);
    });

    // Ensure the process eventually exits even if a connection hangs during shutdown.
    setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;