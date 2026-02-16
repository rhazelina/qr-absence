import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { API_BASE_URL, TOKEN_KEY } from './constants';

window.Pusher = Pusher;

const createEcho = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    // Extract host and port from API_BASE_URL or use env vars
    // API_BASE_URL is like http://127.0.0.1:8000/api
    // Reverb is usually on port 8080.
    
    const reverbHost = window.location.hostname; // e.g. localhost or 127.0.0.1
    const reverbPort = 8080; // Default Reverb port

    const echo = new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST || reverbHost,
        wsPort: import.meta.env.VITE_REVERB_PORT || reverbPort,
        wssPort: import.meta.env.VITE_REVERB_PORT || reverbPort,
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${API_BASE_URL}/broadcasting/auth`,
        auth: {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        },
    });

    return echo;
};

export const echo = createEcho();
export default echo;
