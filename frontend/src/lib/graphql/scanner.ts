import { gql } from '@apollo/client';

// Query to fetch all active events
export const GET_EVENTS = gql`
  query GetEvents {
    events
  }
`;

// Query to fetch recent check-ins
export const GET_RECENT_CHECKINS = gql`
  query GetRecentCheckins($limit: Int) {
    checkinLogs
  }
`;

// Mutation to perform check-in
export const PERFORM_CHECKIN = gql`
  mutation Checkin($qrCodeId: String!, $eventId: String!) {
    checkin(qrCodeId: $qrCodeId, eventId: $eventId)
  }
`;

// Mutation to perform check-out
export const PERFORM_CHECKOUT = gql`
  mutation Checkout($qrCodeId: String!, $eventId: String!) {
    checkout(qrCodeId: $qrCodeId, eventId: $eventId)
  }
`;
