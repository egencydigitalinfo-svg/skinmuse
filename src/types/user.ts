export type UserRole = "superAdmin" | "admin" | "customer";

export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string; // optional since frontend won’t usually store it
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterUser {
  name: string;
  email: string;
  password: string;
}

export interface LoginUser {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}
