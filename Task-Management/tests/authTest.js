const request = require('supertest');
const app = require('../server'); // Adjust the path based on your project structure
const User = require('../models/userModel'); // User model
const mongoose = require('mongoose');

// Mock the User model
jest.mock('../models/userModel');

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        user_name: 'John Doe',
        user_email: 'john@example.com',
        user_password: 'password123',
      };

      User.create.mockResolvedValue(userData); // Mock create method

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toEqual(expect.objectContaining(userData));
    });

    it('should return an error for duplicate email', async () => {
      User.findOne.mockResolvedValue({}); // Mock existing user

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          user_name: 'Jane Doe',
          user_email: 'john@example.com',
          user_password: 'password123',
        })
        .expect(400);

      expect(response.body.message).toBe('Duplicate email entered');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should log in an existing user', async () => {
      const userData = {
        user_email: 'john@example.com',
        user_password: 'password123',
      };

      User.findOne.mockResolvedValue({
        comparePassword: jest.fn().mockResolvedValue(true), // Mock comparePassword method
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(userData)
        .expect(200);

      expect(response.body).toHaveProperty('token'); // Assuming you return a token
    });

    it('should return an error for invalid email or password', async () => {
      User.findOne.mockResolvedValue(null); // Mock no user found

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          user_email: 'invalid@example.com',
          user_password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid Email or Password');
    });
  });
});
