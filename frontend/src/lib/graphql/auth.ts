import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      access_token
      user {
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
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
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

export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;

export const GET_CURRENT_USER = gql`
  query Me {
    me {
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

export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $password: String!) {
    resetPassword(token: $token, password: $password)
  }
`;
