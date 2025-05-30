import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  username: string;
  groupId: number;
  points: number;
}

export interface Group {
  id: number;
  name: string;
  inviteCode: string;
}

export interface AuthResponse {
  user: User;
  group: Group;
}

export const auth = {
  async login(username: string, password: string, groupCode: string): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/login", {
      username,
      password,
      groupCode,
    });
    return response.json();
  },

  async logout(): Promise<void> {
    await apiRequest("POST", "/api/auth/logout");
  },

  async getCurrentUser(): Promise<AuthResponse | null> {
    try {
      const response = await apiRequest("GET", "/api/auth/me");
      return response.json();
    } catch (error) {
      return null;
    }
  },

  async createGroup(name: string): Promise<Group> {
    const response = await apiRequest("POST", "/api/groups", { name });
    return response.json();
  },
};
