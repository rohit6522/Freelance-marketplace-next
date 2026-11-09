"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Avatar from "@/components/ui/Avatar";
import Icon from "@/components/ui/Icon";
import { FieldError, FormAlert } from "@/components/auth/FormParts";
import { StrengthLabel, StrengthMeter } from "@/components/auth/PasswordStrength";
import { PageHeader } from "./DashboardParts";
import { useAuth } from "@/hooks/useAuth";
import * as authService from "@/services/authService";
import * as uploadService from "@/services/uploadService";
import { applyApiErrors } from "@/lib/forms";
import { validatePassword } from "@/lib/password";
import { cn, formatMonthYear } from "@/lib/utils";

const inputClass = (hasError) =>
  cn(
    "w-full px-space-md py-2.5 bg-surface-container-lowest border text-on-surface font-body-md text-body-md focus:border-2 focus:border-on-surface focus:outline-none",
    hasError ? "border-error" : "border-outline"
  );

function Card({ title, eyebrow, children }) {
  return (
    <section className="bg-surface-container-lowest shadow-sm">
      <div className="p-space-md border-b border-outline-variant">
        <span className="font-code-sm text-code-sm text-primary uppercase font-bold block">{eyebrow}</span>
        <h2 className="font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface">{title}</h2>
      </div>
      <div className="p-space-md">{children}</div>
    </section>
  );
}

/* ------------------------------ Photo ------------------------------ */

