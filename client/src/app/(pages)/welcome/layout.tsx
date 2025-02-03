import { FooterLandingPage } from "@/app/features/landingpage/footer/footer";
import Header from "@/app/features/landingpage/header/header";
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
