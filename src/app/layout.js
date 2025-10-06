import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider, useUser } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";

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

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        
        <div>
          <Toaster position="top-right" />
          {children}
        </div>
      </body>
      
    </html>
    {/* <footer className="w-full bg-black text-white">
        Developed by Chirag Singhal
      </footer> */}
    </ClerkProvider>
  );
}
