const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function request(path: string, options: any = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem("token");
    if (typeof window !== "undefined") window.location.href = "/auth";
    throw new Error("Unauthorized. Please log in again.");
  }

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `API Error: ${res.status}`);
  }

  return res.json();
}

export default {
  get: (path: string) => request(path),
  post: (path: string, body: any) =>
    request(path, { method: "POST", body: JSON.stringify(body) }),
};
