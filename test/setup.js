require('dotenv').config();
const { expect } = require('chai');
const supertest = require('supertest');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

global.supertest = supertest;
global.expect = expect;