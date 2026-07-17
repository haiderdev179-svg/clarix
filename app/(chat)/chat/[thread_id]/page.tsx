// "use server"

import { agent } from "@/app/api/chat/graph";
import { ChatInterfaceNew } from "@/components/chat-interface";
import { auth } from "@/lib/auth";
import { getMessageHistory } from "@/lib/conversation";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/db"

export default async function Page({
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ [key: string]: string | string[] | undefined }>;
}>) {
  const { thread_id } = await params;
  console.log({thread_id});

  //getting user_id
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if(!session){
    redirect("/auth/signin");
  }


  //Note: this will run on server side
   const messages = await getMessageHistory( {
     graph: agent,
     threadId: thread_id as string,
     userId: session?.user.id as string,
   } );

   console.log(JSON.stringify(messages, null, 2   ));

  return (
    <>
      <ChatInterfaceNew oldMessages={messages} />
    </>
  );
};

 
