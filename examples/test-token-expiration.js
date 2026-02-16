/**
 * Token Expiration Testing - JavaScript/Node.js
 * 
 * This script helps test the token expiration handling functionality
 * Run with: node test-token-expiration.js
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:5173';

// Global variables
let authToken = null;
let refreshToken = null;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add request interceptor
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Add response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log('🔄 Token expired, attempting refresh...');
      try {
        const newToken = await refreshAuthToken();
        if (newToken) {
          console.log('✅ Token refreshed successfully');
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.log('❌ Token refresh failed');
        throw refreshError;
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Test login functionality
 */
async function testLogin() {
  console.log('\n1. Testing Login...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    if (response.data.success) {
      authToken = response.data.data.token;
      console.log('✅ Login successful');
      console.log('📝 Token received (first 50 chars):', authToken.substring(0, 50) + '...');
      
      // Decode and display token info
      decodeToken(authToken);
      
      return authToken;
    } else {
      console.log('❌ Login failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return null;
  }
}

/**
 * Test token refresh
 */
async function refreshAuthToken() {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.data.success) {
      authToken = response.data.data.token;
      console.log('✅ Token refreshed successfully');
      console.log('📝 New token (first 50 chars):', authToken.substring(0, 50) + '...');
      return authToken;
    } else {
      console.log('❌ Token refresh failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Token refresh error:', error.message);
    return null;
  }
}

/**
 * Test protected endpoint
 */
async function testProtectedEndpoint() {
  console.log('\n2. Testing Protected Endpoint...');
  
  try {
    const response = await api.get('/api/auth/me');
    
    if (response.data.success) {
      console.log('✅ Protected endpoint accessible');
      console.log('👤 User data:', response.data.data);
      return true;
    } else {
      console.log('❌ Protected endpoint access failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Protected endpoint error:', error.message);
    return false;
  }
}

/**
 * Decode JWT token
 */
function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    const padding = base64.length % 4;
    if (padding) {
      base64 += '='.repeat(4 - padding);
    }
    
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    
    console.log('📋 Token payload:');
    console.log('  - User ID:', payload.id);
    console.log('  - Username:', payload.username);
    console.log('  - Role:', payload.role);
    console.log('  - Permissions:', payload.permissions);
    
    // Calculate expiration
    if (payload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      const timeLeft = payload.exp - currentTime;
      
      if (timeLeft > 0) {
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        console.log(`  - Expires in: ${hours}h ${minutes}m`);
        console.log(`  - Expires at: ${new Date(payload.exp * 1000).toLocaleString()}`);
      } else {
        console.log('  - Status: EXPIRED!');
      }
    }
    
    return payload;
  } catch (error) {
    console.log('❌ Failed to decode token:', error.message);
    return null;
  }
}

/**
 * Test token expiration simulation
 */
async function testTokenExpiration() {
  console.log('\n3. Testing Token Expiration Handling...');
  
  if (!authToken) {
    console.log('❌ No auth token available. Login first.');
    return;
  }
  
  console.log('📝 Current token status:');
  decodeToken(authToken);
  
  console.log('\n💡 To test token expiration:');
  console.log('   1. Wait for token to expire (check expiration time above)');
  console.log('   2. Try to access protected endpoint');
  console.log('   3. System should automatically refresh token');
  console.log('   4. Original request should be retried with new token');
}

/**
 * Test frontend integration
 */
function testFrontendIntegration() {
  console.log('\n4. Testing Frontend Integration...');
  console.log(`🌐 Open ${FRONTEND_URL} in your browser`);
  console.log('🔍 Check for:');
  console.log('   - Token status badge in header');
  console.log('   - Auto refresh when token expires');
  console.log('   - Warning popup when token about to expire');
  console.log('   - Manual refresh button functionality');
  console.log('   - Smooth user experience during token refresh');
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Token Expiration Tests...\n');
  
  // Test 1: Login
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('❌ Login failed. Cannot continue with other tests.');
    return;
  }
  
  // Test 2: Protected endpoint
  await testProtectedEndpoint();
  
  // Test 3: Token expiration handling
  await testTokenExpiration();
  
  // Test 4: Frontend integration
  testFrontendIntegration();
  
  console.log('\n✅ All tests completed!');
  console.log('\n📚 Next steps:');
  console.log('   1. Monitor the application logs for token refresh activities');
  console.log('   2. Test with actual token expiration by waiting');
  console.log('   3. Verify that user experience remains smooth');
  console.log('   4. Check that no data is lost during token refresh');
}

/**
 * Main execution
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage: node test-token-expiration.js [options]');
    console.log('Options:');
    console.log('  --login-only    Test only login functionality');
    console.log('  --protected     Test only protected endpoint');
    console.log('  --expiration    Test only token expiration');
    console.log('  --frontend      Test only frontend integration');
    console.log('  --help, -h      Show this help message');
    process.exit(0);
  }
  
  if (args.includes('--login-only')) {
    testLogin();
  } else if (args.includes('--protected')) {
    testProtectedEndpoint();
  } else if (args.includes('--expiration')) {
    testTokenExpiration();
  } else if (args.includes('--frontend')) {
    testFrontendIntegration();
  } else {
    runAllTests();
  }
}

module.exports = {
  testLogin,
  testProtectedEndpoint,
  testTokenExpiration,
  decodeToken,
  refreshAuthToken,
};