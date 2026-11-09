"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GigForm from "./GigForm";
import PageSpinner from "@/components/common/PageSpinner";
import { ErrorPanel } from "./DashboardParts";
import { useAuth } from "@/hooks/useAuth";
import * as categoryService from "@/services/categoryService";
import * as gigService from "@/services/gigService";

export default function GigFormLoader({ id = null }) {
  const { user } = useAuth();
  const [state, setState] = useState({ phase: "loading", gig: null, categories: [], error: "" });

  useEffect(() => {
    let cancelled = false;

    Promise.all([categoryService.list(), id ? gigService.get(id) : Promise.resolve(null)])
      .then(([cats, gigRes]) => {
        if (cancelled) return;
        const gig = gigRes?.data.gig ?? null;

        if (gig && gig.freelancer?._id !== user._id) {
          setState({ phase: "forbidden", gig: null, categories: [], error: "" });
          return;
        }
        setState({ phase: "ready", gig, categories: cats.data.categories, error: "" });
      })
      .catch((err) => {
        if (!cancelled) setState({ phase: "error", gig: null, categories: [], error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [id, user._id]);

  if (state.phase === "loading") return <PageSpinner label="Loading gig..." />;
  if (state.phase === "error") return <ErrorPanel message={state.error} />;

  if (state.phase === "forbidden") {
    return (
      <div className="bg-error-container text-on-error-container p-space-lg">
        <p className="font-headline-sm text-headline-sm uppercase">This is not your gig</p>
        <p className="font-body-sm text-body-sm mt-1">You can only edit gigs that you created.</p>
        <Link href="/dashboard/gigs" className="inline-block mt-space-sm font-label-sm text-label-sm uppercase font-bold underline">
          Back to my gigs
        </Link>
      </div>
    );
  }

  return <GigForm key={state.gig?._id ?? "new"} gig={state.gig} categories={state.categories} />;
}