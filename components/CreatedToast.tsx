"use client";

import { useRouter } from "next/navigation";
import { Toast } from "@/components/Toast";

export function CreatedToast() {
  const router = useRouter();

  return (
    <Toast
      message="Project submitted for verification."
      onDismiss={() => router.replace(window.location.pathname)}
    />
  );
}
