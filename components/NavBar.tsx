"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowUpRightIcon } from "@/components/Icons";

export function NavBar() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link href="/" className="brand">
          <span className="brand-mark">I</span>
          <span>Imvecto</span>
        </Link>

        <nav className="header-links" aria-label="Main navigation">
          <Link href="/explore">Explore</Link>
          <Link href="/agent">Agent</Link>
          {session && <Link href="/dashboard">My activity</Link>}
          {isAdmin && <Link href="/admin">Verify</Link>}
        </nav>

        <div className="header-actions">
          <Link href="/projects/new" className="nav-create">
            Start a project
            <ArrowUpRightIcon />
          </Link>
          {session ? (
            <button
              type="button"
              onClick={() => signOut()}
              className="text-btn"
            >
              Sign out
            </button>
          ) : (
            <Link href="/login" className="text-btn">
              Sign in
            </Link>
          )}

          <span className="wallet-slot wallet-control" aria-label="Connected account">
            <span className="wallet-label">Account</span>
            <ConnectButton />
          </span>
        </div>
      </div>
    </header>
  );
}
