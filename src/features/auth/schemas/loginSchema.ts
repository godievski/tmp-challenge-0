import { z } from "zod";
import type { LoginCredentials } from "../types";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Ingresa tu email.")
    .pipe(z.email("Ingresa un email válido.")),
  password: z.string().min(1, "Ingresa tu contraseña."),
}) satisfies z.ZodType<LoginCredentials>;
