"use client"

import React from 'react';
import { Rating, Stack } from '@mui/material'

export default function RatingPopup(){
 const [value, setValue] = React.useState<number | null>(3);
 const [modalIsOpen, setModalIsOpen] = React.useState<boolean>(false);

 console.log({ value })

 const handleChange = (
    _event: React.ChangeEvent<{}>,
    newValue: number | null
  ) => {
    setValue(newValue)
  }

  const toggleModal = () => {
    setModalIsOpen(!modalIsOpen)
  }

 return (
  <div className=''>
  <div 
  onClick={toggleModal}
  className='pl-[5.5%] mt-4 py-2 font-bold text-2xl md:text-2xl cursor-pointer
    flex gap-4 items-center border-[1px] border-gray-300 rounded-xl
    dark:border-[#1e293b]
  '> 
    Rate this article        
    <Stack>                    
      <Rating
      value={value} 
      onChange={handleChange}
      precision={0.5}
      size="large"
      className='dark:bg-white py-1 px-4 rounded-xl'
      />
    </Stack>
  </div>

  {/* modal */}
  {modalIsOpen  
    ? <div className='w-full h-screen top-0 right-0 fixed 
        z-40 bg-white bg-opacity-80 dark:bg-black dark:bg-opacity-80'>
        
        <div className='flex justify-center items-center'>

          <div className='my-[60%] md:my-[40%] lg:my-[20%] bg-white
            w-[450px] rounded-2xl py-6 shadow-2xl dark:bg-[#1e293b]'>
            <div className='flex justify-between mb-2 mx-4 
            '>  
              <h1 className='font-bold text-xl'>Rate this article</h1>
              <button 
              onClick={() => setModalIsOpen(false)}
              className='text-xl font-semibold -mt-4 p-1'>
                x
              </button>                                
            </div>
            <p className='mx-4'>How do you rate the quality of this article?</p>
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
            className='bg-black text-white px-4 py-2 rounded-md 
              shadow-sm dark:bg-white dark:text-[#1e293b]'>
              Submit
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
