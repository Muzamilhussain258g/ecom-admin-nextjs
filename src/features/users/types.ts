export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export type UserSummary = User;

export interface ListUsersParams {
  page: number;
  limit: number;
  search?: string;
}

export type UsersListParams = ListUsersParams;

export interface UsersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UsersListData {
  users: User[];
  meta: {
    pagination: UsersPagination;
  };
}
