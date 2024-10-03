const request = require('supertest');
const app = require('../server'); // Adjust the path based on your project structure
const Task = require('../models/taskModel'); // Task model
const mongoose = require('mongoose');

// Mock the Task model
jest.mock('../models/taskModel');

describe('Task Endpoints', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/task', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Task Description',
        dueDate: new Date(),
      };

      Task.create.mockResolvedValue(taskData); // Mock create method

      const response = await request(app)
        .post('/api/v1/task')
        .send(taskData)
        .expect(201);

      expect(response.body).toEqual(expect.objectContaining(taskData));
    });

    it('should return an error when task creation fails', async () => {
      Task.create.mockRejectedValue(new Error('Error creating task'));

      const response = await request(app)
        .post('/api/v1/task')
        .send({
          title: 'Invalid Task',
          description: 'Task Description',
        })
        .expect(500);

      expect(response.body.message).toBe('Error creating task');
    });
  });

  describe('GET /api/v1/task', () => {
    it('should retrieve all tasks', async () => {
      const tasks = [{ title: 'Task 1' }, { title: 'Task 2' }];
      Task.find.mockResolvedValue(tasks); // Mock find method

      const response = await request(app)
        .get('/api/v1/task')
        .expect(200);

      expect(response.body).toEqual(tasks);
    });
  });
});
