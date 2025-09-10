import express from 'express';
import request from 'supertest';
import { User } from './src/models/User.js';
import { register, login } from './src/controllers/auth/authController.js';
import { registerValidation, loginValidation } from './src/middleware/validation.js';

// Create test app
const app = express();
app.use(express.json());

// Test routes
app.post('/register', registerValidation, register);
app.post('/login', loginValidation, login);

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'TestPassword123!'
};

async function testAuthenticationFlows() {
  console.log('🧪 Testing User Service Authentication Flows...\n');

  try {
    // Test 1: User Registration
    console.log('1. Testing user registration...');
    const registerResponse = await request(app)
      .post('/register')
      .send(testUser);

    if (registerResponse.status === 201) {
      console.log('✅ Registration successful');
      console.log(`   User ID: ${registerResponse.body.data.user.id}`);
    } else {
      console.log('❌ Registration failed:', registerResponse.body.message);
      return;
    }

    // Test 2: User Login
    console.log('\n2. Testing user login...');
    const loginResponse = await request(app)
      .post('/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    if (loginResponse.status === 200) {
      console.log('✅ Login successful');
      console.log(`   Access Token: ${loginResponse.body.data.accessToken ? 'Generated' : 'Missing'}`);
      console.log(`   Refresh Token: ${loginResponse.body.data.refreshToken ? 'Generated' : 'Missing'}`);
    } else {
      console.log('❌ Login failed:', loginResponse.body.message);
    }

    // Test 3: Invalid Login
    console.log('\n3. Testing invalid login...');
    const invalidLoginResponse = await request(app)
      .post('/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword'
      });

    if (invalidLoginResponse.status === 401) {
      console.log('✅ Invalid login properly rejected');
    } else {
      console.log('❌ Invalid login not properly handled');
    }

    // Test 4: Validation Tests
    console.log('\n4. Testing input validation...');
    const invalidRegisterResponse = await request(app)
      .post('/register')
      .send({
        name: '',
        email: 'invalid-email',
        password: '123'
      });

    if (invalidRegisterResponse.status === 400) {
      console.log('✅ Input validation working correctly');
    } else {
      console.log('❌ Input validation not working');
    }

    console.log('\n🎉 Authentication flow tests completed!');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    // Clean up test user
    try {
      await User.deleteOne({ email: testUser.email });
      console.log('\n🧹 Test data cleaned up');
    } catch (error) {
      console.log('⚠️  Could not clean up test data:', error.message);
    }
  }
}

// Export for use
export { testAuthenticationFlows, app };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAuthenticationFlows();
}
