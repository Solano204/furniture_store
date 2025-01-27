



import { gql } from "@apollo/client";

export const getRegisterMutation = (
  username: string,
  password: string,
  role: string
) => gql`
  mutation {
    register(
      input: {
        username: "${username}",
        password: "${password}",
        role: "${role}"
      }
    ) {
      accessToken
      refreshToken
    }
  }
`;




export const getChangePasswordMutation = (
  username: string,
  currentPassword: string,
  newPassword: string,
  confirmationPassword: string
) => gql`
  mutation {
    changePassword(
      input: {
        username: "${username}",
        currentPassword: "${currentPassword}",
        newPassword: "${newPassword}",
        confirmationPassword: "${confirmationPassword}"
      }
    )
  }
`;

export const getLogoutMutation = () => gql`
  mutation {
    logout
  }
`;


export const getAuthenticateMutation = (
  username: string,
  password: string
) => gql`
  mutation {
    authenticate(input: { username: "${username}", password: "${password}" }) {
      accessToken
      refreshToken
      clerkId 
    }
  }
`;


