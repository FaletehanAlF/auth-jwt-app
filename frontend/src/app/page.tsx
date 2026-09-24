"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/login");
        return;
      }

      console.log(data);
    } catch (error) {
      console.error("Gagal menghubungi server:", error);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-4 py-12 sm:px-6">
      <div className="w-full max-w-[400px]">
        <p className="mb-5 text-center text-[13px] font-medium tracking-wide text-neutral-500">
          Auth JWT App
        </p>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-[22px] font-semibold tracking-tight text-neutral-900">
            Register
          </h1>

          <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">
            Buat akun baru
          </p>

          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-[13px] font-medium text-neutral-700"
              >
                Nama
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors duration-200 placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                placeholder="Masukkan nama"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-[13px] font-medium text-neutral-700"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors duration-200 placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                placeholder="Masukkan email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[13px] font-medium text-neutral-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition-colors duration-200 placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                placeholder="Masukkan password"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 active:bg-neutral-900"
            >
              Register
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-medium text-neutral-900 underline-offset-4 transition-colors duration-200 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
