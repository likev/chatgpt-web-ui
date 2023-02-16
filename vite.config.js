// vite.config.js
const { resolve } = require('path')
const { defineConfig } = require('vite')

module.exports = defineConfig({
  //base: '/climate-search/',
  
  build: {
    //outDir: 'docs',
    
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  }
})
