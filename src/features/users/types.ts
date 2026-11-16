export interface UserSummary {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsersListParams {
  page: number;
  limit: number;
  search?: string;
}

export interface UsersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UsersListData {
  users: UserSummary[];
  meta: {
    pagination: UsersPagination;
  };
}
