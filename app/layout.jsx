import localFont from "next/font/local";
import "./globals.css";
const ArabicUI = localFont({ src: './fonts/DG-Gaza.ttf' })
const ArabicUI2 = localFont({ src: './fonts/LANTX.otf' })
const ArabicUI3 = localFont({ src: './fonts/Rubik.ttf' })
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

const abrilFatface = Abril_Fatface({
  subsets: ['latin'],
  weight: '400', // Adjust based on the font options
});

export const metadata = {
  title: "Walter White",
  description: "هدف منصتنا ان نخلي الكيمياء مجرد لعبة بالنسبالك ❤️",
};

export default function RootLayout({ children }) {
  return (
    
      <html lang="en">
        <body
          className={` dark:bg-slate-950  antialiased`}
        >




          <Header></Header>
          {children}

          <Footer></Footer>

        </body>
      </html>
     
  );
}
