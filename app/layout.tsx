import type { Metadata } from "next";
import { Providers } from "./providers";
import { NavBar } from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Imvecto",
  description: "Fund what matters. See what happens.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <NavBar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
