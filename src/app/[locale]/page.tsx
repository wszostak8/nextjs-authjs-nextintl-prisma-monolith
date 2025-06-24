import Hero from "@/components/sections/hero/Hero";
import Header from "@/components/sections/header/Header";
import React from "react";
import FigmaMarginLayout from "@/components/layout";

export default function HomePage() {
    return (
        <>
            <Header />
            <section className="h-screen relative">
                <FigmaMarginLayout>
                    <Hero/>
                </FigmaMarginLayout>
            </section>
        </>
    );
}