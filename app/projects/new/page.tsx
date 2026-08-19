"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewProjectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("BUILD");
  const [location, setLocation] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return (
      <div>
        <p>You need to sign in before creating a project.</p>
        <Link href="/login">Sign in</Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        category,
        location,
        targetAmount,
        tokenSymbol,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
      return;
    }

    const data = await res.json();
    router.push(`/projects/${data.project.id}`);
  }

  return (
    <div>
      <h1>Create a project</h1>
      <p>
        Your project goes to an admin for verification before it shows up
        publicly.
      </p>

      <form onSubmit={handleSubmit}>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>

        <label>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>

        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="CARE">Care</option>
            <option value="BUILD">Build</option>
            <option value="INFRASTRUCTURE">Infrastructure</option>
          </select>
        </label>

        <label>
          Location
          <input value={location} onChange={(e) => setLocation(e.target.value)} required />
        </label>

        <label>
          Funding target (USD)
          <input
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            required
          />
        </label>

        <label>
          Token symbol (2 to 5 letters, category based, not a person's name)
          <input
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
            maxLength={5}
            required
          />
        </label>

        {error && <p>{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit for verification"}
        </button>
      </form>
    </div>
  );
}
