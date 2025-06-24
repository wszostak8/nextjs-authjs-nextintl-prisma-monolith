import {Button} from "@/components/ui/button";
import {useTranslations} from "next-intl";
import Link from "next/link";

export default function Hero() {
    const t = useTranslations("hero")

    return (
        <div className="py-44 md:py-62 max-w-[800px] mx-auto text-center">
            <div className="flex flex-col">
                <h1 className="text-[1.35rem] lg:text-2xl font-bold text-[#191919]">
                    {t('title')}
                </h1>
                <p className="text-gray-600 base-text lg:text-[1.2rem] mt-2 text-center">
                    {t('description.p1')} <span className="text-nowrap bg-white py-1 px-3 rounded-lg text-bold bg-gradient-to-r from-red-700 to-red-900 text-white font-semibold"> AuthJS v5</span>
                    <br />
                    {t('description.p2')}
                    <br />
                    {t('description.p3')} <span className="text-[#191919] font-semibold">{t('description.keywordp3')}</span>
                </p>
            </div>
            <div className="flex flex-wrap gap-3 w-full justify-center mt-3">
                <Button variant="default">{t('buttons.author')}</Button>
                <Link href="https://github.com/wszostak8/nextjs-authjs-nextintl-prisma-monolith" target="_blank">
                    <Button variant="white" className="border-gray-900 bg-transparent">{t('buttons.diagrams')}</Button>
                </Link>
            </div>
        </div>
    );
}