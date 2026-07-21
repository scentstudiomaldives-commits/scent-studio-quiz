import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Find Your Perfect Scent | Scent Studio",
  description: "A personal fragrance consultation — discover your perfect scent from Scent Studio's collection.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ivory font-sans antialiased">
        <div className="mx-auto min-h-screen max-w-md md:max-w-2xl lg:max-w-4xl">
          {children}
        </div>
      </body>
    </html>
  );
}
