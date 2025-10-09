import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Configure Pusher for Laravel Echo
window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'pusher',
  key: 'local',
  cluster: 'mt1',
  wsHost: '127.0.0.1',
  wsPort: 6001,
  forceTLS: false,
  enabledTransports: ['ws'],
  disableStats: true,
  encrypted: false,
});

export default echo;
