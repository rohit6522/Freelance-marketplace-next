"use client";

import { useState } from "react";
import Link from "next/link";
import { get, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import Icon from "@/components/ui/Icon";
import { FormAlert } from "@/components/auth/FormParts";
import TagInput from "./TagInput";
import { Field, Section, inputClass } from "./FormKit";
import { PageHeader } from "./DashboardParts";
import { useAuth } from "@/hooks/useAuth";
import * as profileService from "@/services/profileService";
import { AVAILABILITY_LABELS, LANGUAGE_LEVEL_LABELS } from "@/lib/constants";

const str = (v) => (v == null ? "" : String(v));

const toForm = (p = {}) => ({
  title: str(p.title),
  bio: str(p.bio),
  location: str(p.location),
  timezone: str(p.timezone),
  experienceYears: p.experienceYears != null ? String(p.experienceYears) : "0",
  hourlyRate: p.hourlyRate ? String(p.hourlyRate) : "",
  weeklyHours: p.weeklyHours ? String(p.weeklyHours) : "40",
  availability: p.availability ?? "available",
  languages: (p.languages ?? []).map((l) => ({ name: l.name, level: l.level })),
  accreditations: (p.accreditations ?? []).map((a) => ({
    name: str(a.name),
    issuer: str(a.issuer),
    year: a.year ? String(a.year) : "",
    credentialId: str(a.credentialId),
  })),
  workHistory: (p.workHistory ?? []).map((w) => ({
    title: str(w.title),
    company: str(w.company),
    location: str(w.location),
    startYear: w.startYear ? String(w.startYear) : "",
    endYear: w.endYear ? String(w.endYear) : "",
    current: Boolean(w.current),
    description: str(w.description),
  })),
});

const isYear = (v) => Number.isInteger(Number(v)) && Number(v) >= 1970 && Number(v) <= 2100;

function validateProfile(v) {
  const problems = [];
  const add = (field, message) => problems.push({ field, message });

  if (v.title.trim().length > 100) add("title", "Title can be up to 100 characters");
  if (v.bio.trim().length > 1500) add("bio", "Bio can be up to 1500 characters");
  if (v.location.trim().length > 100) add("location", "Location can be up to 100 characters");
  if (v.timezone.trim().length > 40) add("timezone", "Timezone can be up to 40 characters");

  const years = Number(v.experienceYears);
  if (v.experienceYears === "" || !Number.isInteger(years) || years < 0 || years > 60) add("experienceYears", "Experience must be 0 to 60 years");
  if (v.hourlyRate !== "" && !(Number(v.hourlyRate) >= 0 && Number(v.hourlyRate) <= 10000)) add("hourlyRate", "Hourly rate must be 0 to 10000");
  const hours = Number(v.weeklyHours);
  if (v.weeklyHours === "" || !Number.isInteger(hours) || hours < 1 || hours > 80) add("weeklyHours", "Weekly hours must be 1 to 80");

  v.languages.forEach((l, i) => {
    if (!l.name.trim() || l.name.trim().length > 40) add(`languages.${i}.name`, `Language ${i + 1}: name is required (up to 40 characters)`);
  });

  v.accreditations.forEach((a, i) => {
    const n = i + 1;
    if (!a.name.trim() || a.name.trim().length > 120) add(`accreditations.${i}.name`, `Accreditation ${n}: name is required (up to 120 characters)`);
    if (a.issuer.trim().length > 120) add(`accreditations.${i}.issuer`, `Accreditation ${n}: issuer is up to 120 characters`);
    if (a.year !== "" && !isYear(a.year)) add(`accreditations.${i}.year`, `Accreditation ${n}: year must be 1970 to 2100`);
    if (a.credentialId.trim().length > 60) add(`accreditations.${i}.credentialId`, `Accreditation ${n}: credential ID is up to 60 characters`);
  });

  v.workHistory.forEach((w, i) => {
    const n = i + 1;
    if (!w.title.trim() || w.title.trim().length > 120) add(`workHistory.${i}.title`, `Role ${n}: title is required (up to 120 characters)`);
    if (!w.company.trim() || w.company.trim().length > 120) add(`workHistory.${i}.company`, `Role ${n}: company is required (up to 120 characters)`);
    if (w.location.trim().length > 120) add(`workHistory.${i}.location`, `Role ${n}: location is up to 120 characters`);
    if (!isYear(w.startYear)) add(`workHistory.${i}.startYear`, `Role ${n}: start year must be 1970 to 2100`);
    if (!w.current && w.endYear !== "") {
      if (!isYear(w.endYear)) add(`workHistory.${i}.endYear`, `Role ${n}: end year must be 1970 to 2100`);
      else if (isYear(w.startYear) && Number(w.endYear) < Number(w.startYear)) add(`workHistory.${i}.endYear`, `Role ${n}: end year cannot be before the start year`);
    }
    if (w.description.trim().length > 600) add(`workHistory.${i}.description`, `Role ${n}: description is up to 600 characters`);
  });

  return problems;
}

function RowShell({ children, onRemove, label }) {
  return (
    <div className="border border-outline-variant bg-surface-container-low p-space-sm relative">
      <button
        type="button"
        onClick={onRemove}
        aria-label={label}
        className="absolute top-2 right-2 w-8 h-8 border border-outline bg-surface-container-lowest flex items-center justify-center hover:bg-error hover:text-on-error hover:border-error"
      >
        <Icon name="delete" className="text-body-sm" />
      </button>
      {children}
    </div>
  );
}

const addBtn = "font-label-sm text-label-sm uppercase font-bold text-primary hover:underline disabled:opacity-50 disabled:no-underline";

export default function ProfileEditor() {
  const { user, freelancerProfile, refresh } = useAuth();
  const [skills, setSkills] = useState(freelancerProfile?.skills ?? []);
  const [problems, setProblems] = useState([]);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({ defaultValues: toForm(freelancerProfile ?? {}) });

  const languages = useFieldArray({ control, name: "languages" });
  const accreditations = useFieldArray({ control, name: "accreditations" });
  const workHistory = useFieldArray({ control, name: "workHistory" });
  const fieldError = (path) => get(errors, path)?.message;
  const bioLength = watch("bio")?.length ?? 0;

  const onSubmit = async (v) => {
    clearErrors();
    setProblems([]);

    const found = validateProfile(v);
    if (found.length > 0) {
      found.forEach((p) => setError(p.field, { type: "manual", message: p.message }));
      setProblems(found.map((p) => p.message));
      return;
    }

    const body = {
      title: v.title.trim(),
      bio: v.bio.trim(),
      skills,
      languages: v.languages.map((l) => ({ name: l.name.trim(), level: l.level })),
      experienceYears: Number(v.experienceYears),
      location: v.location.trim(),
      timezone: v.timezone.trim(),
      hourlyRate: v.hourlyRate === "" ? 0 : Number(v.hourlyRate),
      weeklyHours: Number(v.weeklyHours),
      availability: v.availability,
      accreditations: v.accreditations.map((a) => ({
        name: a.name.trim(),
        issuer: a.issuer.trim(),
        year: a.year === "" ? undefined : Number(a.year),
        credentialId: a.credentialId.trim(),
      })),
      workHistory: v.workHistory.map((w) => ({
        title: w.title.trim(),
        company: w.company.trim(),
        location: w.location.trim(),
        startYear: Number(w.startYear),
        endYear: w.current || w.endYear === "" ? undefined : Number(w.endYear),
        current: w.current,
        description: w.description.trim(),
      })),
    };

    setSaving(true);
    try {
      await profileService.update(body);
      await refresh();
      toast.success("Profile saved");
    } catch (err) {
      const details = err.details ?? [];
      setProblems(details.length > 0 ? [...new Set(details.map((d) => d.message))] : [err.message]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-space-lg">
      <PageHeader
        eyebrow="DASHBOARD // FREELANCER"
        title="Profile"
        subtitle="This is what clients see on your public profile. Complete profiles get more orders."
        action={
          <Link
            href={`/freelancers/${user._id}`}
            target="_blank"
            className="bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-label-sm px-space-md py-2.5 flex items-center gap-1 uppercase font-bold"
          >
            <Icon name="visibility" className="text-body-md" />
            View public profile
          </Link>
        }
      />

      {problems.length > 0 && (
        <FormAlert variant="error">
          <p className="font-bold mb-1">Please fix the following:</p>
          <ul className="list-disc pl-5">
            {problems.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </FormAlert>
      )}

      <Section eyebrow="01 // IDENTITY" title="About you">
        <Field label="Professional title" htmlFor="pf-title" error={fieldError("title")} hint="e.g. Senior Product & UI/UX Systems Designer">
          <input id="pf-title" maxLength={100} className={inputClass(fieldError("title"))} {...register("title")} />
        </Field>

        <Field label="Biography" htmlFor="pf-bio" error={fieldError("bio")} hint={`${bioLength}/1500`}>
          <textarea id="pf-bio" rows={5} maxLength={1500} className={inputClass(fieldError("bio"))} {...register("bio")} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          <Field label="Location" htmlFor="pf-location" error={fieldError("location")}>
            <input id="pf-location" maxLength={100} placeholder="Berlin, Germany" className={inputClass(fieldError("location"))} {...register("location")} />
          </Field>
          <Field label="Timezone" htmlFor="pf-tz" error={fieldError("timezone")}>
            <input id="pf-tz" maxLength={40} placeholder="UTC+1" className={inputClass(fieldError("timezone"))} {...register("timezone")} />
          </Field>
        </div>
      </Section>

      <Section eyebrow="02 // AVAILABILITY" title="Experience & availability">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <Field label="Years of experience" htmlFor="pf-years" error={fieldError("experienceYears")}>
            <input id="pf-years" type="number" min="0" max="60" step="1" className={inputClass(fieldError("experienceYears"))} {...register("experienceYears")} />
          </Field>
          <Field label="Hourly rate (USD)" htmlFor="pf-rate" error={fieldError("hourlyRate")} hint="Optional, shown as an indicator">
            <input id="pf-rate" type="number" min="0" max="10000" step="0.01" className={inputClass(fieldError("hourlyRate"))} {...register("hourlyRate")} />
          </Field>
          <Field label="Weekly hours cap" htmlFor="pf-hours" error={fieldError("weeklyHours")}>
            <input id="pf-hours" type="number" min="1" max="80" step="1" className={inputClass(fieldError("weeklyHours"))} {...register("weeklyHours")} />
          </Field>
          <Field label="Status" htmlFor="pf-avail">
            <select id="pf-avail" className={inputClass(false)} {...register("availability")}>
              {Object.entries(AVAILABILITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section eyebrow="03 // SKILLS" title="Skills" description="Up to 20. Skills that match your gig tags are highlighted on your profile.">
        <TagInput id="pf-skills" value={skills} onChange={setSkills} max={20} maxLength={40} placeholder="e.g. Figma, Next.js, Tailwind CSS" />
      </Section>

      <Section eyebrow="04 // LANGUAGES" title="Languages">
        {languages.fields.map((field, index) => (
          <RowShell key={field.id} onRemove={() => languages.remove(index)} label={`Remove language ${index + 1}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pr-10">
              <Field label="Language" htmlFor={`lang-${index}`} error={fieldError(`languages.${index}.name`)}>
                <input id={`lang-${index}`} maxLength={40} className={inputClass(fieldError(`languages.${index}.name`))} {...register(`languages.${index}.name`)} />
              </Field>
              <Field label="Level" htmlFor={`lang-level-${index}`}>
                <select id={`lang-level-${index}`} className={inputClass(false)} {...register(`languages.${index}.level`)}>
                  {Object.entries(LANGUAGE_LEVEL_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </RowShell>
        ))}
        <button type="button" disabled={languages.fields.length >= 10} onClick={() => languages.append({ name: "", level: "conversational" })} className={addBtn}>
          + Add language ({languages.fields.length}/10)
        </button>
      </Section>

      <Section eyebrow="05 // CREDENTIALS" title="Accreditations" description="Self-reported certifications. They are shown as listed, not audited.">
        {accreditations.fields.map((field, index) => (
          <RowShell key={field.id} onRemove={() => accreditations.remove(index)} label={`Remove accreditation ${index + 1}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pr-10">
              <Field label="Issuer" htmlFor={`acc-issuer-${index}`} error={fieldError(`accreditations.${index}.issuer`)}>
                <input id={`acc-issuer-${index}`} maxLength={120} placeholder="Nielsen Norman Group" className={inputClass(fieldError(`accreditations.${index}.issuer`))} {...register(`accreditations.${index}.issuer`)} />
              </Field>
              <Field label="Certification" htmlFor={`acc-name-${index}`} required error={fieldError(`accreditations.${index}.name`)}>
                <input id={`acc-name-${index}`} maxLength={120} className={inputClass(fieldError(`accreditations.${index}.name`))} {...register(`accreditations.${index}.name`)} />
              </Field>
              <Field label="Year" htmlFor={`acc-year-${index}`} error={fieldError(`accreditations.${index}.year`)}>
                <input id={`acc-year-${index}`} type="number" min="1970" max="2100" className={inputClass(fieldError(`accreditations.${index}.year`))} {...register(`accreditations.${index}.year`)} />
              </Field>
              <Field label="Credential ID" htmlFor={`acc-id-${index}`} error={fieldError(`accreditations.${index}.credentialId`)}>
                <input id={`acc-id-${index}`} maxLength={60} className={inputClass(fieldError(`accreditations.${index}.credentialId`))} {...register(`accreditations.${index}.credentialId`)} />
              </Field>
            </div>
          </RowShell>
        ))}
        <button type="button" disabled={accreditations.fields.length >= 10} onClick={() => accreditations.append({ name: "", issuer: "", year: "", credentialId: "" })} className={addBtn}>
          + Add accreditation ({accreditations.fields.length}/10)
        </button>
      </Section>

      <Section eyebrow="06 // CAREER" title="Work history">
        {workHistory.fields.map((field, index) => {
          const current = watch(`workHistory.${index}.current`);
          return (
            <RowShell key={field.id} onRemove={() => workHistory.remove(index)} label={`Remove role ${index + 1}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pr-10">
                <Field label="Job title" htmlFor={`wh-title-${index}`} required error={fieldError(`workHistory.${index}.title`)}>
                  <input id={`wh-title-${index}`} maxLength={120} className={inputClass(fieldError(`workHistory.${index}.title`))} {...register(`workHistory.${index}.title`)} />
                </Field>
                <Field label="Company" htmlFor={`wh-company-${index}`} required error={fieldError(`workHistory.${index}.company`)}>
                  <input id={`wh-company-${index}`} maxLength={120} className={inputClass(fieldError(`workHistory.${index}.company`))} {...register(`workHistory.${index}.company`)} />
                </Field>
                <Field label="Location" htmlFor={`wh-loc-${index}`} error={fieldError(`workHistory.${index}.location`)}>
                  <input id={`wh-loc-${index}`} maxLength={120} className={inputClass(fieldError(`workHistory.${index}.location`))} {...register(`workHistory.${index}.location`)} />
                </Field>
                <div className="grid grid-cols-2 gap-space-sm">
                  <Field label="Start year" htmlFor={`wh-start-${index}`} required error={fieldError(`workHistory.${index}.startYear`)}>
                    <input id={`wh-start-${index}`} type="number" min="1970" max="2100" className={inputClass(fieldError(`workHistory.${index}.startYear`))} {...register(`workHistory.${index}.startYear`)} />
                  </Field>
                  <Field label="End year" htmlFor={`wh-end-${index}`} error={fieldError(`workHistory.${index}.endYear`)}>
                    <input
                      id={`wh-end-${index}`}
                      type="number"
                      min="1970"
                      max="2100"
                      disabled={Boolean(current)}
                      placeholder={current ? "Present" : ""}
                      className={`${inputClass(fieldError(`workHistory.${index}.endYear`))} disabled:bg-surface-container disabled:cursor-not-allowed`}
                      {...register(`workHistory.${index}.endYear`)}
                    />
                  </Field>
                </div>
              </div>
              <label className="flex items-center gap-2 mt-space-sm cursor-pointer font-body-sm text-body-sm text-on-surface">
                <input type="checkbox" className="w-4 h-4 accent-primary rounded-none" {...register(`workHistory.${index}.current`)} />
                I currently work here
              </label>
              <div className="mt-space-sm pr-10">
                <Field label="Description" htmlFor={`wh-desc-${index}`} error={fieldError(`workHistory.${index}.description`)}>
                  <textarea id={`wh-desc-${index}`} rows={3} maxLength={600} className={inputClass(fieldError(`workHistory.${index}.description`))} {...register(`workHistory.${index}.description`)} />
                </Field>
              </div>
            </RowShell>
          );
        })}
        <button
          type="button"
          disabled={workHistory.fields.length >= 15}
          onClick={() => workHistory.append({ title: "", company: "", location: "", startYear: "", endYear: "", current: false, description: "" })}
          className={addBtn}
        >
          + Add role ({workHistory.fields.length}/15)
        </button>
      </Section>

      <div className="bg-surface-container-lowest shadow-sm p-space-md flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-space-lg py-2.5 bg-primary text-on-primary font-label-md text-label-md uppercase font-bold hover:bg-primary-container disabled:opacity-60 shadow-[2px_2px_0px_#0b1c30]"
        >
          {saving ? "Saving..." : "Save profile"}
        </button>
      </div>
    </form>
  );
}