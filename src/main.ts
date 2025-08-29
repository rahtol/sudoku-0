import './assets/main.css'
//import "./style.css";
//import "./flags.css";

import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from "primevue/config";
import Aura from '@primeuix/themes/aura';

const app = createApp(App);

app.use(PrimeVue, { 
    ripple: true,
    theme: {
        preset: Aura,
        options: {
            prefix: 'p',
            darkModeSelector: '.p-dark',
            cssLayer: false,
        }
    },
});

app.mount('#app')
