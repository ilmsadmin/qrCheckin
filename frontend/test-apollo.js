// A simple test script to verify Apollo Client connection
// Run this with Node.js: node test-apollo.js

const fetch = require('node-fetch');
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql';

console.log(`Testing GraphQL API connection to: ${API_URL}`);

// Simple login mutation to test authentication
const loginMutation = `
  mutation TestLogin($input: LoginInput!) {
    login(input: $input) {
      access_token
      user {
        id
        email
        username
        role
      }
    }
  }
`;

// Test credentials (should match those in help.tsx)
const testAccounts = [
  { email: 'admin@qrcheckin.com', password: 'admin123' },
  { email: 'staff@qrcheckin.com', password: 'staff123' },
  { email: 'user@qrcheckin.com', password: 'user123' },
  { email: 'toan@zplus.vn', password: 'ToanLinh' }
];

// Test the connection
async function testConnection() {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `{ __typename }` // Simplest possible query
      })
    });
    
    const data = await response.json();
    if (data.errors) {
      console.error('❌ Connection test failed with GraphQL errors:', data.errors);
      return false;
    }
    
    console.log('✅ Connection test successful! API is reachable.');
    return true;
  } catch (error) {
    console.error('❌ Connection test failed with error:', error.message);
    return false;
  }
}

// Test login with provided credentials
async function testLogin(email, password) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: loginMutation,
        variables: {
          input: { email, password }
        }
      })
    });
    
    const data = await response.json();
    
    if (data.errors) {
      console.error(`❌ Login failed for ${email}:`, data.errors[0].message);
      return false;
    }
    
    if (data.data?.login?.user) {
      const user = data.data.login.user;
      console.log(`✅ Login successful for ${email} (${user.role})`);
      console.log('  User:', user);
      console.log('  Token:', data.data.login.access_token.substring(0, 20) + '...');
      return true;
    } else {
      console.error(`❌ Login response for ${email} missing user data`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Login test for ${email} failed with error:`, error.message);
    return false;
  }
}

// Run the tests
async function runTests() {
  console.log('=== APOLLO CLIENT CONNECTION TEST ===');
  
  // Test API connection
  const connectionSuccess = await testConnection();
  if (!connectionSuccess) {
    console.log('\n⚠️ API connection failed. Please check if the backend is running at:', API_URL);
    console.log('If running locally, make sure to start the backend with: npm run start:dev');
    return;
  }
  
  // Test login for each account
  console.log('\n=== TESTING LOGIN CREDENTIALS ===');
  let loginSuccessCount = 0;
  
  for (const account of testAccounts) {
    const success = await testLogin(account.email, account.password);
    if (success) loginSuccessCount++;
  }
  
  // Summary
  console.log('\n=== TEST SUMMARY ===');
  console.log(`API Connection: ${connectionSuccess ? '✅ Success' : '❌ Failed'}`);
  console.log(`Login Tests: ${loginSuccessCount}/${testAccounts.length} successful`);
  
  if (loginSuccessCount === 0 && connectionSuccess) {
    console.log('\n⚠️ All login tests failed but API is reachable. This could indicate:');
    console.log('1. The test credentials have changed');
    console.log('2. The authentication system has issues');
    console.log('3. The database doesn\'t have these users');
  }
}

runTests().catch(error => {
  console.error('Test script error:', error);
});
