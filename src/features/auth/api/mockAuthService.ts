import type { AuthService } from "./authService";
import type { AuthResult } from "../types";

export const mockAuthService: AuthService = {
  async login(email: string, password: string): Promise<AuthResult> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (password !== "123456") {
      throw new Error("Credenciales inválidas.");
    }

    return {
      accessToken: "dummy-access-token",
      tokenType: "Bearer",
      email: email.trim(),
    };
  },
};
