import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import MeetingDetail from './pages/MeetingDetail'
import ActionItems from './pages/ActionItems'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen" style={{background:'#0a0a09'}}>
          <Navbar />
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/meetings/:id" element={<MeetingDetail />} />
            <Route path="/action-items" element={<ActionItems />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}