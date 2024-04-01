'use client';
import { UserRole } from '@/types/constants';
import React, { useEffect } from 'react';

export const SelectedRoleContext = React.createContext([] as any);

export const SelectedRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedRole, setSelectedRole] = React.useState<UserRole[]>(() => {
        const savedRoles = localStorage.getItem('selectedRole');
            return savedRoles ? JSON.parse(savedRoles) : [];
    });
    
   useEffect(() => {
         localStorage.setItem('selectedRole', JSON.stringify(selectedRole));
    }, [selectedRole]); 
    
        return (
            <SelectedRoleContext.Provider value={[selectedRole, setSelectedRole]}>
                {children}
            </SelectedRoleContext.Provider>
        );
    };
