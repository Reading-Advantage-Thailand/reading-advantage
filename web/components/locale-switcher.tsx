import { useLocale, useTranslations } from "next-intl";
import Link from "next-intl/link";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";

const languages = ["en", "th"];

interface LocSwitcherProps {
    className?: string;

}
export default function LocSwitcher({ className, }: LocSwitcherProps) {
    const t = useTranslations("components.locale-switcher");
    const locale = useLocale();

    return (
        <div className={className}>
            {languages.map((lang) => {
                if (lang !== locale) {
                    return (
                        <Link href='/' key={lang} locale={lang}>
                            {t("switch", { locale: lang })}
                        </Link>
                    );
                } else {
                    return null;
                }
            })}
        </div >
    );
}