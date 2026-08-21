import SignInForm from "@/features/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perpustakaan Zaaba Institut Perguruan Tuanku Bainun",
  description: "Perpustakaan Zaaba Institut Perguruan Tuanku Bainun",
};

export default function SignIn() {
  return <SignInForm />;
}
