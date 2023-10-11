'use client';
import { useChangeLocale, useScopedI18n } from "@/locales/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Icons } from "../icons";

export function LocaleSwitcher() {
    // Uncomment to preserve the search params. Don't forget to also uncomment the Suspense in the layout
    const changeLocale = useChangeLocale(/* { preserveSearchParams: true } */);
    const t = useScopedI18n("components.localeSwitcher")
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
                    <Icons.globe className="h-5 w-5" />
                    <span className="sr-only">Toggle Locale</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLocale("en")}>
                    <Icons.en className="mr-2 h-4 w-4" />
                    <span>{t('en')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLocale("th")}>
                    <Icons.th className="mr-2 h-4 w-4" />
                    <span>{t('th')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}