"use client";

import { useState } from "react";

export default function GuestReplyForm() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!message.trim()) {
      setError("Please enter a guest message.");
      return;
    }

    setLoading(true);
    setError("");
    setReply("");

    try {
      const response = await fetch("/api/generate-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }

      setReply(data.reply);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-xl space-y-8">
      <div className="space-y-2">
        <label htmlFor="guest-message" className="text-sm font-medium text-zinc-700">
          Guest message
        </label>
        <textarea
          id="guest-message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a guest message..."
          className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
        />
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Generating..." : "Generate Reply"}
      </button>

      {(reply || error) && (
        <section className="space-y-2">
          <h2 className="text-sm font-medium text-zinc-700">AI response</h2>
          <div
            className={`min-h-24 rounded-lg border px-4 py-3 text-sm leading-relaxed ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-zinc-200 bg-zinc-50 text-zinc-800"
            }`}
          >
            {error || reply}
          </div>
        </section>
      )}
    </div>
  );
}
