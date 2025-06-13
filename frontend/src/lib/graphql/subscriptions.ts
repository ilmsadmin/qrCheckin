import { gql } from '@apollo/client';

// Query to get user's subscriptions
export const GET_USER_SUBSCRIPTIONS = gql`
  query GetUserSubscriptions($userId: ID!) {
    userSubscriptions(userId: $userId)
  }
`;

// Query to get subscription by ID
export const GET_SUBSCRIPTION = gql`
  query GetSubscription($id: ID!) {
    subscription(id: $id)
  }
`;

// Query to get available packages for a club
export const GET_AVAILABLE_PACKAGES = gql`
  query GetAvailablePackages($clubId: String!) {
    subscriptionPackagesByClub(clubId: $clubId, includeInactive: false)
  }
`;

// Mutation to create a subscription from package
export const CREATE_SUBSCRIPTION_FROM_PACKAGE = gql`
  mutation CreateSubscriptionFromPackage(
    $packageId: ID!
    $userId: ID!
  ) {
    createSubscriptionFromPackage(
      packageId: $packageId
      userId: $userId
    )
  }
`;

// Mutation to create a custom subscription
export const CREATE_SUBSCRIPTION = gql`
  mutation CreateSubscription(
    $name: String!
    $type: String!
    $price: Float!
    $duration: Float!
    $userId: ID!
    $clubId: ID!
    $maxCheckins: Float
    $description: String
  ) {
    createSubscription(
      name: $name
      type: $type
      price: $price
      duration: $duration
      userId: $userId
      clubId: $clubId
      maxCheckins: $maxCheckins
      description: $description
    )
  }
`;

// Mutation to cancel subscription
export const CANCEL_SUBSCRIPTION = gql`
  mutation CancelSubscription($id: ID!) {
    cancelSubscription(id: $id)
  }
`;

// Mutation to reactivate subscription
export const REACTIVATE_SUBSCRIPTION = gql`
  mutation ReactivateSubscription($id: ID!) {
    reactivateSubscription(id: $id)
  }
`;

// Query to get subscription statistics
export const GET_SUBSCRIPTION_STATS = gql`
  query GetSubscriptionStats($userId: ID!) {
    subscriptionStats(userId: $userId)
  }
`;
