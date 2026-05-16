import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fixr — Find local service providers",
  description:
    "Book trusted plumbers, electricians, mechanics and more near you",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
