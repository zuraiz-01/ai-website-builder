import DashboardLayout from "@/components/layout/DashboardLayout";
import { RequireAuth } from "@/hooks/useRequireAuth";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <DashboardLayout>{children}</DashboardLayout>
    </RequireAuth>
  );
}
