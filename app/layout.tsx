import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sotrd. — Find local service providers",
  description:
    "Book trusted service providers near you",
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
