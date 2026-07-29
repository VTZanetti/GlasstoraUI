import { createApp } from 'vue'
import App from './App.vue'
// The demo consumes the stylesheet the same way the install instructions tell
// users to. Relying on the side effect of the package entry is not enough,
// because the build tree shakes that import away.
import 'glasstora/style.css'
import './demo.css'

createApp(App).mount('#app')
