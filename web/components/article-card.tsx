import React, { use } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import Image from 'next/image'
import { Button } from './ui/button'
import { Icons } from './icons'
import axios from 'axios'
import MCQ from './mcq'

type Props = {
    article: any,
    articleId: string,
    userId: string,
}

export default async function ArticleCard({
    article,
    articleId,
    userId,
}: Props) {
    return (
        <>
            <Card className='mt-4'>
                <CardHeader>
                    <CardTitle className='font-bold text-3xl md:text-3xl'>
                        {article.title}
                    </CardTitle>
                    <div className='flex justify-center'>
                        <Image
                            src={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/article-images/${articleId}.png`}
                            alt='Malcolm X'
                            width={640}
                            height={640}
                        />
                    </div>
                    <CardDescription>
                        {article.content}
                    </CardDescription>
                </CardHeader>
            </Card>
            <MCQ
                articleTitle={article.title}
                articleId={articleId}
                mcq={article.questions.multiple_choice_questions}
                userId={userId}
            />
        </>
    )
}