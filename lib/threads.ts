'use server'

import { db } from '@/db';
import { auth } from './auth';
import { headers } from "next/headers";
import { thread } from "@/db/schema/chat-schema";
import { eq, desc } from "drizzle-orm";

export async function fetchThreads(){

   //for user_id
   const session = await auth.api.getSession({
    //we are using cookies for authentication that's why we have to use headers for getting session
    headers: await headers()
   })

   //if user is not loggedIn means there is no session so we are return empty array
    if(!session){
        return [];
    }

    //todo: error handling (try catch etc)

    //fetching threads from data
    const threads = await db.select({id: thread.id, title: thread.title, createdAt: thread.createdAt}).from(thread).where(eq(thread.userId, session.user.id)).orderBy(desc(thread.createdAt));

    return threads;


};