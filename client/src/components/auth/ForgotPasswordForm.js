"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import Icon from "@/components/ui/Icon";
import { FieldError, FormAlert } from "./FormParts";
import * as authService from "@/services/authService";
import { applyApiErrors } from "@/lib/forms";
import { cn } from "@/lib/utils";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

// devResetUrl absolute hota hai, hume sirf path chahiye
const toPath = (url) => {
  try {
    const { pathname } = new URL(url);
    return pathname;
  } catch {
    return null;
  }
};

export default function ForgotPasswordForm() {
  const [result, setResult] = useState(null);
  const [formErrors, setFormErrors] = useState([]);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: "" }, mode: "onTouched" });

  const onSubmit = async ({ email }) => {
    setFormErrors([]);
    try {
      const res = await authService.forgotPassword({ email: email.trim() });
      setResult({ message: res.message, devPath: res.devResetUrl ? toPath(res.devResetUrl) : null });
    } catch (err) {
      setFormErrors(applyApiErrors(err, setError, { email: "email" }));
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant shadow-[2px_2px_0px_#0b1c30] p-space-md sm:p-space-lg lg:p-space-xl">
      <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-surface-container-low border border-outline-variant mb-space-sm">
        <Icon name="lock_reset" className="text-primary text-sm" />
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface font-semibold">
          ACCOUNT RECOVERY
        </span>
      </div>
      <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
        Reset your password
      </h1>
      <p className="font-body-md text-body-md text-on-surface-variant mt-1 mb-space-lg">
        Enter the email you registered with. We will create a secure link that is valid for 15 minutes.
      </p>

      {result ? (
        <div className="space-y-space-md">
          <FormAlert variant="success">{result.message}</FormAlert>

          {result.devPath && (
            <div className="p-space-md bg-surface-container-low border border-dashed border-outline">
              <p className="font-code-sm text-code-sm uppercase text-on-surface-variant mb-space-xs">
                Development only
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
                No email provider is configured, so the reset link is shown here instead of being emailed.
              </p>
              <Link
                href={result.devPath}
                className="inline-flex items-center gap-1 font-label-md text-label-md text-primary font-bold hover:underline"
              >
                Open reset link
                <Icon name="arrow_forward" className="text-sm" />
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setResult(null);
              reset();
            }}
            className="font-label-sm text-label-sm uppercase text-on-surface-variant hover:text-primary"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-space-md">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="forgot-email"
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
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="developer@agency.io"
                aria-invalid={errors.email ? "true" : undefined}
                className={cn(
                  "w-full bg-surface-container-lowest border px-3.5 py-2.5 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:border-on-surface focus:outline-none transition-colors",
                  errors.email ? "border-error" : "border-outline-variant"
                )}
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: EMAIL_PATTERN, message: "Please enter a valid email address" },
                })}
              />
            </div>
            <FieldError message={errors.email?.message} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-primary text-on-primary font-headline-sm text-headline-sm tracking-tight border border-primary hover:bg-primary-container transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <Icon name={isSubmitting ? "sync" : "mail"} className={cn("text-xl", isSubmitting && "animate-spin")} />
            <span>{isSubmitting ? "Sending..." : "Send Reset Link"}</span>
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

      <div className="mt-space-lg pt-space-md border-t border-outline-variant">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-label-md text-label-md text-primary font-bold hover:underline"
        >
          <Icon name="arrow_back" className="text-sm" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}