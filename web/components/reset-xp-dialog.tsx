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

export default function ResetDialog() {
  const [isOpen, setIsOpen] = useState(false);

//   const openDialog = () => {
//     setIsOpen(true);
//   };

  const closeDialog = () => {
    setIsOpen(false);
  };

  const resetXP = (userId: string) => {
    const admin = require('firebase-admin');
// admin.initializeApp({
//   credential: admin.credential.applicationDefault(),
//   databaseURL: 'https://<YOUR_PROJECT_ID>.firebaseio.com'
// });
admin.initializeApp({
    credential: admin.credential.cert(process.env.NEXT_PUBLIC_FIREBASE_SERVICE_ACCOUNT_KEY),
  });

const db = admin.database();
const ref = db.ref(`users/${userId}`);

ref.update({
      xp: 0,
      level: 0,
      cefrLevel: ""
    });

    closeDialog();
  };

  return (
    <>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
            <Button className={cn(
          buttonVariants({ variant: "destructive"}),
          "mt-2 sm:mt-0 w-auto lg:w-1/3",
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
                onClick={resetXP}
                >
                Confirm Reset
                </Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}