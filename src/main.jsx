import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { SubscriptionProvider } from './contexts/SubscriptionContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <SubscriptionProvider>
          <App />
        </SubscriptionProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
)