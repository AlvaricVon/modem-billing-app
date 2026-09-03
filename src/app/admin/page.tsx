"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { LogOut, Loader2, KeyRound, RefreshCw, Lock, Shield } from "lucide-react";

type Customer = Record<string, string | number>;

type View = "loading" | "login" | "table" | "error";

export default function AdminPage() {
  const [view, setView] = useState<View>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function getColumns(c: Customer[]): string[] {
    const cols: string[] = [];
    for (const item of c) {
      for (const key of Object.keys(item)) {
        if (!cols.includes(key)) cols.push(key);
      }
    }
    return cols;
  }

  async function loadData() {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/admin/data");
      if (res.status === 401) {
        setView("login");
        return;
      }
      if (!res.ok) {
        throw new Error("Gagal memuat data");
      }
      const body = await res.json();
      setCustomers(body.data);
      setView("table");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Terjadi kesalahan"
      );
      setView("error");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal login");
      }
      setPassword("");
      await loadData();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Terjadi kesalahan"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setView("login");
    setCustomers([]);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/check")
      .then((res) => res.json())
      .then((data: { authenticated?: boolean }) => {
        if (cancelled) return;
        if (data.authenticated) {
          return fetch("/api/admin/data")
            .then((res) => {
              if (res.status === 401) throw new Error("unauthorized");
              if (!res.ok) throw new Error("Gagal memuat data");
              return res.json();
            })
            .then((body: { data?: Customer[] }) => {
              if (cancelled) return;
              setCustomers(body.data ?? []);
              setView("table");
            });
        }
        setView("login");
      })
      .catch(() => {
        if (!cancelled) setView("login");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (view === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100">
        <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
      </div>
    );
  }

  if (view === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-zinc-900 text-white mb-4">
              <Shield className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Halaman Admin
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Masukkan kredensial untuk melihat data pelanggan
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-colors"
                  placeholder="Username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-colors"
                  placeholder="Password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Memeriksa..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Terjadi Kesalahan
          </h2>
          <p className="text-sm text-red-600 mb-4">{errorMessage}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={loadData}
              className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800"
            >
              Coba Lagi
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  const columns = getColumns(customers);

  return (
    <div className="min-h-screen bg-zinc-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Pelanggan</h1>
            <p className="text-sm text-gray-600 mt-1">
              Total {customers.length} pelanggan terdaftar
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-300 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {customers.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500">
            Belum ada data pelanggan.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 text-gray-700 text-xs uppercase">
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="px-4 py-3 font-semibold whitespace-nowrap">
                      {col.replace(/_/g, " ")}
                    </th>
                  ))}
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50">
                    {columns.map((col) => (
                      <td
                        key={col}
                        className="px-4 py-3 align-top whitespace-nowrap"
                      >
                        {String(c[col] ?? "-")}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <details className="relative">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800 text-xs font-medium">
                          Detail
                        </summary>
                        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
                          <dl className="space-y-2">
                            {columns.map((col) => (
                              <div key={col}>
                                <dt className="text-xs font-medium text-gray-500 uppercase">
                                  {col.replace(/_/g, " ")}
                                </dt>
                                <dd className="text-sm text-gray-800 break-words">
                                  {String(c[col] ?? "-")}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
