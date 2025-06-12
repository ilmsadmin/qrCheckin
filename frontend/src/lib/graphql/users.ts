import { gql } from '@apollo/client';

// Get all users (admin/staff only)
export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      username
      firstName
      lastName
      role
      isActive
      createdAt
      updatedAt
    }
  }
`;

// Get user by ID
export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      username
      firstName
      lastName
      role
      isActive
      createdAt
      updatedAt
    }
  }
`;

// Update user (admin only)
export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      email
      username
      firstName
      lastName
      role
      isActive
      updatedAt
    }
  }
`;

// Delete/deactivate user (admin only)
export const DEACTIVATE_USER = gql`
  mutation DeactivateUser($id: ID!) {
    deactivateUser(id: $id) {
      id
      isActive
    }
  }
`;

// Activate user (admin only)
export const ACTIVATE_USER = gql`
  mutation ActivateUser($id: ID!) {
    activateUser(id: $id) {
      id
      isActive
    }
  }
`;

// Generate QR code for user
export const GENERATE_USER_QR_CODE = gql`
  mutation GenerateUserQRCode($userId: ID!) {
    generateUserQRCode(userId: $userId) {
      id
      qrCode
      expiresAt
      isActive
    }
  }
`;

// Get user subscriptions
export const GET_USER_SUBSCRIPTIONS = gql`
  query GetUserSubscriptions($userId: ID!) {
    userSubscriptions(userId: $userId) {
      id
      userId
      packageId
      startDate
      endDate
      isActive
      qrCode
      createdAt
    }
  }
`;

// Get user check-in logs
export const GET_USER_CHECKIN_LOGS = gql`
  query GetUserCheckinLogs($userId: ID, $limit: Int, $offset: Int) {
    userCheckinLogs(userId: $userId, limit: $limit, offset: $offset) {
      id
      userId
      eventId
      action
      timestamp
      location
      user {
        id
        firstName
        lastName
        email
      }
      event {
        id
        name
        location
      }
    }
  }
`;

// Get all check-in logs (admin view)
export const GET_ALL_CHECKIN_LOGS = gql`
  query GetAllCheckinLogs($limit: Int, $offset: Int) {
    checkinLogs(limit: $limit, offset: $offset) {
      id
      userId
      eventId
      action
      timestamp
      location
      user {
        id
        firstName
        lastName
        email
      }
      event {
        id
        name
        location
      }
    }
  }
`;