import {createAuthClient} from "better-auth/react";
import { polarClient } from "@polar-sh/better-auth/client";


export const authClient = createAuthClient({
    // baseURL: "http://localhost:3000",
    baseURL: typeof window !== "undefined" ? window.location.origin : undefined,
    // CHANGED: added polarClient plugin so TypeScript knows about .checkout() and the client can create checkout sessions
    plugins: [polarClient()],
}); 