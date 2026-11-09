"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Icon from "@/components/ui/Icon";
import { FieldError, FormAlert } from "./FormParts";
import { StrengthLabel, StrengthMeter } from "./PasswordStrength";
import { useAuth } from "@/hooks/useAuth";
import * as authService from "@/services/authService";
import { applyApiErrors } from "@/lib/forms";
import { validatePassword } from "@/lib/password";
import { cn } from "@/lib/utils";

const inputClass = (hasError) =>
  cn(
    "w-full px-space-md py-2.5 pr-10 bg-surface-container-lowest border text-on-surface font-body-md text-body-md focus:border-2 focus:border-on-surface focus:outline-none tracking-wider",
    hasError ? "border-error" : "border-outline"
  );

export default function ResetPasswordForm({ token }) {
  const router = useRouter();
  const { refresh } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [formErrors, setFormErrors] = useState([]);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { password: "", confirmPassword: "" }, mode: "onTouched" });

  const password = watch("password");

  const onSubmit = async (values) => {
    setFormErrors([]);
    try {
      await authService.resetPassword(token, { password: values.password });
      await refresh(); // server ne cookie set kar di hai, session load karo
      toast.success("Password updated. You are now signed in.");
      router.replace("/dashboard");
    } catch (err) {
      const badToken =
        err.status === 400 && (/reset link/i.test(err.message) || err.details?.some((d) => d.field === "token"));
      if (badToken) {
        setLinkInvalid(true);
        return;
      }
      setFormErrors(applyApiErrors(err, setError, { password: "password" }));
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant shadow-[2px_2px_0px_#0b1c30] p-space-md sm:p-space-lg lg:p-space-xl">
      <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-surface-container-low border border-outline-variant mb-space-sm">
        <Icon name="key" className="text-primary text-sm" />
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold">
          CHOOSE A NEW PASSWORD
        </span>
      </div>
      <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
        Set a new password
      </h1>
      <p className="font-body-md text-body-md text-on-surface-variant mt-1 mb-space-lg">
        Pick a strong password you have not used elsewhere. You will be signed in right after.
      </p>

      {linkInvalid ? (
        <div className="space-y-space-md">
          <FormAlert variant="error">This reset link is invalid or has expired.</FormAlert>
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-1 font-label-md text-label-md text-primary font-bold hover:underline"
          >
            Request a new reset link
            <Icon name="arrow_forward" className="text-sm" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-space-md">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="new-password" className="block font-label-md text-label-md text-on-surface">
                New Password <span className="text-primary font-bold">*</span>
              </label>
              <StrengthLabel value={password} />
            </div>
            <div className="relative mb-2">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••••••••••"
                aria-invalid={errors.password ? "true" : undefined}
                className={inputClass(errors.password)}
                {...register("password", { required: "Password is required", validate: validatePassword })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface focus:outline-none"
              >
                <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-base" />
              </button>
            </div>
            <StrengthMeter value={password} />
            <FieldError message={errors.password?.message} />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block font-label-md text-label-md text-on-surface mb-1">
              Confirm Password <span className="text-primary font-bold">*</span>
            </label>
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••••••••••"
              aria-invalid={errors.confirmPassword ? "true" : undefined}
              className={inputClass(errors.confirmPassword)}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (v) => v === password || "Passwords do not match",
              })}
            />
            <FieldError message={errors.confirmPassword?.message} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-primary text-on-primary font-headline-sm text-headline-sm tracking-tight border border-primary hover:bg-primary-container transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <Icon name={isSubmitting ? "sync" : "lock_reset"} className={cn("text-xl", isSubmitting && "animate-spin")} />
            <span>{isSubmitting ? "Updating..." : "Update Password"}</span>
          </button>

          {formErrors.length > 0 && (
            <FormAlert variant="error">
              {formErrors.map((message) => (
                <p key={message}>{message}</p>
              ))}
            </FormAlert>
          )}
        </form>
      )}
    </div>
  );
}