const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function request(path: string, options: any = {}) {
  const token = (typeof window !== "undefined") ? localStorage.getItem("token") : null;
  const headers: any = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (res.status === 401) {
    // unauthorized -> redirect to auth
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/auth";
    }
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    // try to extract message
    let msg = `API error ${res.status}`;
    try { const j = await res.json(); msg = j?.message || JSON.stringify(j); } catch(e) {}
    throw new Error(msg);
  }
  return res.json();
}

export default {
  get: (path: string) => request(path),
  post: (path: string, body: any) =>
    request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path: string, body: any) =>
    request(path, { method: "PUT", body: JSON.stringify(body) }),
  del: (path: string) => request(path, { method: "DELETE" })
};
