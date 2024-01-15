/* eslint-disable @next/next/no-async-client-component */
'use client'
import React, { use, useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Stack, Typography, Slider } from '@mui/material'
import { Button } from './ui/button'
import { Icons } from './icons'
import { toast } from './ui/use-toast'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { GetServerSideProps } from 'next';
import { set } from 'lodash'
import { readLevelTestData } from '../../functions/utils/readLevelTestData.js';
import fs from 'fs/promises';
import path from 'path';
import { headers } from 'next/headers'
import { Header } from '@/components/header'

type Props = {
    userId: string,
    // levelTestData: any,
}
// export async function getStaticProps() {
//     const filePath = path.join(process.cwd(), '../functions/utils', 'readLevelTestData.js');
//     console.log(filePath);
    
//     // const filePath = await fetch('../../functions/utils/readLevelTestData.js');

//     const levelTestData = JSON.parse(await fs.readFile(filePath, 'utf8'));

//     // const levelTestData = readLevelTestData();
//     return {
//       props: {
//         levelTestData,
//       },
//     };
//   }

async function getLevelTestData() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/level-test`,
      {
        method: "GET",
        headers: headers(),
      }
    );
    return res.json();
  }

export default async function FirstRunLevelTest ({
    userId,
    // levelTestData
    
}: Props) {
    const [loading, setLoading] = useState(false);
    // const [levelTestData, setLevelTestData] = useState<any | null>(null);
// console.log('levelTestData : ', levelTestData);
const resGeneralDescription = await getLevelTestData();
   

    return (
        <>
          <Dialog >
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className='font-bold text-2xl md:text-2xl'>
                        Please select your language
                    </DialogTitle>
              </DialogHeader>
                <DialogFooter>
                   
                </DialogFooter>
            </DialogContent >
        </Dialog >
        {/* <Card>
            <CardContent>
            <CardTitle className='font-bold text-2xl md:text-2xl'>
                        Please select your language
                    </CardTitle>
            </CardContent>
        </Card> */}
            <Card>
                <CardHeader>
                    <CardTitle className='font-bold text-2xl md:text-2xl'>
                        Let&apos;s get start by testing your skill!
                    </CardTitle>
                    <CardDescription>
                       Choose the correct answer to assess your reading level.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div>
                    <pre>{JSON.stringify(resGeneralDescription, null, 2)}</pre>
                    {/* {levelTestData && (
        <pre>{JSON.stringify(levelTestData, null, 2)}</pre>
      )} */}
                    </div>
                    <div>content show here</div>
                {/* <div className="container">
      <div className="header">
        <h2>Section 1</h2>
        <div className="progress-bar-outer">
          <div className="progress-bar-inner" style={{width: '0%'}}>0%</div>
        </div>
      </div>


      <div className="level-section" id="A0">
        <div className="question">
          <p>1. Is this a book?</p>
          <label className="option"><input type="radio" name="A0Q1"/> Yes, it is a book.</label>
          <label className="option"><input type="radio" name="A0Q1"/> No, it's a pen.</label>
          <label className="option"><input type="radio" name="A0Q1"/> Yes, it's a table.</label>
        </div>
        <div className="question">
          <p>2. Good morning!</p>
          <label className="option"><input type="radio" name="A0Q2"/> Good morning!</label>
          <label className="option"><input type="radio" name="A0Q2"/> It's evening.</label>
          <label className="option"><input type="radio" name="A0Q2"/> Thank you!</label>
        </div>
        <div className="question">
          <p>3. Do you have a cat?</p>
          <label className="option"><input type="radio" name="A0Q3"/> No, I have a dog.</label>
          <label className="option"><input type="radio" name="A0Q3"/> Yes, a big dog.</label>
          <label className="option"><input type="radio" name="A0Q3"/> I like cats.</label>
        </div>
        <button className="btn-next">Next</button>
      </div>

      <div className="alert">
        Your level is 7!
      </div>
    </div> */}
                </CardContent>
            </Card>
            <div className="flex items-center pt-4">
                <Button
                    size="lg"
                    disabled={loading}
                   
                >
                    {loading && (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <span>Next</span>
                </Button>
            </div>

 
        </>
    )
}
// export const getServerSideProps: GetServerSideProps = async () => {
//     const levelTestData = readLevelTestData();
//     console.log('this is levelTestData : ', levelTestData);
    
//     return {
//         props: {
//         levelTestData
//       }
//     }
// }