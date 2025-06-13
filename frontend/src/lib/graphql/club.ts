import { gql } from '@apollo/client';

export const GET_CLUB_STATS = gql`
  query GetClubStats {
    clubStats {
      activeMembers
      todayCheckins
      activePackages
      monthlyRevenue
      membersGrowth
      checkinsGrowth
      packagesGrowth
      revenueGrowth
    }
  }
`;

export const GET_CLUB_RECENT_ACTIVITY = gql`
  query GetClubRecentActivity($limit: Int) {
    clubRecentActivity(limit: $limit) {
      id
      type
      description
      timestamp
      metadata
    }
  }
`;

export const GET_CLUB_EVENTS_TODAY = gql`
  query GetClubEventsToday {
    clubEventsToday {
      id
      name
      time
      participantsCount
      capacity
    }
  }
`;

export const GET_CLUB_CUSTOMERS = gql`
  query GetClubCustomers($pagination: PaginationInput, $filter: CustomerFilterInput) {
    clubCustomers(pagination: $pagination, filter: $filter) {
      customers {
        id
        firstName
        lastName
        email
        phone
        activeSubscription {
          id
          package {
            name
            type
          }
          expiresAt
          remainingCredits
        }
        lastCheckin
        totalCheckins
        createdAt
      }
      totalCount
    }
  }
`;

export const CREATE_CUSTOMER = gql`
  mutation CreateCustomer($input: CreateCustomerInput!) {
    createCustomer(input: $input) {
      id
      firstName
      lastName
      email
      phone
      createdAt
    }
  }
`;

export const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($id: ID!, $input: UpdateCustomerInput!) {
    updateCustomer(id: $id, input: $input) {
      id
      firstName
      lastName
      email
      phone
      updatedAt
    }
  }
`;