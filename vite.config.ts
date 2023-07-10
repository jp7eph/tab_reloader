import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {crx, defineManifest} from '@crxjs/vite-plugin'
// import manifest from './manifest.json' assert {type: 'json'} // Node >=17

const manifest = defineManifest({
    manifest_version: 3,
    name: 'tab reloader',
    description: 'Reload tab in periodic time',
    version: '0.0.1',
    permissions: [
        "alarms",
        "tabs",
    ],
    icons: {
        '16': 'icons/icon_16.png',
        '32': 'icons/icon_32.png',
        '48': 'icons/icon_48.png',
        '128': 'icons/icon_128.png',
        '256': 'icons/icon_256.png',
    },
    action: {
        'default_popup': 'index.html'
    },
    background: {
        service_worker: 'src/background.ts',
        type: "module",
    }
})

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        crx({manifest}),
    ],
})
