import React from 'react'
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import Image from 'next/image'
import ArticleContent from './article-content'
import { Badge } from './ui/badge'
import { getScopedI18n } from '@/locales/server'
import Questions from './questions/questions'
import { ArticleType } from '@/types'
import { ArticleFooter } from './article-footer'
import { Skeleton } from './ui/skeleton'
import RatingPopup from './rating-popup'

type Props = {
    article: ArticleType,
    articleId: string,
    userId: string,
}

export default async function ArticleCard({
    article,
    articleId,
    userId,
}: Props) {
    const t = await getScopedI18n('components.articleCard');
    return (
        <div className='md:flex md:flex-row md:gap-3 md:mb-5'>
            <div className='mt-4 md:basis-3/5'>
            <Card >
                <CardHeader>
                    <CardTitle className='font-bold text-3xl md:text-3xl'>
                        {article.title}
                    </CardTitle>
                    <div className='flex flex-wrap gap-3'>
                        <Badge>
                            {t('raLevel', {
                                raLevel: article.raLevel,
                            })}
                        </Badge>
                        <Badge>
                            {t('cefrLevel', {
                                cefrLevel: article.cefrLevel,
                            })}
                        </Badge>
                    </div>
                    <CardDescription>
                        {t('articleCardDescription', {
                            topic: article.topic.toLowerCase(),
                            genre: article.genre.toLowerCase(),
                        })}
                    </CardDescription>
                    <div className='flex justify-center'>
                        <Image
                            src={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/article-images/${articleId}.png`}
                            alt='Malcolm X'
                            width={640}
                            height={640}
                        />
                    </div>
                    <ArticleContent article={article} articleId={articleId} userId={userId} />
                </CardHeader>
                <ArticleFooter />
              </Card > 
                
              <RatingPopup userId={userId} averageRating={article.averageRating} articleId={articleId} />          
            </div>
                                
            {/* part question */}             
            {
                article.questions && (
                    <Questions
                        className='flex flex-col mt-4 mb-40 md:mb-0 md:basis-2/5'
                        questions={article.questions}
                        articleId={articleId}
                        userId={userId}
                        articleTitle={article.title}
                    />
                ) || (
                    <Card className='flex flex-col mt-4 mb-40 md:mb-0 md:basis-2/5'>
                        <CardHeader>
                            <CardTitle>
                                Generating Questions
                            </CardTitle>
                            <CardDescription>
                                Generating questions for this article. Please wait a moment.
                            </CardDescription>
                            <Skeleton className="h-[80px] w-full my-3" />
                            <Skeleton className="h-[40px] w-full mb-3" />
                            <Skeleton className="h-[20px] w-full mb-3" />
                            <Skeleton className="h-[70px] w-full mb-3" />
                        </CardHeader>
                    </Card>
                )
            }
        </div>
    )
}