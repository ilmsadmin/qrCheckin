import { gql } from '@apollo/client';

export const GET_CUSTOMER_DASHBOARD = gql`
  query GetCustomerDashboard {
    customerDashboard {
      customer {
        id
        firstName
        lastName
        email
        phone
      }
      activeSubscription {
        id
        package {
          name
          type
          price
          features
        }
        expiresAt
        status
        remainingCredits
        qrCode {
          id
          hash
          isActive
        }
      }
      recentCheckins {
        id
        timestamp
        type
        location
        event {
          name
        }
      }
      upcomingBookings {
        id
        event {
          name
          startTime
        }
        status
      }
    }
  }
`;

export const GET_CUSTOMER_QR_CODE = gql`
  query GetCustomerQRCode {
    customerQRCode {
      id
      hash
      isActive
      subscription {
        id
        package {
          name
        }
      }
    }
  }
`;

export const GET_CUSTOMER_VISIT_HISTORY = gql`
  query GetCustomerVisitHistory($pagination: PaginationInput) {
    customerVisitHistory(pagination: $pagination) {
      visits {
        id
        timestamp
        type
        location
        event {
          name
        }
        duration
      }
      totalCount
    }
  }
`;

export const GET_AVAILABLE_PACKAGES_FOR_CUSTOMER = gql`
  query GetAvailablePackagesForCustomer {
    availablePackages {
      id
      name
      description
      type
      price
      discountPrice
      duration
      maxCheckins
      features
      isPopular
      isActive
    }
  }
`;

export const CREATE_CUSTOMER_SUBSCRIPTION = gql`
  mutation CreateCustomerSubscription($packageId: ID!, $paymentData: PaymentInput!) {
    createCustomerSubscription(packageId: $packageId, paymentData: $paymentData) {
      subscription {
        id
        package {
          name
          type
          price
        }
        expiresAt
        qrCode {
          id
          hash
        }
      }
      payment {
        id
        amount
        status
      }
    }
  }
`;

export const UPDATE_CUSTOMER_PROFILE = gql`
  mutation UpdateCustomerProfile($input: UpdateCustomerInput!) {
    updateCustomerProfile(input: $input) {
      id
      firstName
      lastName
      email
      phone
      updatedAt
    }
  }
`;

export const BOOK_CLASS = gql`
  mutation BookClass($eventId: ID!) {
    bookClass(eventId: $eventId) {
      id
      event {
        name
        startTime
      }
      status
      bookedAt
    }
  }
`;

export const CANCEL_BOOKING = gql`
  mutation CancelBooking($bookingId: ID!) {
    cancelBooking(bookingId: $bookingId) {
      id
      status
      cancelledAt
    }
  }
`;