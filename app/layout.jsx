import localFont from "next/font/local";
import "./globals.css";
const ArabicUI = localFont({ src: './fonts/DG-Gaza.ttf' })
const ArabicUI2 = localFont({ src: './fonts/LANTX.otf' })
const ArabicUI3 = localFont({ src: './fonts/Rubik.ttf' })
const ArabicUI4 = localFont({ src: './fonts/arabicc.otf' })
import { Anton } from 'next/font/google';


// Configure Anton font
const anton = Anton({
  subsets: ['latin'], // Include the subset you need
  weight: '400',      // Adjust weight if needed (Anton only has 400)
});

import { Rakkas } from 'next/font/google';

// Configure the font
const rakkas = Rakkas({
  subsets: ['latin'], // Choose the subset(s) you need
  weight: '400', // Specify the weight, if applicable
});
import { Abril_Fatface } from 'next/font/google';
import Footer from "./components/Footer";
import Header from "./components/Header";
import { SessionProvider } from "./components/SessionProvider";

const abrilFatface = Abril_Fatface({
  subsets: ['latin'],
  weight: '400', // Adjust based on the font options
});

export const metadata = {
  title: "حسام ميرة رياضيات | Hossam Mira Math",
  description: " شرح وحل تمارين مادة الرياضيات لطلاب الصفوف الثانوية الثلاثة بكل بساطة ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`bg-gradient-to-br from-blue-100 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 antialiased`}>
        <SessionProvider>
          <Header />
          {children}
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
