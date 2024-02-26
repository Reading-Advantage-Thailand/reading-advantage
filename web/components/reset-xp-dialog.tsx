// ResetDialog.tsx
'use client'
import { useState } from 'react';
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter } from 'next/navigation';
import { styled } from '@mui/material';


export default function ResetDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  
  const closeDialog = () => {
    setIsOpen(false);
  };
  
  const resetXP = async (userId: string,) => {
    console.log('resetXP function called');
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({
          xp: 0,
          level: 0,
          cefrLevel: "",
        }),
      });
    
      console.log('fetch called');
      
      return new Response(
        JSON.stringify({
          message: "success",
        }),
        { status: 200 }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            message: error,
          }),
          { status: 500 }
          );
        }
    finally {
      closeDialog();
      router.refresh();
    }
  };

  return (
    <>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
            <Button className={cn(
          buttonVariants({ variant: "destructive"}),
          "mt-2 sm:mt-0 w-full lg:w-full",
        )}>Reset XP</Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>Reset all XP progress</DialogTitle>
            </DialogHeader>
            <DialogDescription>
            If you click <span className='font-bold'>‘Confirm Reset’</span> then all your progress will be reset and you will essentially have a new account. Do this only if you feel your level is incorrect and you can’t fix it. <span className='font-bold'>‘Cancel’</span> if you are not sure what to do.”
            </DialogDescription>
            <DialogFooter>
                <Button onClick={closeDialog}>Cancel</Button>
                <Button
                className={cn(
                    buttonVariants({ variant: "destructive"}),
                )}
                onClick={() => resetXP('userId')}
                >
                Confirm Reset
                </Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}