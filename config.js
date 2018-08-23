'use strict';

require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 8080,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost/karpul',
  TEST_MONGODB_URI: process.env.TEST_MONGODB_URI || 'mongodb://localhost/karpul-test',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',
  app_id: process.env.app_id || 'fail',
  app_code: process.env.app_code || 'fail',
  GEOCODER_API: process.env.GEOCODER_API || '' 
};
