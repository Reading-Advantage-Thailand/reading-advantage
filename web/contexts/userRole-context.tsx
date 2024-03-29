'use client';
import { UserRole } from '@/types';
import React from 'react';

export const SelectedRoleContext = React.createContext([] as any);

export const SelectedRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedRole, setSelectedRole] = React.useState<UserRole[]>([]);
    
        return (
            <SelectedRoleContext.Provider value={[selectedRole, setSelectedRole]}>
                {children}
            </SelectedRoleContext.Provider>
        );
    };
