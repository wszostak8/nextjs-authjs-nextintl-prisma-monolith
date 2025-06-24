import React from 'react';
import FigmaMarginLayout from "@/components/layout";

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <>
            <section className="h-screen relative">
                <FigmaMarginLayout>
                    {children}
                </FigmaMarginLayout>
            </section>
        </>
    );
}
