"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ApproveButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    await fetch(`/api/admin/projects/${projectId}/approve`, { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={handleApprove} disabled={loading}>
      {loading ? "Approving..." : "Approve"}
    </button>
  );
}
