"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function NavBar() {
  const { data: session } = useSession();

  return (
    <nav>
      <Link href="/">Imvecto</Link>
      <Link href="/explore">Explore</Link>

      {session ? (
        <>
          <Link href="/projects/new">Create project</Link>
          <Link href="/dashboard">My activity</Link>
          {(session.user as any)?.role === "ADMIN" && (
            <Link href="/admin">Verify projects</Link>
          )}
          <button onClick={() => signOut()}>Sign out</button>
        </>
      ) : (
        <Link href="/login">Sign in</Link>
      )}

      <ConnectButton />
    </nav>
  );
}
