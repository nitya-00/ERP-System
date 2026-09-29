import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppProvider } from './store/AppContext.tsx'
import { TeacherProvider } from './store/TeacherContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <TeacherProvider>
        <App />
      </TeacherProvider>
    </AppProvider>
  </StrictMode>,
)
