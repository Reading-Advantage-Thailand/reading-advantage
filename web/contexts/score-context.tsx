'use client';
import Layout from '@/app/[locale]/(index)/layout';
import FirstRunLevelTest from '@/components/first-run-level-test';
import { MainNav } from '@/components/main-navbar';
import ProgressBar from '@/components/progress-bar-xp';
import { createContext, ReactNode, useState } from 'react';
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('@/components/progress-bar-xp'), {
  ssr: false,
}); 

interface ScoreContextProps {
  score: number;
  setScores: React.Dispatch<React.SetStateAction<number>>;
}

export const ScoreContext = createContext<ScoreContextProps | undefined>(undefined);

export const ScoreProvider = ({ children }: { children: ReactNode }) => {
  const [score, setScores] = useState(0);

  return (
    <ScoreContext.Provider value={{ score, setScores }}>
        <DynamicComponent progress={0} />
      {children}
    </ScoreContext.Provider>
  );
};