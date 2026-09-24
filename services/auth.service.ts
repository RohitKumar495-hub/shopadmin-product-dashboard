import api from "@/lib/axios";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image?: string;
  gender?: string;
}

export interface LoginResponse extends AuthUser {
  accessToken: string;
  refreshToken?: string;
}

const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "user";
const REMEMBER_KEY = "rememberMe";

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(
      "/auth/login",
      payload
    );

    return response.data;
  },

  saveSession(data: LoginResponse, rememberMe: boolean) {
    const storage = rememberMe
      ? window.localStorage
      : window.sessionStorage;

    // Clear any previous session
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.removeItem(REMEMBER_KEY);

    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.removeItem(REMEMBER_KEY);

    // Save current session
    storage.setItem(ACCESS_TOKEN_KEY, data.accessToken);

    storage.setItem(
      USER_KEY,
      JSON.stringify({
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        image: data.image,
        gender: data.gender,
      })
    );

    storage.setItem(
      REMEMBER_KEY,
      String(rememberMe)
    );
  },

  logout() {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.removeItem(REMEMBER_KEY);

    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.removeItem(REMEMBER_KEY);
  },

  getToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return (
      window.localStorage.getItem(ACCESS_TOKEN_KEY) ||
      window.sessionStorage.getItem(ACCESS_TOKEN_KEY)
    );
  },

  getUser(): AuthUser | null {
    if (typeof window === "undefined") {
      return null;
    }

    const raw =
      window.localStorage.getItem(USER_KEY) ||
      window.sessionStorage.getItem(USER_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },
};