import axios from 'axios';
import _ from 'lodash';

window._ = _;

/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

(window as any).axios = axios;

(window as any).axios.defaults.headers.common['X-Requested-With'] =
  'XMLHttpRequest';

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */

import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
(window as any).Pusher = Pusher;

(window as any).Echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY || 'local_key',
  wsHost: import.meta.env.VITE_PUSHER_HOST || `ws-${import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1'}.pusher.com`,
  wsPort: import.meta.env.VITE_PUSHER_PORT || 80,
  wssPort: import.meta.env.VITE_PUSHER_PORT || 443,
  forceTLS: (import.meta.env.VITE_PUSHER_SCHEME || 'https') === 'https',
  enabledTransports: ['ws', 'wss'],
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
});
