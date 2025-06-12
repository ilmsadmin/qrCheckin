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

// Mutation to create a new event
export const CREATE_EVENT = gql`
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input)
  }
`;

// Mutation to update an event
export const UPDATE_EVENT = gql`
  mutation UpdateEvent($id: String!, $input: UpdateEventInput!) {
    updateEvent(id: $id, input: $input)
  }
`;

// Mutation to remove (soft delete) an event
export const REMOVE_EVENT = gql`
  mutation RemoveEvent($id: String!) {
    removeEvent(id: $id)
  }
`;

// Mutation to delete (hard delete) an event
export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: String!) {
    deleteEvent(id: $id)
  }
`;