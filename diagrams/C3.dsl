
workspace "PetCare Backend - Componentes" "Diagrama C3 alineado a la estructura de carpetas" {

    model {
        cliente = person "Cliente" "Dueño de mascota que registra perfiles y agenda servicios."
        proveedor = person "Proveedor" "Confirma y actualiza estados de reservas."

        frontend = softwareSystem "PetCare Frontend" "SPA que consume la API REST."
        googleMaps = softwareSystem "Google Maps" "Servicio externo para generar enlaces de ubicación."
        pasarelaPago = softwareSystem "Pasarela de Pagos" "Integración externa para confirmar pagos ONLINE."

        petcare = softwareSystem "PetCare Backend" "API REST para usuarios, mascotas y reservas." {
            
            api = container "API Application" "Aplicación Express." "Node.js, Express" {
                
                // Mapeo directo a las carpetas vistas en image_d9d777.png
                appServer = component "App & Server" "Punto de entrada e inicialización (app.js / server.js)." "Node.js"
                rutas = component "Routes" "Definición de endpoints y enrutamiento (src/routes)." "Express Router"
                middlewares = component "Middlewares" "Manejo global de errores y envoltorios asíncronos (src/middlewares)." "Express Middleware"
                controladores = component "Controllers" "Lógica de presentación HTTP y extracción de parámetros (src/controllers)." "Express Controllers"
                servicios = component "Services" "Orquestación de casos de uso de la aplicación (src/services)." "Node.js Modules"
                dominio = component "Domain" "Reglas de negocio puras y errores de aplicación (src/domain)." "JavaScript"
                infraestructura = component "Infrastructure" "Adaptadores de mapas, repositorios y subida de archivos (src/infrastructure)." "Node.js Modules"
                prismaClient = component "Prisma ORM" "Cliente de acceso a base de datos (prisma/)." "Prisma Client"
            }

            bd = container "PetCare Database" "Persistencia relacional." "PostgreSQL" {
                tags "Database"
            }

            archivos = container "Vaccination Files" "Directorio local de evidencias (uploads/)." "Filesystem" {
                tags "FileStorage"
            }
        }

        // Interacciones externas
        cliente -> frontend "Usa"
        proveedor -> frontend "Usa"
        
        frontend -> appServer "Consume API REST" "JSON/HTTPS"

        // Flujo interno de las capas (Arquitectura Limpia/Capas)
        appServer -> middlewares "Configura"
        appServer -> rutas "Monta las rutas principales en"
        
        rutas -> middlewares "Aplica validaciones de entrada en"
        rutas -> controladores "Delega peticiones a"
        
        controladores -> servicios "Ejecuta casos de uso a través de"
        controladores -> middlewares "Propaga excepciones a"
        
        servicios -> dominio "Valida reglas de negocio puras en"
        servicios -> infraestructura "Utiliza adaptadores externos de"
        servicios -> prismaClient "Lee y escribe datos vía"
        servicios -> pasarelaPago "Genera intenciones de pago en" "HTTP"

        // Responsabilidades de Infraestructura y Datos
        infraestructura -> googleMaps "Genera URLs de ubicación mediante"
        infraestructura -> archivos "Guarda comprobantes de vacunación en"
        infraestructura -> prismaClient "Accede a persistencia personalizada vía"
        
        prismaClient -> bd "Ejecuta queries SQL en" "TCP/IP"
    }

    views {
        component api "ComponentesBackend" "Vista C3: Componentes alineados a la estructura de directorios." {
            include *
            autolayout lr
        }

        styles {
            element "Person" {
                background "#0b4f6c"
                color "#ffffff"
                shape person
            }
            element "Software System" {
                background "#1f7a8c"
                color "#ffffff"
            }
            element "Container" {
                background "#3aa3b5"
                color "#ffffff"
            }
            element "Component" {
                background "#d9f0f4"
                color "#102a43"
            }
            element "Database" {
                shape cylinder
            }
            element "FileStorage" {
                shape folder
            }
        }
    }
}