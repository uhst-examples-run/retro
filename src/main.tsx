import { createRoot } from 'react-dom/client';
import 'font-awesome/css/font-awesome.css';
import './styles/main.scss';
import { App } from './App';

// No StrictMode: every mount opens a real UHST connection, and StrictMode's
// double-mounting in development races the relay's host registration.
createRoot(document.getElementById('root')!).render(<App />);
