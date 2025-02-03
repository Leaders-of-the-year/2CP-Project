import { FooterLandingPage } from "@/app/footer";
import Header from "@/app/header";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        // className={`${sans.className} antialiased`}
      >
        <Header/>
        {children}
        <FooterLandingPage/>
      </body>
    </html>
  );
}
