import { Inter } from "next/font/google";
import { Nunito } from "next/font/google";

// Non variable fonts.
// you have to specify array of weight

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
})


// For variable fonts.
// you have to specify weight= "variable" value only.

const nunito = Nunito({
    subsets: ['latin'],
    variable: '--font-nunito',
})


export { inter, nunito };