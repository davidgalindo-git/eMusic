import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import '@mdi/font/css/materialdesignicons.css'
import App from './App.vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi',
    },
})

const app = createApp(App)
app.use(createPinia())
app.use(vuetify)
app.mount('#app')