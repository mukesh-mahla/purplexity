import "../index.css"
import { Routes, Route, useNavigate } from 'react-router-dom'
import { ClerkProvider } from '@clerk/react'
import Conversation from "./conversation.tsx";
import Auth from './Landing';
import { APITester } from "@/APITester.tsx";
const PUBLISHABLE_KEY = "REMOVED"
export function RootLayout() {
    const navigate = useNavigate()

    return (
        <ClerkProvider publishableKey={PUBLISHABLE_KEY!}   
        >
            <Routes>
                <Route path="/" element={<Auth />} />
                <Route path="/conversation" element={<APITester />} />
                <Route path="/conversation/:conversationId" element={<Conversation />} />
            </Routes>
        </ClerkProvider>
    )
}