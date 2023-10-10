import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import '/node_modules/@chrisoakman/chessboard2/dist/chessboard2.min.css';

const app = createApp(App);

app.use(router);

app.mount('#app');
