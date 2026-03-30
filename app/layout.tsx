import { Inter } from "next/font/google";
import "./globals.css";
import dynamic from 'next/dynamic';

const inter = Inter({ subsets:["latin"] });

const Providers = dynamic(() => import("../components/Providers"), {
  ssr: false,
});

export const metadata = {
  title: "Empyreans | Genesis Collection Dashboard",
  description: "Experience the next dimension of digital ownership on MultiversX.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${inter.className} bg-mvxdark text-mvxtext min-h-screen selection:bg-mvxteal selection:text-black`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
