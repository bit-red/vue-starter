import { z } from "zod";

/**
 * Example Zod schema — replace or remove this file.
 *
 * Usage with TanStack Form:
 *   import { zodValidator } from "@tanstack/zod-form-adapter";
 *   const form = useForm({
 *     validatorAdapter: zodValidator(),
 *     defaultValues: { email: "", password: "" },
 *   });
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
