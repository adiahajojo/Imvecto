"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signIn("email", { email, redirect: false, callbackUrl: "/dashboard" });
    setSent(true);
  }

  if (sent) {
    return <p>Check your email for a sign in link.</p>;
  }

  return (
    <div>
      <h1>Sign in</h1>
      <p>
        No password needed. We send a one time link to your email. You only
        need to sign in to create a project or view your activity, not to
        browse.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        <button type="submit">Send sign in link</button>
      </form>
    </div>
  );
}
