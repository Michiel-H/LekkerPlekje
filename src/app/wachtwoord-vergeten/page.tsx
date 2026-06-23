import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Wachtwoord vergeten · LekkerPlekje.com",
};

export default function WachtwoordVergetenPage() {
  return (
    <>
      <Header />
      <ForgotPasswordForm />
      <Footer />
    </>
  );
}
