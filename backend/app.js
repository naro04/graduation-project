require('dotenv').config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const routes = require('./routes');
const setupSwagger = require('./swagger');

const app = express();

app.set('port', process.env.PORT || 5000);

// CORS configuration - more permissive for development
const corsOptions = {
  origin: function (origin, callback) {
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // In production, check against allowed origins
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'https://lightgrey-spider-272497.hostingersite.com',
      'http://localhost:5173',
      'http://localhost:4000'
    ].filter(Boolean);

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));
app.use(cookieParser());

// Request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    origin: req.headers.origin,
    'content-type': req.headers['content-type'],
    'authorization': req.headers.authorization ? 'present' : 'missing'
  });
  next();
});

// Swagger Documentation
setupSwagger(app);

app.use('/api/v1/', routes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);

  // Handle Multer errors specifically
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ status: 'fail', message: 'File too large. Max 5MB allowed.' });
  }

  if (err.message && err.message.includes('Unexpected field')) {
    return res.status(400).json({ status: 'fail', message: 'Invalid field name in upload. Use "avatar" or "images" as appropriate.', error: err.message });
  }

  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

module.exports = app;
