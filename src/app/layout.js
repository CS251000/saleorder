import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import Head from "next/head";
import { UserProvider } from "@/context/UserContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "EeazyBeezy",
  description: "Make your business easy",
};
export const viewport = {
    initialScale: 1,
    width: 'device-width'
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        
        <div>
          <Toaster position="top-right" />
          <UserProvider>
          {children}
          </UserProvider>
        </div>
      </body>
      
    </html>
    {/* <footer className="w-full bg-black text-white">
        Developed by Chirag Singhal
      </footer> */}
    </ClerkProvider>
  );
}
