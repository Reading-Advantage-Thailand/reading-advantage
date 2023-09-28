import { buttonVariants } from '@/components/ui/button'
import { siteConfig } from '@/configs/site-config'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'

type Props = {}

export default function IndexPage({ }: Props) {
    return (
        <>
            <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
                <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
                    <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
                        {siteConfig.name}
                    </h1>
                    <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                        {siteConfig.description} <br />
                        Explore the world of reading with Reading Advantage.
                    </p>
                    <div className="space-x-4">
                        <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
                            Get Started
                        </Link>
                    </div>
                </div>
            </section>
        </>
    )
}