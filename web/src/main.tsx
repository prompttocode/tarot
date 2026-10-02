import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'

// Safari may ignore the viewport zoom hint; keep one-finger scrolling intact.
const phoneTouch = window.matchMedia('(hover: none) and (pointer: coarse) and (max-width: 600px)')
const preventPhoneGesture = (event: Event) => {
  if (phoneTouch.matches) event.preventDefault()
}
document.addEventListener('gesturestart', preventPhoneGesture, { passive: false })
document.addEventListener('gesturechange', preventPhoneGesture, { passive: false })
document.addEventListener('touchmove', (event) => {
  if (phoneTouch.matches && event.touches.length > 1) event.preventDefault()
}, { passive: false })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
