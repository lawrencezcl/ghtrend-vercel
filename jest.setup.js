import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.GITHUB_TOKEN = 'test_github_token'
process.env.BLOB_READ_WRITE_TOKEN = 'test_blob_token'

// Mock fetch globally
global.fetch = jest.fn()

// Mock crypto for UUID generation
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'test-uuid-1234'),
    createHmac: jest.fn(() => ({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn(() => 'test-signature')
    })),
    timingSafeEqual: jest.fn(() => true)
  }
})

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
})