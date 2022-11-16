require('dotenv').config();
require('express-async-errors');

// Extra Security packages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');

// Importing Swagger
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

const express = require('express');
const app = express();

// Importing connectDB
const connectDB = require('./db/connect');

// Importing Auth middleware
const authenticateUser = require('./middleware/authentication');

// Importing Routes 
const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');

// Importing Error Handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');


// Middleware
app.set('trust proxy', 1);
app.use(
    rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
        // standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        // legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    })
);
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

// Swagger file
app.get('/', (req, res) => {
    res.send('<h1>Jobs API</h1><a href="/api-docs">Documentation</a>');
});
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

//Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, jobsRouter);  // Passing middleware as we want to protect all the job routes

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


const port = process.env.PORT || 3000;
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        console.log(`Connected to DB`);
        app.listen(port, () => {
            console.log(`Server is running at Port ${port}`);
        })
    } catch (error) {
        console.log(error);
    }
}

start();