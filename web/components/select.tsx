'use client';
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import axios from 'axios'
import { useRouter } from 'next/navigation';
import { useScopedI18n } from '@/locales/client';
type Props = {
    user: {
        level: number,
        name: string,
        id: string,
    }
    types: string[],
}


export default function Select({
    user,
    types,
}: Props) {
    const t = useScopedI18n('components.select');
    const ta = useScopedI18n('components.article');
    const router = useRouter();

    const [loading, setLoading] = React.useState(false);
    const [step, setStep] = React.useState(0);

    const [selectedType, setSelectedType] = React.useState('');
    const [selectedGenre, setSelectedGenre] = React.useState('');
    const [selectedSubgenre, setSelectedSubgenre] = React.useState('');

    //remove '-' from types
    const typesWithoutDash = types.map((type) => {
        return type.replace('-', ' ')
    })
    const [values, setValues] = React.useState<string[]>(typesWithoutDash);

    //function to replace all '-' with ' '
    function replaceDashes(str: string) {
        return str.replace(/\s/g, '-');
    }

    async function onSubmit(value: string) {
        console.log(value)
        let params = {
            level: user.level,
            type: replaceDashes(value),
            genre: '',
            subgenre: '',
        }
        if (step === 0) {
            setSelectedType(value);
        }
        if (step === 1) {
            params = {
                level: user.level,
                type: replaceDashes(selectedType),
                genre: replaceDashes(value),
                subgenre: '',
            }
            setSelectedGenre(value);
        }
        if (step === 2) {
            params = {
                level: user.level,
                type: replaceDashes(selectedType),
                genre: replaceDashes(selectedGenre),
                subgenre: replaceDashes(value),
            }
            setSelectedSubgenre(value);
        }
        try {
            setLoading(true);

            const response = await axios.get(`/api/articles`, {
                params: params
            });
            if (step === 2) {
                return router.push(`/student/read/${response.data.articleId}`)
            }
            const data = response.data.data;
            console.log(data);
            setValues(data);
            setStep(step + 1);
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className='mt-2'>
            <CardHeader>
                <CardTitle>
                    {t('articleChoose', {
                        article: <b>{ta(step === 0 ? 'type' : step === 1 ? 'genre' : 'subGenre')}</b>,
                    })}
                </CardTitle>
                <CardDescription>
                    {t('articleChooseDescription', {
                        level: <b>{user.level}</b>,
                        article: <b>{ta(step === 0 ? 'type' : step === 1 ? 'genre' : 'subGenre')}</b>,
                    })}
                    {/* Your level is {user.level} and here are the article {step === 0 ? 'types' : step === 1 ? 'genres' : 'sub-genres'} that you can choose. */}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className='flex flex-wrap gap-2'>
                    {values.map((value, index) => (
                        <Button
                            key={index}
                            onClick={() => onSubmit(value)}
                            disabled={loading}
                        >
                            {value}
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>

    )
}