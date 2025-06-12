import { gql } from '@apollo/client';

// Query to fetch all events
export const GET_ALL_EVENTS = gql`
  query GetAllEvents {
    events
  }
`;

// Query to get single event
export const GET_EVENT = gql`
  query GetEvent($id: String!) {
    event(id: $id)
  }
`;

// These mutations would need to be added to the backend if not already available
// For now, we'll work with the existing event query to display event management