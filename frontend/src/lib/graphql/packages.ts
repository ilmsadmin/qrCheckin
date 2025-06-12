import { gql } from '@apollo/client';

// Query to get all subscription packages  
export const GET_ALL_SUBSCRIPTION_PACKAGES = gql`
  query GetAllSubscriptionPackages($includeInactive: Boolean) {
    allSubscriptionPackages(includeInactive: $includeInactive)
  }
`;

// Query to get subscription packages by club
export const GET_SUBSCRIPTION_PACKAGES_BY_CLUB = gql`
  query GetSubscriptionPackagesByClub($clubId: String!, $includeInactive: Boolean) {
    subscriptionPackagesByClub(clubId: $clubId, includeInactive: $includeInactive)
  }
`;

// Query to get single subscription package
export const GET_SUBSCRIPTION_PACKAGE = gql`
  query GetSubscriptionPackage($id: String!) {
    subscriptionPackage(id: $id)
  }
`;

// Query to get popular subscription packages
export const GET_POPULAR_SUBSCRIPTION_PACKAGES = gql`
  query GetPopularSubscriptionPackages($limit: Float) {
    popularSubscriptionPackages(limit: $limit)
  }
`;

// Mutation to create subscription package
export const CREATE_SUBSCRIPTION_PACKAGE = gql`
  mutation CreateSubscriptionPackage(
    $clubId: String!
    $name: String!
    $type: String!
    $price: Float!
    $duration: Float!
    $description: String
    $features: [String!]
    $maxCheckins: Float
    $discountPrice: Float
    $isPopular: Boolean
    $sortOrder: Float
  ) {
    createSubscriptionPackage(
      clubId: $clubId
      name: $name
      type: $type
      price: $price
      duration: $duration
      description: $description
      features: $features
      maxCheckins: $maxCheckins
      discountPrice: $discountPrice
      isPopular: $isPopular
      sortOrder: $sortOrder
    )
  }
`;

// Mutation to update subscription package
export const UPDATE_SUBSCRIPTION_PACKAGE = gql`
  mutation UpdateSubscriptionPackage(
    $id: String!
    $name: String
    $type: String
    $price: Float
    $duration: Float
    $description: String
    $features: [String!]
    $maxCheckins: Float
    $discountPrice: Float
    $isPopular: Boolean
    $isActive: Boolean
    $sortOrder: Float
  ) {
    updateSubscriptionPackage(
      id: $id
      name: $name
      type: $type
      price: $price
      duration: $duration
      description: $description
      features: $features
      maxCheckins: $maxCheckins
      discountPrice: $discountPrice
      isPopular: $isPopular
      isActive: $isActive
      sortOrder: $sortOrder
    )
  }
`;

// Mutation to toggle subscription package status
export const TOGGLE_SUBSCRIPTION_PACKAGE_STATUS = gql`
  mutation ToggleSubscriptionPackageStatus($id: String!) {
    toggleSubscriptionPackageStatus(id: $id)
  }
`;

// Mutation to delete subscription package
export const DELETE_SUBSCRIPTION_PACKAGE = gql`
  mutation DeleteSubscriptionPackage($id: String!) {
    deleteSubscriptionPackage(id: $id)
  }
`;

// Mutation to generate QR code for subscription
export const GENERATE_QR_CODE = gql`
  mutation GenerateQRCode($subscriptionId: ID!) {
    generateQRCode(subscriptionId: $subscriptionId)
  }
`;