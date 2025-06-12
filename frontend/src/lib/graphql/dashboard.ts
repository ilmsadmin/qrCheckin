import { gql } from '@apollo/client';

// Query to fetch dashboard statistics
export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    users {
      id
      isActive
    }
    clubs {
      id
      isActive
    }
    events
  }
`;

// Query to fetch recent check-ins for dashboard
export const GET_RECENT_CHECKINS_DASHBOARD = gql`
  query GetRecentCheckinsDashboard {  
    checkinLogs
  }
`;

// Query to fetch all clubs for management
export const GET_CLUBS = gql`
  query GetClubs {
    clubs {
      id
      name
      description
      isActive
      createdAt
      updatedAt
    }
  }
`;

// Query to get single club
export const GET_CLUB = gql`
  query GetClub($id: ID!) {
    club(id: $id) {
      id
      name
      description
      isActive
      createdAt
      updatedAt
    }
  }
`;

// Mutation to create a new club
export const CREATE_CLUB = gql`
  mutation CreateClub($name: String!, $description: String) {
    createClub(name: $name, description: $description) {
      id
      name
      description
      isActive
      createdAt
      updatedAt
    }
  }
`;

// Mutation to update club
export const UPDATE_CLUB = gql`  
  mutation UpdateClub($id: ID!, $name: String, $description: String, $isActive: Boolean) {
    updateClub(id: $id, name: $name, description: $description, isActive: $isActive) {
      id
      name
      description
      isActive
      updatedAt
    }
  }
`;

// Mutation to remove/deactivate club  
export const REMOVE_CLUB = gql`
  mutation RemoveClub($id: ID!) {
    removeClub(id: $id) {
      id
      isActive
    }
  }
`;