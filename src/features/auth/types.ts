export type LoginCredentials={
    email:string
    password:string
}

export interface LoggedInUser {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginData {
  accessToken: string;
  refreshToken: string;
  refreshTokenId: string;
  loggedInUser: LoggedInUser;
}
