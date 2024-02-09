import { createApp } from 'vue';
import App from './App.vue';
import axios from 'axios';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.css';
import 'vue-toast-notification/dist/theme-default.css'
import VueToast from 'vue-toast-notification'

const app = createApp(App);
app.use(VueToast);

app.config.globalProperties.$axios = axios;

app.provide('$axios', axios);

app.use(Vuetify);

app.mount('#app');