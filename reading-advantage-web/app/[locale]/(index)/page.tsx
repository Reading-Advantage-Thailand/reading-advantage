import { buttonVariants } from '@/components/ui/button'
import { siteConfig } from '@/configs/site-config'
import { cn } from '@/lib/utils'
import React from 'react'
import Link from 'next/link'
import { getScopedI18n } from '@/locales/server'

type Props = {}

export default async function IndexPage({ }: Props) {
    const t = await getScopedI18n('pages.indexPage');
    return (
        <>
            <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
                <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
                    <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
                        <span>
                            {siteConfig.name}
                        </span>
                        <span className='text-orange-500'>
                            {" "}Beta
                        </span>
                    </h1>
                    <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                        {t('description')}
                    </p>
                    <div className="space-x-4">
                        <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
                            {t('getStartedButton')}
                        </Link>
                    </div>
                </div>
            </section>
        </>
    )
}