"use client";

import { FormEvent, useState } from "react";

export default function RegisterPage() {
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

    console.log(data);
  } catch (error) {
    console.error("Gagal menghubungi server:", error);
  }
};

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-gray-900">
          Register
        </h1>

        <p className="mt-2 text-gray-600">
          Buat akun baru
        </p>

        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Nama
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border px-4 py-2 outline-none"
              placeholder="Masukkan nama"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border px-4 py-2 outline-none"
              placeholder="Masukkan email"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border px-4 py-2 outline-none"
              placeholder="Masukkan password"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-black px-4 py-2 font-medium text-white"
          >
            Register
          </button>
        </form>
      </div>
    </main>
  );
}