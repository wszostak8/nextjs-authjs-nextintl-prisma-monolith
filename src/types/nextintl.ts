import React from "react";

export interface IntlProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}