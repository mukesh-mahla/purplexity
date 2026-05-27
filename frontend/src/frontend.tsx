/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
//  */
// Bun.env.PUBLIC_CLERK_PUBLISHABLE_KEY

import { createRoot } from "react-dom/client";

import {Toaster} from "@/components/ui/sonner"
import { BrowserRouter } from "react-router-dom";
const elem = document.getElementById("root")!;

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RootLayout } from "./pages/App";


const queryClient = new QueryClient();



const app = (
  
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
    <Toaster/>
      <RootLayout />
    </BrowserRouter>
    </QueryClientProvider>

);

// https://bun.com/docs/bundler/hot-reloading#import-meta-hot-data
(import.meta.hot.data.root ??= createRoot(elem)).render(app);
