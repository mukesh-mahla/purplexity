
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { RootLayout } from './pages/App'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
 
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RootLayout />
      </BrowserRouter>
    </QueryClientProvider>
  
)
