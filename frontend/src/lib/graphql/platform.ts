import { gql } from '@apollo/client';

export const GET_PLATFORM_STATS = gql`
  query GetPlatformStats {
    platformStats {
      activeClubs
      totalCustomers
      checkinsToday
      monthlyRevenue
      clubsGrowth
      customersGrowth
      checkinsGrowth
      revenueGrowth
    }
  }
`;

export const GET_RECENT_ONBOARDING_REQUESTS = gql`
  query GetRecentOnboardingRequests {
    recentOnboardingRequests {
      id
      clubName
      submittedAt
      status
    }
  }
`;

export const GET_PLATFORM_ACTIVITY = gql`
  query GetPlatformActivity($limit: Int) {
    platformActivity(limit: $limit) {
      id
      type
      description
      timestamp
      metadata
    }
  }
`;

export const CREATE_CLUB = gql`
  mutation CreateClub($input: CreateClubInput!) {
    createClub(input: $input) {
      id
      name
      description
      isActive
      createdAt
    }
  }
`;

export const GET_ALL_CLUBS = gql`
  query GetAllClubs($pagination: PaginationInput, $filter: ClubFilterInput) {
    allClubs(pagination: $pagination, filter: $filter) {
      clubs {
        id
        name
        description
        isActive
        customersCount
        revenue
        createdAt
        updatedAt
      }
      totalCount
    }
  }
`;