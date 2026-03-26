-- Los códigos OTP pasan a almacenarse en Supabase (tabla public.password_reset_codes).
DROP TABLE IF EXISTS "PasswordResetCode";
