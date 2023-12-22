import { articleShowcaseType } from '@/types'
import React from 'react'
import { Badge } from './ui/badge'
import Link from 'next/link'
import { camelToSentenceCase } from '@/lib/utils'

type Props = {
    article: articleShowcaseType,
}

export default async function ArticleShowcaseCard({
    article,
}: Props) {
    return (
        
        <Link href={`/student/read/${article.articleId}`}>
            <div
                className='w-full flex flex-col gap-1 h-[20rem] bg-cover bg-center p-3 rounded-md hover:scale-105 transition-all duration-300 bg-black '
                style={{
                    backgroundImage: `url('https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/article-images/${article.articleId}.png')`,
                    boxShadow: 'inset 80px 10px 90px 10px rgba(0, 0, 0, 0.9)',
                    opacity: article.isRead ? 0.3 : 1,
                }}
            >
                <Badge
                    className='shadow-lg max-w-max'
                    variant='destructive'
                >
                    Reading Advantage Level: {article.raLevel}
                </Badge>
                <Badge
                    className='shadow-lg max-w-max'
                    variant='destructive'
                >
                    CEFR Level: {article.cefrLevel}
                </Badge>
                {
                    article.totalRatings >= 0 && <Badge
                        className='shadow-lg max-w-max'
                        variant='destructive'
                    >
                        Average Rating: {article.averageRating.toFixed(2)}
                    </Badge>
                }
                <div className='mt-auto'>
                    <p className='text-xl drop-shadow-lg font-bold text-white'>
                        {article.title}
                        
                    </p>
                    <p
                        style={{
                            textShadow: '1px 1px 1px rgba(0, 0, 0, 1)',
                        }}
                        className='text-sm shadow-sm text-white'>
                            {article.topic}
                    </p>
                </div>
            </div >
            {
                article.isRead && <div className="flex justify-center"> {/* Added container for centering */}
                    <Badge
                        className='relative m-auto -top-[11rem] text-md left-0 right-0 shadow-lg max-w-max bg-slate-200 text-slate-900'

                    >
                        Previously Read
                    </Badge>
                </div>
            }
        </Link>
    )
}