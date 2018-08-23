'use strict';

require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');


const multer = require('multer');
const cloudinary = require('cloudinary');
const {fileUploadMiddleware} = require('./node-file-upload-middleware');

const { PORT, MONGODB_URI} = require('./config');

const usersRouter   = require('./routes/user-router');
const authRouter  = require('./routes/auth-router');
const carpoolRouter = require('./routes/carpool-router');
const profilePicRouter = require('./routes/profile-pic-router');
const { localStrategy, jwtStrategy } = require('./auth/strategies');

const app = express();

mongoose.Promise = global.Promise;

cloudinary.config({
  cloud_name: 'disoi1bmd',
  api_key: '614697612986849',
  api_secret: 'hHx7K5hLoaOQwZacQnttqGRFFaU',
});

app.use(express.json());

app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'common', {
  skip: () => process.env.NODE_ENV === 'test'
}));

// CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/carpools', carpoolRouter);
app.use('/api/profilePic', profilePicRouter);

const jwtAuth = passport.authenticate('jwt', { session: false });

// Initial server test
app.get('/', (req, res) => {
  console.log(res.json({message:'Hello Express!'}));
});

// A protected endpoint which needs a valid JWT to access it
app.get('/api/protected', jwtAuth, (req, res) => {
  return res.json({
    data: 'You logged in successfully!'
  });
});

const storage = multer.memoryStorage();
const upload = multer({ storage });
app.post('/api/files', upload.single('file'), fileUploadMiddleware);

app.use('*', (req, res) => {
  return res.status(404).json({ message: 'Not Found' });
});



let server;

function runServer(databaseUrl, port = PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Custom Error Handler
app.use((err, req, res, next) => {
  if (err.status) {
    const errBody = Object.assign({}, err, { message: err.message });
    res.status(err.status).json(errBody);
  } else {
    if(process.env.NODE_ENV !== 'test') {
      console.error(err);
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Listen for incoming connections
if (process.env.NODE_ENV !== 'test') {
  // Connect to DB and Listen for incoming connections
  mongoose.connect(MONGODB_URI)
    .then(instance => {
      const conn = instance.connections[0];
      console.info(`Connected to: mongodb://${conn.host}:${conn.port}/${conn.name}`);
    })
    .catch(err => {
      console.error(err);
    });
}

if (require.main === module) {
  runServer(MONGODB_URI).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
