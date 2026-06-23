import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Nieuw wachtwoord · LekkerPlekje.com",
  robots: { index: false, follow: false },
};

export default function WachtwoordResettenPage() {
  return (
    <>
      <Header />
      <ResetPasswordForm />
      <Footer />
    </>
  );
}
