
import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NotificationBell from "@/components/NotificationBell";
import LegalAcceptanceGate from "@/components/legal/LegalAcceptanceGate";

export const metadata: Metadata = {
  title: "Primely Content",
  description: "UGC Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        <Navbar />
        <NotificationBell />
        <LegalAcceptanceGate>{children}</LegalAcceptanceGate>
        <Footer />
      </body>
    </html>
  );
}