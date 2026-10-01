import type { AuthResult } from "../types";

export type AuthService = {
  login(email: string, password: string): Promise<AuthResult>;
};