function PhotoCard() {
  const { user, refresh } = useAuth();
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const problem = uploadService.validateAvatar(file);
    if (problem) return toast.error(problem);

    setBusy(true);
    try {
      await uploadService.uploadAvatar(file);
      await refresh();
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await uploadService.removeAvatar();
      await refresh();
      toast.success("Profile photo removed");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card eyebrow="ACCOUNT // PHOTO" title="Profile Photo">
      <div className="flex flex-wrap items-center gap-space-md">
        <Avatar user={user} size="w-20 h-20" shape="square" />
        <div className="space-y-space-xs">
          <div className="flex flex-wrap gap-space-xs">
            <label
              className={cn(
                "bg-primary text-on-primary font-label-sm text-label-sm uppercase font-bold px-space-md py-2 cursor-pointer hover:bg-primary-container transition-colors flex items-center gap-1",
                busy && "opacity-60 pointer-events-none"
              )}
            >
              <Icon name={busy ? "sync" : "upload"} className={cn("text-body-sm", busy && "animate-spin")} />
              {busy ? "Working..." : "Upload photo"}
              <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={upload} className="sr-only" />
            </label>
            {user.avatar?.url && (
              <button
                type="button"
                onClick={remove}
                disabled={busy}
                className="px-space-md py-2 border border-outline font-label-sm text-label-sm uppercase hover:bg-error hover:text-on-error hover:border-error disabled:opacity-60"
              >
                Remove
              </button>
            )}
          </div>
          <p className="font-code-sm text-code-sm text-on-surface-variant">JPG, PNG or WebP, up to 2 MB.</p>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------ Profile ------------------------------ */

function ProfileCard() {
  const { user, refresh } = useAuth();
  const [formErrors, setFormErrors] = useState([]);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    defaultValues: { name: user.name, country: user.country ?? "", companyName: user.companyName ?? "" },
    mode: "onTouched",
  });

  const onSubmit = async (values) => {
    setFormErrors([]);
    try {
      const payload = { name: values.name.trim(), country: values.country.trim() };
      if (user.role === "client") payload.companyName = values.companyName.trim();

      await authService.updateMe(payload);
      await refresh();
      reset(values);
      toast.success("Profile updated");
    } catch (err) {
      setFormErrors(applyApiErrors(err, setError, { name: "name", country: "country", companyName: "companyName" }));
    }
  };

  return (
    <Card eyebrow="ACCOUNT // PROFILE" title="Personal Details">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-space-md">
        <div>
          <label htmlFor="set-name" className="block font-label-md text-label-md text-on-surface mb-1">
            Full name <span className="text-primary font-bold">*</span>
          </label>
          <input
            id="set-name"
            type="text"
            autoComplete="name"
            aria-invalid={errors.name ? "true" : undefined}
            className={inputClass(errors.name)}
            {...register("name", {
              required: "Name is required",
              validate: (v) => (v.trim().length >= 2 && v.trim().length <= 60) || "Name must be 2 to 60 characters",
            })}
          />
          <FieldError message={errors.name?.message} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          <div>
            <label htmlFor="set-country" className="block font-label-md text-label-md text-on-surface mb-1">Country</label>
            <input
              id="set-country"
              type="text"
              autoComplete="country-name"
              className={inputClass(errors.country)}
              {...register("country", { maxLength: { value: 60, message: "Country is too long" } })}
            />
            <FieldError message={errors.country?.message} />
          </div>

          {user.role === "client" && (
            <div>
              <label htmlFor="set-company" className="block font-label-md text-label-md text-on-surface mb-1">Company</label>
              <input
                id="set-company"
                type="text"
                autoComplete="organization"
                className={inputClass(errors.companyName)}
                {...register("companyName", { maxLength: { value: 100, message: "Company name is too long" } })}
              />
              <FieldError message={errors.companyName?.message} />
            </div>
          )}
        </div>

        <div className="bg-surface-container-low p-space-sm grid grid-cols-1 sm:grid-cols-3 gap-space-sm font-code-sm text-code-sm">
          {[
            ["EMAIL", user.email],
            ["ROLE", user.role.toUpperCase()],
            ["MEMBER SINCE", formatMonthYear(user.createdAt).toUpperCase()],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0">
              <span className="text-on-surface-variant block text-[11px]">{label}</span>
              <span className="text-on-surface font-bold break-words">{value}</span>
            </div>
          ))}
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Email and role cannot be changed in this version.</p>

        {formErrors.length > 0 && (
          <FormAlert variant="error">
            {formErrors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </FormAlert>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="bg-primary text-on-primary font-label-md text-label-md uppercase font-bold px-space-lg py-2.5 hover:bg-primary-container transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
      </form>
    </Card>
  );
}

/* ------------------------------ Password ------------------------------ */

function PasswordCard() {
  const [show, setShow] = useState(false);
  const [formErrors, setFormErrors] = useState([]);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" }, mode: "onTouched" });

  const currentPassword = watch("currentPassword");
  const newPassword = watch("newPassword");

  const onSubmit = async (values) => {
    setFormErrors([]);
    try {
      await authService.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      toast.success("Password changed");
      reset();
    } catch (err) {
      if (err.status === 401) {
        setError("currentPassword", { type: "server", message: "Current password is incorrect" });
        return;
      }
      setFormErrors(applyApiErrors(err, setError, { newPassword: "newPassword", currentPassword: "currentPassword" }));
    }
  };

  const type = show ? "text" : "password";

  return (
    <Card eyebrow="ACCOUNT // SECURITY" title="Change Password">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-space-md max-w-xl">
        <div>
          <label htmlFor="cur-pass" className="block font-label-md text-label-md text-on-surface mb-1">Current password</label>
          <input
            id="cur-pass"
            type={type}
            autoComplete="current-password"
            aria-invalid={errors.currentPassword ? "true" : undefined}
            className={inputClass(errors.currentPassword)}
            {...register("currentPassword", { required: "Enter your current password" })}
          />
          <FieldError message={errors.currentPassword?.message} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="new-pass" className="block font-label-md text-label-md text-on-surface">New password</label>
            <StrengthLabel value={newPassword} />
          </div>
          <div className="relative mb-2">
            <input
              id="new-pass"
              type={type}
              autoComplete="new-password"
              aria-invalid={errors.newPassword ? "true" : undefined}
              className={cn(inputClass(errors.newPassword), "pr-10")}
              {...register("newPassword", {
                required: "Enter a new password",
                validate: (v) => (v === currentPassword ? "New password must be different from the current one" : validatePassword(v)),
              })}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide passwords" : "Show passwords"}
              className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface"
            >
              <Icon name={show ? "visibility_off" : "visibility"} className="text-base" />
            </button>
          </div>
          <StrengthMeter value={newPassword} />
          <FieldError message={errors.newPassword?.message} />
        </div>

        <div>
          <label htmlFor="conf-pass" className="block font-label-md text-label-md text-on-surface mb-1">Confirm new password</label>
          <input
            id="conf-pass"
            type={type}
            autoComplete="new-password"
            aria-invalid={errors.confirmPassword ? "true" : undefined}
            className={inputClass(errors.confirmPassword)}
            {...register("confirmPassword", {
              required: "Please confirm the new password",
              validate: (v) => v === newPassword || "Passwords do not match",
            })}
          />
          <FieldError message={errors.confirmPassword?.message} />
        </div>

        {formErrors.length > 0 && (
          <FormAlert variant="error">
            {formErrors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </FormAlert>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-on-primary font-label-md text-label-md uppercase font-bold px-space-lg py-2.5 hover:bg-primary-container transition-colors disabled:opacity-60"
        >
          {isSubmitting ? "Updating..." : "Update password"}
        </button>
      </form>
    </Card>
  );
}

export default function SettingsForms() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader
        eyebrow={`DASHBOARD // ${user.role.toUpperCase()}`}
        title="Account Settings"
        subtitle="Manage your photo, personal details and password."
      />
      <PhotoCard />
      <ProfileCard />
      <PasswordCard />
    </>
  );
}