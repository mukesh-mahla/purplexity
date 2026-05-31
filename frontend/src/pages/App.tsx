
import "../index.css"
import { Routes, Route, useNavigate } from 'react-router-dom'
import { ClerkProvider, SignIn, SignUp } from '@clerk/react'
import Conversation from "./conversation.tsx";
import Auth from './Landing';



const PUBLISHABLE_KEY = process.env.PUBLIC_CLERK_PUBLISHABLE_KEY;

export function RootLayout() {
    const navigate = useNavigate()

    return (
        <ClerkProvider publishableKey={PUBLISHABLE_KEY!}  
         routerPush={(to) => navigate(to)}
         routerReplace={(to) => navigate(to, { replace: true })}
         signInUrl="/sign-in"
         signUpUrl="/sign-up"
        >
            <Routes>
                <Route path="/" element={<Auth />} />
                <Route path="/sign-in" element={<SignIn/>} />
                <Route path="/sign-up" element={<SignUp/>} />
                <Route path="/conversation/:conversationId" element={<Conversation />} />
            </Routes>
        </ClerkProvider>
    )
}