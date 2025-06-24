import React from 'react';

interface FigmaMarginLayoutProps {
    children: React.ReactNode;
}

export default function FigmaMarginLayout({ children }: FigmaMarginLayoutProps) {
    return (
        <div className="max-w-[1280px] mx-auto justify-center px-4">
            {children}
        </div>
    );
}
