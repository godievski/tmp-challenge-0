export type AuthResult = {
  accessToken: string;
  tokenType: "Bearer";
  email: string;
};

export type AuthSession = AuthResult;

export type LoginCredentials = {
  email: string;
  password: string;
};
