import type { Metadata } from "next";
import { CrmDarkMode } from "@/components/crm/crm-dark-mode";

export const metadata: Metadata = {
  title: "CRM",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CrmLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="dark crm-root min-h-svh bg-background text-foreground antialiased">
      <CrmDarkMode />
      {children}
    </div>
  );
}
