"use client";

import { useState } from "react";
import { unlockAdmin } from "@/app/admin/actions";

export function AdminUnlockForm() {
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={async (formData) => {
        const result = await unlockAdmin(formData);
        if (result?.error) {
          setError(result.error);
        }
      }}
      className="space-y-4"
    >
      <label className="block text-sm font-medium text-gray-900" htmlFor="password">
        Parolă admin
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-400"
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
      >
        Intră
      </button>
    </form>
  );
}
