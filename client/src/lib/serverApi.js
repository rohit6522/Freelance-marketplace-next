import { cookies } from "next/headers";

const API_URL = process.env.API_URL || "http://localhost:5000";

// { status, data }: status 0 = API tak pahunch hi nahi paye
export async function serverRequest(path, { revalidate = 60, withCookies = false } = {}) {
  try {
    const init = withCookies ? { cache: "no-store", headers: {} } : { next: { revalidate } };

    if (withCookies) {
      const cookie = (await cookies()).toString();
      if (cookie) init.headers.cookie = cookie;
    }

    const res = await fetch(`${API_URL}/api${path}`, init);
    let json = null;
    try {
      json = await res.json();
    } catch {
      // body JSON nahi tha
    }
    return { status: res.status, data: res.ok ? json?.data ?? null : null };
  } catch {
    return { status: 0, data: null };
  }
}

export async function serverGet(path, options) {
  const { data } = await serverRequest(path, options);
  return data;
}