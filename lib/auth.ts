import {betterAuth} from "better-auth";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import {db} from "@/db";  //drizzle instance
import { schema } from "@/db/schema/auth-schema";

export const auth = betterAuth({
   database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
   }),

   emailAndPassword: {
    enabled: true,
   },

}); 