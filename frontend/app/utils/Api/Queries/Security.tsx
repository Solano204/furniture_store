import { gql } from "@apollo/client";

export const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $password: String!) {
    register(input: { username: $username, password: $password }) {
      accessToken
      refreshToken
      clerkId
    }
  }
`;

export const AUTHENTICATE_MUTATION = gql`
  mutation Authenticate($username: String!, $password: String!) {
    authenticate(input: { username: $username, password: $password }) {
      accessToken
      refreshToken
      clerkId
    }
  }
`;

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword(
    $username: String!
    $currentPassword: String!
    $newPassword: String!
    $confirmationPassword: String!
  ) {
    changePassword(
      input: {
        username: $username
        currentPassword: $currentPassword
        newPassword: $newPassword
        confirmationPassword: $confirmationPassword
      }
    )
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken)
  }
`;
