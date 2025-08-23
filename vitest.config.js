import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true, // Permite usar APIs de Vitest directamente sin importarlos
    environment: 'node', // Entorno de ejecución
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'], // Patrón para encontrar tests
    coverage: {
      provider: 'v8', // Proveedor de cobertura
      reporter: ['text', 'lcov'], // Formatos de reporte
      include: [
        'src/**/*.js',
        '!src/logger.js', // Excluir logger de la cobertura
        '!src/server.js', // Excluir punto de entrada
        '!src/config/**'  // Excluir configuraciones
      ],
      reportsDirectory: './coverage' // Directorio para los reportes
    }
  }
})