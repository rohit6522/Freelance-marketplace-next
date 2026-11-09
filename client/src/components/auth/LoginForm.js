"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Icon from "@/components/ui/Icon";
import { FieldError, FormAlert } from "./FormParts";
import { GithubIcon, GoogleIcon } from "./SocialIcons";
import { useAuth } from "@/hooks/useAuth";
import { applyApiErrors } from "@/lib/forms";
import { cn } from "@/lib/utils";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

const inputClass = (hasError) =>
  cn(
    "w-full bg-surface-container-lowest border px-3.5 py-2.5 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-on-surface focus:outline-none transition-colors",
    hasError ? "border-error" : "border-outline-variant"
  );

const oauthClass =
  "group flex items-center justify-center gap-space-sm px-4 py-3 bg-surface-container-lowest border border-on-surface hover:bg-surface-container-low transition-all text-on-surface font-label-md text-label-md";

export default function LoginForm() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState([]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: "", password: "", rememberMe: true },
    mode: "onTouched",
  });

  const onSubmit = async (values) => {
    setFormErrors([]);
    try {
      const user = await login({
        email: values.email.trim(),
        password: values.password,
        rememberMe: values.rememberMe,
      });
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      // Redirect GuestOnly karta hai jab session authenticated ho jata hai
    } catch (err) {
      setFormErrors(applyApiErrors(err, setError, { email: "email", password: "password" }));
    }
  };

  const comingSoon = (provider) =>
    toast.info(`${provider} sign-in is coming soon. Please use your email and password.`, { id: "oauth-soon" });

  return (
    <div className="lg:col-span-7 p-space-md sm:p-space-lg lg:p-space-xl flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-outline-variant">
      <div>
        {/* Header */}
        <div className="mb-space-lg">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-surface-container-low border border-outline-variant mb-space-sm">
            <Icon name="security" filled className="text-primary text-sm" />
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold">
              SECURE ESCROW AUTHENTICATION
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
            Sign in to GigCraft
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Access your digital contracts, active sprints, and milestone disbursements.
          </p>
        </div>

        {/* OAuth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mb-space-lg">
          <button type="button" onClick={() => comingSoon("GitHub")} className={oauthClass}>
            <GithubIcon className="w-5 h-5 fill-current text-on-surface" />
            <span>GitHub Workspace</span>
          </button>
          <button type="button" onClick={() => comingSoon("Google")} className={oauthClass}>
            <GoogleIcon />
            <span>Google Cloud Identity</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-space-lg">
          <div className="w-full border-t border-outline-variant" />
          <span className="absolute px-3 bg-surface-container-lowest font-code-sm text-code-sm text-on-surface-variant uppercase tracking-wider">
            Or with Work Email
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-space-md">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-email"
              className="flex items-center justify-between font-label-sm text-label-sm text-on-surface uppercase font-semibold"
            >
              <span>Corporate Email</span>
              <span className="text-on-surface-variant font-code-sm">REQUIRED</span>
            </label>
            <div className="relative flex">
              <span className="inline-flex items-center px-3.5 bg-surface-container-low border border-r-0 border-outline-variant text-on-surface-variant">
                <Icon name="alternate_email" className="text-lg" />
              </span>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="developer@agency.io"
                aria-invalid={errors.email ? "true" : undefined}
                aria-describedby={errors.email ? "login-email-error" : undefined}
                className={inputClass(errors.email)}
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: EMAIL_PATTERN, message: "Please enter a valid email address" },
                })}
              />
            </div>
            <FieldError id="login-email-error" message={errors.email?.message} />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="font-label-sm text-label-sm text-on-surface uppercase font-semibold"
              >
                Access Key / Password
              </label>
              <Link
                href="/forgot-password"
                className="font-label-sm text-label-sm text-primary hover:text-primary-container font-semibold transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative flex">
              <span className="inline-flex items-center px-3.5 bg-surface-container-low border border-r-0 border-outline-variant text-on-surface-variant">
                <Icon name="key" className="text-lg" />
              </span>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••••••••••"
                aria-invalid={errors.password ? "true" : undefined}
                aria-describedby={errors.password ? "login-password-error" : undefined}
                className={cn(inputClass(errors.password), "border-r-0")}
                {...register("password", { required: "Password is required" })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="px-3.5 bg-surface-container-low border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors flex items-center"
              >
                <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-lg" />
              </button>
            </div>
            <FieldError id="login-password-error" message={errors.password?.message} />
          </div>

          {/* Keep signed in */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded-none accent-primary border border-on-surface cursor-pointer"
                {...register("rememberMe")}
              />
              <span className="font-body-sm text-body-sm text-on-surface">Keep me signed in on this hardware</span>
            </label>
            <span className="inline-flex items-center gap-1 font-code-sm text-code-sm text-primary px-2 py-0.5 bg-surface-container-low border border-outline-variant font-medium">
              <Icon name="shield" className="text-xs" />
              Secure Session
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-primary text-on-primary font-headline-sm text-headline-sm tracking-tight border border-primary hover:bg-primary-container transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <Icon name="login" className="text-xl" />
            <span>Sign In to Workspace</span>
          </button>
        </form>

        {/* Status area */}
        {isSubmitting && (
          <FormAlert variant="loading" className="mt-space-md">
            Signing you in securely...
          </FormAlert>
        )}
        {!isSubmitting && formErrors.length > 0 && (
          <FormAlert variant="error" className="mt-space-md">
            {formErrors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </FormAlert>
        )}
      </div>

      {/* Footer routing */}
      <div className="mt-space-xl pt-space-md border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-space-sm">
        <div className="font-body-sm text-body-sm text-on-surface-variant">Don&apos;t have an enterprise account?</div>
        <div className="flex items-center gap-space-sm">
          <Link
            href="/register?role=client"
            className="px-3 py-1.5 bg-surface-container-low border border-outline-variant font-label-sm text-label-sm uppercase font-semibold text-primary hover:bg-primary hover:text-on-primary hover:border-primary transition-all"
          >
            Sign Up as Client
          </Link>
          <Link
            href="/register?role=freelancer"
            className="px-3 py-1.5 bg-surface-container-low border border-outline-variant font-label-sm text-label-sm uppercase font-semibold text-on-surface hover:bg-on-surface hover:text-surface-container-lowest hover:border-on-surface transition-all"
          >
            Apply as Freelancer
          </Link>
        </div>
      </div>
    </div>
  );
}