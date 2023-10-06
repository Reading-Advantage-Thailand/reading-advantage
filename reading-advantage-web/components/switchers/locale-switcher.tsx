'use client';
import { useChangeLocale } from "@/locales/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Icons } from "../icons";

export function LocaleSwitcher() {
    // Uncomment to preserve the search params. Don't forget to also uncomment the Suspense in the layout
    const changeLocale = useChangeLocale(/* { preserveSearchParams: true } */);
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
                    <Icons.globe className="h-4 w-4" />
                    <span className="sr-only">Toggle Locale</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLocale("en")}>
                    <Icons.en className="mr-2 h-4 w-4" />
                    <span>Switch to English</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLocale("th")}>
                    <Icons.th className="mr-2 h-4 w-4" />
                    <span>Switch to Thai</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}