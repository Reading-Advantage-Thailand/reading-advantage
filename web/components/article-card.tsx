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
            <Card className='mt-4 md:basis-3/5'>
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
                {/* article footer coming soon */}
                <ArticleFooter />
            </Card >
            <Questions
                className='flex flex-col mt-4 mb-40 md:mb-0 md:basis-2/5'
                questions={article.questions}
                articleId={articleId}
                userId={userId}
                articleTitle={article.title}
            />
            {/* <MCQ
                isRequiz={isRequiz}
                className='mt-4 mb-40 basis-2/5 h-auto'
                articleTitle={article.title}
                articleId={articleId}
                mcq={article.questions.multiple_choice_questions}
                shortAnswer={article.questions.short_answer_question}
                userId={userId}
            /> */}
        </div >
    )
}