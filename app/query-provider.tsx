"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();


//Creating a wrapper function for wrapping our application for tanstack-query
export function QueryProvider({children}: {children: React.ReactNode}) {

    return ( 
    <QueryClientProvider client={queryClient}>
    {children}
    </QueryClientProvider>
    )
    
};

