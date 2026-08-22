"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Toast } from "@/components/Toast";

export function ApproveButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  async function handleApprove() {
    setLoading(true);
    await fetch(`/api/admin/projects/${projectId}/approve`, { method: "POST" });
    setLoading(false);
    setShowToast(true);
  }

  return (
    <>
      <button onClick={handleApprove} disabled={loading}>
        {loading ? "Approving..." : "Approve"}
      </button>
      {showToast && (
        <Toast
          message="Project approved."
          onDismiss={() => {
            setShowToast(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
