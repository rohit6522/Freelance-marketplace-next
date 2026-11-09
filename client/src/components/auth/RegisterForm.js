"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Icon from "@/components/ui/Icon";
import { FieldError, FormAlert, SquareCheckbox } from "./FormParts";
import { StrengthLabel, StrengthMeter } from "./PasswordStrength";
import { GithubIcon, GoogleIcon } from "./SocialIcons";
import { useAuth } from "@/hooks/useAuth";
import { applyApiErrors } from "@/lib/forms";
import { validatePassword } from "@/lib/password";
import { FOCUS_OPTIONS, DOMAIN_CHIPS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

const ROLE_CARDS = [
  {
    role: "client",
    icon: "business_center",
    tag: "Hire Talent",
    title: "Client / Engineering Lead",
    text: "Post technical gigs, place milestone-based orders, and hire rated engineers & designers with approval-based fund release.",
    footerLabel: "Buyer Escrow Mode",
    footerNote: "0% Upfront Post",
  },
  {
    role: "freelancer",
    icon: "terminal",
    tag: "Work & Sell",
    title: "Freelancer / Specialist",
    text: "Publish pre-scoped technical services, build a rated public profile, and receive milestone payouts as clients approve your work.",
    footerLabel: "Builder Workspace",
    footerNote: "Direct Settlement",
  },
];

const SUBMIT_TEXT = {
  generic: "Create Free Account & Start Booking",
  client: "Create Client Account & Hire Engineers",
  freelancer: "Create Developer Profile & Get Booked",
};

const inputClass = (hasError) =>
  cn(
    "w-full px-space-md py-2.5 bg-surface-container-lowest border text-on-surface font-body-md text-body-md focus:border-2 focus:border-on-surface focus:outline-none",
    hasError ? "border-error" : "border-outline"
  );

const oauthClass =
  "flex items-center justify-center gap-space-sm px-space-md py-3 bg-surface-container-lowest border border-on-surface text-on-surface hover:bg-surface-container-low transition-none shadow-[2px_2px_0px_#0b1c30] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-label-md text-label-md";

const REQUIRED_STAR = <span className="text-primary font-bold">*</span>;

export default function RegisterForm({ initialRole = null }) {
  const { register: signUp } = useAuth();
  const [role, setRole] = useState(initialRole ?? "client");
  const [roleChosen, setRoleChosen] = useState(Boolean(initialRole));
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState([]);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      primaryFocus: "fullstack",
      acceptTerms: false,
      marketingOptIn: false,
    },
    mode: "onTouched",
  });

  const password = watch("password");
  const acceptTerms = watch("acceptTerms");
  const marketingOptIn = watch("marketingOptIn");

  const chooseRole = (value) => {
    setRole(value);
    setRoleChosen(true);
  };

  const onSubmit = async (values) => {
    setFormErrors([]);
    try {
      const user = await signUp({
        name: `${values.firstName.trim()} ${values.lastName.trim()}`,
        email: values.email.trim(),
        password: values.password,
        role,
        primaryFocus: values.primaryFocus,
        acceptTerms: values.acceptTerms,
        marketingOptIn: values.marketingOptIn,
      });
      toast.success(`Account created. Welcome to GigCraft, ${user.name.split(" ")[0]}!`);
      // Redirect GuestOnly karta hai
    } catch (err) {
      if (err.status === 409) {
        setError("email", { type: "server", message: "An account with this email already exists. Try signing in instead." });
        return;
      }
      setFormErrors(
        applyApiErrors(err, setError, {
          name: "firstName",
          email: "email",
          password: "password",
          primaryFocus: "primaryFocus",
          acceptTerms: "acceptTerms",
        })
      );
    }
  };

  const comingSoon = (provider) =>
    toast.info(`${provider} sign-up is coming soon. Please complete the form below.`, { id: "oauth-soon" });

  return (
    <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant p-space-md sm:p-space-lg lg:p-space-xl shadow-[2px_2px_0px_#0b1c30]">
      {/* Header */}
      <div className="mb-space-lg border-b border-outline-variant pb-space-lg">
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Create your GigCraft account</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
          Join engineering teams and technical freelancers contracting through clear, milestone-based orders.
        </p>
      </div>

      {/* Role selector */}
      <div className="mb-space-lg">
        <span className="block font-label-md text-label-md text-on-surface uppercase tracking-wide mb-space-sm">
          Select Account Archetype
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md" role="group" aria-label="Account type">
          {ROLE_CARDS.map((card) => {
            const active = role === card.role;
            return (
              <button
                key={card.role}
                type="button"
                aria-pressed={active}
                onClick={() => chooseRole(card.role)}
                className={cn(
                  "text-left p-space-md transition-none relative flex flex-col justify-between",
                  active
                    ? "bg-surface-container-low border-2 border-primary"
                    : "bg-surface-container-lowest border border-outline-variant hover:border-on-surface"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-space-sm">
                    <div className="flex items-center gap-space-xs">
                      <Icon
                        name={card.icon}
                        className={cn("text-xl", active ? "text-primary" : "text-on-surface-variant")}
                      />
                      <span className="font-label-md text-label-md text-on-surface uppercase">{card.tag}</span>
                    </div>
                    <span
                      className={cn(
                        "w-4 h-4 flex items-center justify-center",
                        active
                          ? "bg-primary text-on-primary"
                          : "border border-outline-variant text-transparent"
                      )}
                    >
                      <Icon name="check" className="text-xs" />
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">{card.title}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">{card.text}</p>
                </div>
                <div className="mt-space-md pt-space-xs border-t border-outline-variant flex items-center justify-between">
                  <span
                    className={cn(
                      "font-label-sm text-label-sm font-bold uppercase",
                      active ? "text-primary" : "text-on-surface-variant"
                    )}
                  >
                    {card.footerLabel}
                  </span>
                  <span className="font-code-sm text-code-sm text-on-surface-variant">{card.footerNote}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* OAuth */}
      <div className="space-y-space-sm mb-space-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
          <button type="button" onClick={() => comingSoon("GitHub")} className={oauthClass}>
            <GithubIcon />
            <span>Sign up with GitHub</span>
          </button>
          <button type="button" onClick={() => comingSoon("Google")} className={oauthClass}>
            <GoogleIcon />
            <span>Sign up with Google</span>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-space-lg">
        <div className="w-full border-t border-outline-variant" />
        <span className="absolute bg-surface-container-lowest px-space-md font-code-sm text-code-sm uppercase tracking-widest text-on-surface-variant">
          OR COMPLETE REGISTRATION
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-space-md">
        {/* Names */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          <div>
            <label htmlFor="first-name" className="block font-label-md text-label-md text-on-surface mb-1">
              First Name {REQUIRED_STAR}
            </label>
            <input
              id="first-name"
              type="text"
              autoComplete="given-name"
              placeholder="Linus"
              aria-invalid={errors.firstName ? "true" : undefined}
              className={inputClass(errors.firstName)}
              {...register("firstName", {
                required: "First name is required",
                validate: (v) => v.trim().length > 0 || "First name is required",
                maxLength: { value: 29, message: "First name can be at most 29 characters" },
              })}
            />
            <FieldError message={errors.firstName?.message} />
          </div>
          <div>
            <label htmlFor="last-name" className="block font-label-md text-label-md text-on-surface mb-1">
              Last Name {REQUIRED_STAR}
            </label>
            <input
              id="last-name"
              type="text"
              autoComplete="family-name"
              placeholder="Torvalds"
              aria-invalid={errors.lastName ? "true" : undefined}
              className={inputClass(errors.lastName)}
              {...register("lastName", {
                required: "Last name is required",
                validate: (v) => v.trim().length > 0 || "Last name is required",
                maxLength: { value: 29, message: "Last name can be at most 29 characters" },
              })}
            />
            <FieldError message={errors.lastName?.message} />
          </div>
        </div>

        {/* Email */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="work-email" className="block font-label-md text-label-md text-on-surface">
              Work Email {REQUIRED_STAR}
            </label>
            <span className="font-code-sm text-code-sm text-on-surface-variant">Used to sign in</span>
          </div>
          <div className="relative">
            <input
              id="work-email"
              type="email"
              autoComplete="email"
              placeholder="engineer@enterprise.io"
              aria-invalid={errors.email ? "true" : undefined}
              className={cn(inputClass(errors.email), "pr-10")}
              {...register("email", {
                required: "Email is required",
                pattern: { value: EMAIL_PATTERN, message: "Please enter a valid email address" },
              })}
            />
            <div className="absolute right-3 top-3 text-on-surface-variant pointer-events-none">
              <Icon name="alternate_email" className="text-sm" />
            </div>
          </div>
          <FieldError message={errors.email?.message} />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password-input" className="block font-label-md text-label-md text-on-surface">
              Password {REQUIRED_STAR}
            </label>
            <StrengthLabel value={password} />
          </div>
          <div className="relative mb-2">
            <input
              id="password-input"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••••••••••"
              aria-invalid={errors.password ? "true" : undefined}
              className={cn(inputClass(errors.password), "tracking-wider pr-10")}
              {...register("password", {
                required: "Password is required",
                validate: validatePassword,
              })}
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

        {/* Domain focus */}
        <div>
          <label htmlFor="domain-select" className="block font-label-md text-label-md text-on-surface mb-1">
            Primary Domain Focus
          </label>
          <div className="relative mb-2">
            <select
              id="domain-select"
              className={cn(inputClass(errors.primaryFocus), "appearance-none")}
              {...register("primaryFocus")}
            >
              {FOCUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-3 text-on-surface">
              <Icon name="unfold_more" className="text-sm" />
            </div>
          </div>
          <FieldError message={errors.primaryFocus?.message} />
          <div className="flex flex-wrap gap-1.5">
            {DOMAIN_CHIPS.map((chip) => (
              <button
                key={chip.value}
                type="button"
                onClick={() => setValue("primaryFocus", chip.value, { shouldDirty: true })}
                className="px-2 py-1 bg-surface-container-low border border-outline-variant text-on-surface font-label-sm text-label-sm hover:border-on-surface"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-space-sm pt-space-xs">
          <SquareCheckbox
            id="terms-chk"
            checked={acceptTerms}
            error={errors.acceptTerms?.message}
            registration={register("acceptTerms", { required: "You must accept the terms to create an account" })}
          >
            I agree to the{" "}
            <Link href="/info/terms-of-service" target="_blank" className="text-on-surface font-bold underline hover:text-primary">
              GigCraft Terms of Service
            </Link>
            ,{" "}
            <Link href="/info/escrow-agreement" target="_blank" className="text-on-surface font-bold underline hover:text-primary">
              Escrow Agreement
            </Link>
            , and{" "}
            <Link href="/info/privacy-policy" target="_blank" className="text-on-surface font-bold underline hover:text-primary">
              Privacy Policy
            </Link>
            .
          </SquareCheckbox>

          <SquareCheckbox id="digest-chk" checked={marketingOptIn} registration={register("marketingOptIn")}>
            Send me occasional marketplace updates and new gig highlights.
          </SquareCheckbox>
        </div>

        {/* Submit */}
        <div className="pt-space-sm">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-space-lg bg-primary-container text-on-primary font-headline-sm text-headline-sm uppercase tracking-wide border border-primary-container hover:bg-primary transition-none shadow-[2px_2px_0px_#0b1c30] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-space-sm disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <span>{isSubmitting ? "Creating account..." : SUBMIT_TEXT[roleChosen ? role : "generic"]}</span>
            <Icon name={isSubmitting ? "sync" : "arrow_forward"} className={cn("text-lg", isSubmitting && "animate-spin")} />
          </button>

          {formErrors.length > 0 && (
            <FormAlert variant="error" className="mt-2">
              {formErrors.map((message) => (
                <p key={message}>{message}</p>
              ))}
            </FormAlert>
          )}
        </div>
      </form>

      {/* Login switcher */}
      <div className="mt-space-lg pt-space-md border-t border-outline-variant flex items-center justify-between gap-space-sm">
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          Already verified on the GigCraft node network?
        </span>
        <Link
          href="/login"
          className="font-label-md text-label-md text-primary font-bold hover:underline flex items-center gap-1"
        >
          <span>Log In</span>
          <Icon name="login" className="text-sm" />
        </Link>
      </div>
    </div>
  );
}