import { redirect } from "next/navigation";
import { CrmShell } from "@/components/crm/crm-shell";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getSessionUser } from "@/lib/auth";

export default async function CrmDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/crm/login");
  }

  return (
    <TooltipProvider>
      <CrmShell>{children}</CrmShell>
      <Toaster theme="dark" richColors closeButton />
    </TooltipProvider>
  );
}
