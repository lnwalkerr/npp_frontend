import { AuthProvider } from "../auth-context";
import NavbarLayout from "@/components/navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <NavbarLayout>{children}</NavbarLayout>
    </AuthProvider>
  );
}
