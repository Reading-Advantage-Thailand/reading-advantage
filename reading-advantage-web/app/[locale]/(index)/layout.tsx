import { Footer } from '@/components/footer';
import { MainNav } from '@/components/main-navbar';
import { buttonVariants } from '@/components/ui/button';
import { indexPageConfig } from '@/configs/index-page-config';
import { cn } from '@/lib/utils';
import { getScopedI18n } from '@/locales/server';
import Link from 'next/link';
import { ReactNode } from 'react';

export default async function Layout({ children }: { children: ReactNode }) {
    const t = await getScopedI18n('components')
    return (
        <div className="flex min-h-screen flex-col">
            <header className="container z-40 bg-background">
                <div className="flex h-20 items-center justify-between py-6">
                    <MainNav items={indexPageConfig.mainNav} />
                    <nav>
                        <Link
                            href="/login"
                            className={cn(
                                buttonVariants({ variant: "secondary", size: "sm" }),
                                "px-4"
                            )}
                        >
                            {t('loginButton')}
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}