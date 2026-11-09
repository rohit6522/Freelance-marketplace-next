"use client";

import { useCallback, useEffect, useState } from "react";

export function useApiData(fetcher) {
  const [state, setState] = useState({ data: null, error: "", loading: true });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const res = await fetcher();
      setState({ data: res.data, error: "", loading: false });
    } catch (err) {
      setState((s) => ({ data: s.data, error: err.message, loading: false }));
    }
  }, [fetcher]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}