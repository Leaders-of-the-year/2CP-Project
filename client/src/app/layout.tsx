import type { Metadata } from "next";
import localFont from 'next/font/local'
import "@/app/styles/globals.css";
const sans = localFont({
  src: "../fonts/SF-Pro.ttf",
  display: "swap",
  variable: "--font-sans",

});



export const metadata: Metadata = {
  title: "Medical",
  description: "Welcome ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body

      >
        {children}
      </body>
    </html>
  );
}
