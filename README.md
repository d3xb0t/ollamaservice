# ChatBot Backend

Este proyecto es el backend para una aplicación de chat impulsada por inteligencia artificial. Está construido con Node.js y Express, y se conecta al servicio Ollama para generar respuestas a los mensajes de los usuarios.

## Decisiones de Arquitectura

### Funciones Flecha vs. Clases

Este proyecto utiliza funciones flecha (`const myFunction = () => {}`) en lugar de clases (`class MyClass {}`) o grandes objetos literales para definir la lógica de controladores, servicios y utilidades. Esta decisión se basa en la simplicidad y naturaleza específica del proyecto:

*   **Simplicidad:** Las funciones flecha ofrecen una sintaxis concisa y clara, reduciendo el "boilerplate" y facilitando la lectura del código para un proyecto de este tamaño.
*   **Modularidad:** La estructura ya está bien organizada en módulos separados (controladores, servicios, etc.). Las funciones flecha se integran naturalmente con esta modularidad sin necesidad de envolver la lógica en clases innecesarias.
*   **Estado:** Este backend es principalmente stateless. Las funciones puras o que operan con estado externo (como la base de datos) son suficientes. Las clases no aportan beneficios significativos en este contexto.
*   **Consistencia con el Ecosistema Node.js:** Es un patrón muy común y aceptado en la comunidad Node.js/Express moderna.

Cambiar a clases u objetos grandes no aumentaría la "madurez" del proyecto, sino que podría introducir complejidad innecesaria. La verdadera madurez proviene de buenas prácticas como la modularidad, validación, manejo de errores y logging, las cuales ya están implementadas.

### Automatización de Pruebas

Las pruebas unitarias e integrales para este proyecto son creadas y mantenidas con la ayuda de **Qwen Code**, un agente de ingeniería de software interactivo. Qwen Code puede generar, actualizar y verificar pruebas automáticamente, asegurando una cobertura completa y facilitando el desarrollo.

## Características

*   **Arquitectura Modular:** Organizado en controladores, servicios, rutas y middlewares para una fácil mantenibilidad y escalabilidad.
*   **Validación de Entrada:** Utiliza Zod para validar rigurosamente los mensajes de los usuarios.
*   **Prevención de Jailbreak:** Implementa una lista de patrones prohibidos para evitar solicitudes maliciosas.
*   **Manejo Centralizado de Errores:** Un sistema robusto para capturar y responder a errores de forma consistente.
*   **Logging Avanzado:** Registra solicitudes, respuestas y eventos con Winston, incluyendo rotación de archivos diaria.
*   **Trazabilidad:** Asigna automáticamente un ID único a cada solicitud para facilitar la depuración y el seguimiento.
*   **Rate Limiting:** Limita la cantidad de solicitudes por usuario para prevenir abusos.
*   **Documentación de la API:** Documentación automática de la API utilizando Swagger/OpenAPI.
*   **Conexión a Base de Datos:** Integración con MongoDB, incluyendo reintentos automáticos en caso de fallos de conexión.
*   **Pruebas Unitarias e Integrales:** Incluye un conjunto completo de pruebas para garantizar la calidad del código, creadas con Qwen Code.
*   **Variables de Entorno:** Configuración flexible usando `dotenv`.

## Tecnologías

*   Node.js
*   Express
*   Ollama (para generación de texto)
*   MongoDB (con Mongoose)
*   Zod (para validación)
*   Winston (para logging)
*   Swagger (para documentación)
*   Vitest (para pruebas)

## Primeros Pasos

### Prerrequisitos

*   Node.js (versión recomendada: 18.x o superior)
*   npm (normalmente viene con Node.js)
*   Instancia de Ollama ejecutándose localmente. Puedes descargarla desde [https://ollama.com/](https://ollama.com/).
*   Instancia de MongoDB ejecutándose localmente o una URL de conexión a un clúster MongoDB (configurable en `.env`).

### Instalación

1.  Clona el repositorio:
    ```bash
    git clone https://github.com/tu-usuario/chatbot-backend.git
    cd chatbot-backend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Crea un archivo `.env` en la raíz del proyecto basado en `.env.example` (si existe) o asegúrate de que las variables de entorno necesarias estén definidas:
    ```env
    PORT=3000
    NODE_ENV=development
    MONGODB_URI=mongodb://localhost:27017/chatbot # Ajusta según tu configuración
    ```

### Ejecutar la Aplicación

*   **Modo Desarrollo (con reinicio automático):**
    ```bash
    npm run dev
    ```
    La API estará disponible en `http://localhost:3000`. La documentación de la API se puede encontrar en `http://localhost:3000/api-docs`.

### Ejecutar Pruebas

*   **Ejecutar todas las pruebas:**
    ```bash
    npm test
    ```
*   **Ejecutar pruebas una sola vez:**
    ```bash
    npm run test:run
    ```
*   **Generar reporte de cobertura:**
    ```bash
    npm run test:coverage
    ```

## Uso de la API

Consulta la documentación interactiva de la API en `http://localhost:3000/api-docs` cuando el servidor esté en ejecución.

El endpoint principal es `POST /` que recibe un objeto JSON con la clave `prompt`. Por ejemplo:

```json
{
  "prompt": "Hola, ¿cómo estás?"
}
```

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir lo que te gustaría cambiar.

## Licencia

[MIT](LICENSE)