'use client';
import React from 'react'
import { Card, CardContent } from './ui/card'
import { Icons } from './icons'
import { cn } from '@/lib/utils';
import { getAuth, sendEmailVerification } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';
import { toast } from './ui/use-toast';
import { useRouter } from 'next/navigation';

type Props = {
    title: string,
    description: string,
    data: string | JSX.Element,
    isEdit: boolean,
    verifyButton?: boolean
    isVerified?: boolean
}

export default function SettingInfo({
    title,
    description,
    data,
    isEdit,
    verifyButton = false,
    isVerified = false
}: Props) {
    const [loading, setLoading] = React.useState<boolean>(false);
    const route = useRouter();

    const handleSendEmailVerification = async () => {
        const user = getAuth(firebaseApp).currentUser;
        setLoading(true);
        if (!user) return;
        if (user.emailVerified) {
            await fetch(`/api/users/${user.uid}`, {
                method: 'PUT',
                body: JSON.stringify({
                    emailVerified: true
                })
            }).catch((err) => {
                toast({
                    title: 'Error',
                    description: 'Something went wrong',
                    variant: "destructive",
                })
            }).finally(() => {
                toast({
                    title: 'Email verified',
                    description: 'Your email has been verified already',
                    variant: "destructive",
                })
                setLoading(false);
            })
        }
        if (user.emailVerified) {
            // refresh page
            route.refresh();
            return;
        }
        sendEmailVerification(user!, {
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings/user-profile`,
            handleCodeInApp: true,
        })
            .then((user) => {
                toast({
                    title: 'Email verification sent',
                    description: 'Please check your email to verify your account',
                })
            })
            .catch((err) => {
                console.log(err)
                switch (err.code) {
                    case 'auth/too-many-requests':
                        toast({
                            title: 'Too many requests',
                            description: 'Please try again later',
                            variant: "destructive",
                        })
                        break;
                    default:
                        toast({
                            title: 'Error',
                            description: 'Something went wrong',
                            variant: "destructive",
                        })
                        break;
                }
            }).finally(() => {
                setLoading(false);
            })

    }
    return (
        <>
            <div className="lg:col-span-2">
                <p>
                    {title}
                </p>
                <p className="text-muted-foreground" >
                    {description}
                </p>
            </div>
            <div>
                <Card>
                    <CardContent
                        className={cn(
                            !verifyButton && "flex justify-between",
                            "gap-2 items-center py-3",
                        )}
                    >
                        <p className='w-full'>
                            {data}
                        </p>
                        {isEdit && <Icons.edit className="w-4 h-4 hover:text-blue-500 cursor-pointer" />}
                        {
                            verifyButton && (
                                isVerified ?
                                    <button className="text-sm text-blue-500 hover:underline">Verified Email</button> :
                                    <button
                                        className="flex items-center gap-1 text-sm text-red-500 hover:underline"
                                        onClick={handleSendEmailVerification}
                                    >
                                        {loading && (
                                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Send Email Verification
                                    </button>
                            )
                        }
                    </CardContent>
                </Card>
            </div>
        </>
    )
}