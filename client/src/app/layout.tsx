import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import Navbar from "./navbar"; // Make sure this path is correct

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Real Estate NFT Marketplace",
  description: "A marketplace for real estate NFTs",
  icons: {
    icon: [
      { url: '/thirdweb.png' },
      { url: '/thirdweb-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/thirdweb-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
  },  
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}