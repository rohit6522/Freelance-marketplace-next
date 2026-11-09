"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import ContactModal from "./ContactModal";

const ProfileContext = createContext(null);

export function ProfileProvider({ freelancer, gigs, children }) {
  const { status, user } = useAuth();
  const router = useRouter();
  const [contact, setContact] = useState({ open: false, mode: "message", topic: "" });

  const requestContact = useCallback(
    (options = {}) => {
      if (status === "unauthenticated") {
        const next = window.location.pathname + window.location.search;
        router.push(`/login?next=${encodeURIComponent(next)}`);
        return;
      }
      if (status !== "authenticated") return;
      if (user.role !== "client") {
        toast.info("Only client accounts can message sellers. Freelancers reply from Messages.", { id: "contact-role" });
        return;
      }
      setContact({ open: true, mode: options.mode ?? "message", topic: options.topic ?? "" });
    },
    [status, user, router]
  );

  const closeContact = useCallback(() => setContact((c) => ({ ...c, open: false })), []);
  const value = useMemo(() => ({ freelancer, requestContact }), [freelancer, requestContact]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
      <ContactModal
        open={contact.open}
        mode={contact.mode}
        topic={contact.topic}
        freelancer={freelancer}
        gigs={gigs}
        onClose={closeContact}
      />
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside <ProfileProvider>");
  return ctx;
}