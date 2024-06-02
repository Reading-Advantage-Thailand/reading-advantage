import FirstRoleSelection from '@/components/first-role-selection'
import { NextAuthSessionProvider } from '@/components/providers/nextauth-session-provider';
import { getCurrentUser } from '@/lib/session';
import { log } from 'console';
import { redirect } from 'next/navigation';
import React from 'react'

async function FirstRoleSelectionPage() {
    const user = await getCurrentUser();
    
    if (!user) {
      return redirect("/auth/signin");
    }

    if (user.cefrLevel !== "" && user.level >= 0) {
        return redirect("/student/read");
    }
    
    return (
            <div>
                     <NextAuthSessionProvider session={user}>
                            <FirstRoleSelection userId={user.id} role={''} />
                     </NextAuthSessionProvider>
            </div>
    )
}

export default FirstRoleSelectionPage