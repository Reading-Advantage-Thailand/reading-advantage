"use client"

import React from 'react';
import { Rating, Stack } from '@mui/material'
import axios from "axios";
import { useScopedI18n } from "@/locales/client";
import { toast } from "./ui/use-toast";

interface RateDialogProps {
  disabled?: boolean;
  averageRating: number;
  userId: string;
  articleId: string;
}

export default function RatingPopup({
  disabled = false,
  averageRating,
  userId,
  articleId,
}: RateDialogProps){
 const t = useScopedI18n('components.rate');
 const [value, setValue] = React.useState<number | null>(-1);
 const [modalIsOpen, setModalIsOpen] = React.useState<boolean>(false);
 const [loading, setLoading] = React.useState<boolean>(false);

 const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  // timeout: 1000,
 });

 const onUpdateUser = async() => {
  if(value === -1) return;
  const response = await instance.patch(`/api/users/${userId}/article-records`, {
    articleId,
    rating: value
  })
  const data = await response.data;
  console.log(data);
  console.log(data.message === 'success')
  if(data.message === 'success'){
    toast({
      title: t('toast.success'),
      
    });
    setModalIsOpen(false);
  }
  setLoading(false);
}

 const handleChange = (
    _event: React.ChangeEvent<{}>,
    newValue: number | null
  ) => {
    setValue(newValue ? newValue : 0)
  }

  const toggleModal = () => {
    setModalIsOpen(!modalIsOpen)
  }

 return (
  <div className=''>
  <button 
  onClick={toggleModal}
  className='pl-[5.5%] mt-4 py-2 font-bold text-2xl md:text-2xl cursor-pointer
    flex gap-4 items-center border-[1px] border-gray-300 rounded-xl
    dark:border-[#1e293b]
  '> 
    Rate this article        
    <Stack>                    
      <Rating
      value={averageRating} 
      onChange={handleChange}
      precision={0.5}
      size="large"
      className='dark:bg-white py-1 px-4 rounded-xl'
      readOnly
      />
    </Stack>
  </button> 

  {/* modal */}
  {modalIsOpen  
    ?  
      <div className='w-full h-screen top-0 right-0 fixed 
        z-40 bg-white bg-opacity-80 dark:bg-black dark:bg-opacity-80'>
        
        <div className='flex justify-center items-center'>

          <div className='my-[60%] md:my-[40%] lg:my-[20%] bg-white
            w-[450px] rounded-2xl py-6 shadow-2xl dark:bg-[#1e293b]'>
            <div className='flex justify-between mb-2 mx-4 
            '>  
              <h1 
              className='font-bold text-xl'>{t("title")}</h1>
              <button 
              onClick={() => setModalIsOpen(false)}
              className='text-xl font-semibold -mt-4 p-1'>
                x
              </button>                                
            </div>
            <p className='mx-4'>{t('content')}</p>
            <div className='flex justify-center mt-6'>
              <Rating
                value={value} 
                onChange={handleChange}
                precision={0.5}
                size="large"
                className='dark:bg-white py-1 px-4 rounded-xl'
              />            
            </div>
            <div className='mt-6 mx-4 flex justify-end items-end'>
            <button
            
            onClick={onUpdateUser}                   
            className='bg-black text-white px-4 py-2 rounded-md 
              shadow-sm dark:bg-white dark:text-[#1e293b]'>
              {t('submitButton')}
            </button>  
            </div>
           
          </div>
        </div>
      </div> 
    : ""  
  }
  </div>
 )
}
