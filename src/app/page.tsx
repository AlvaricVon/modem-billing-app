"use client";

import type React from "react";
import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

type SubmitStatus = "idle" | "loading" | "success" | "error";

export default function ModemBillingForm() {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal mengirim data");
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-2 text-center text-3xl font-bold text-gray-900">
            Form Data Modem & Billing
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Silakan isi data lengkap modem dan billing di bawah ini
          </p>
        </div>

        {status === "success" && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span>Data berhasil dikirim! Tim kami akan menghubungi Anda.</span>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <XCircle className="h-5 w-5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Pelanggan
              </label>
              <input
                type="text"
                name="nama_pelanggan"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Contoh: John Doe"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. Pelanggan / Tagihan
              </label>
              <input
                type="text"
                name="no_pelanggan"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Contoh: PEL-001"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SSID (Network Name)
              </label>
              <input
                type="text"
                name="ssid"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Contoh: Indosarana-Home"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password WiFi
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Minimal 8 karakter"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. HP
              </label>
              <input
                type="tel"
                name="no_hp"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Contoh: 081234567890"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gmail
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Contoh: email@gmail.com"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paket Internet
              </label>
              <select
                name="paket_internet"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="">Pilih paket</option>
                <option value="10mbps">10 Mbps</option>
                <option value="20mbps">20 Mbps</option>
                <option value="50mbps">50 Mbps</option>
                <option value="100mbps">100 Mbps</option>
                <option value="200mbps">200 Mbps</option>
                <option value="custom">Custom / Paket Khusus</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Instalasi
              </label>
              <input
                type="date"
                name="tanggal_instalasi"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device Modem
              </label>
              <input
                type="text"
                name="device_modem"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Contoh: TP-Link Archer C6"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat Lengkap
              </label>
              <textarea
                name="alamat"
                rows={3}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                placeholder="Masukkan alamat lengkap (jalan, kelurahan, kecamatan, kabupaten/kota, kode pos)"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catatan (Opsional)
              </label>
              <textarea
                name="catatan"
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-y"
                placeholder="Masukkan catatan tambahan jika ada..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === "loading" ? "Mengirim..." : "Kirim Data"}
          </button>
        </form>
      </div>
    </div>
  );
}
