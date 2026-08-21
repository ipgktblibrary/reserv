import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import AdminLayoutClient from "./AdminLayoutClient";
import { ThemeProvider } from "@/context/ThemeContext";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  // Check authorization
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (error || profile?.role !== "admin") {
    redirect("/signin");
  }

  return (
    <>
      <ThemeProvider>
        <AdminLayoutClient>{children}</AdminLayoutClient>
      </ThemeProvider>
    </>
  );
}
