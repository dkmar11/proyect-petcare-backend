workspace "PetCare Home Services" "Arquitectura de Código (C4 Nivel 4) - Backend" {

    model {
        // Se definen en el modelo global, pero interactúan con el contenedor, no con el código interno.
        petOwner = person "Dueño de Mascota" "Cliente que solicita reservas." "Customer"
        serviceProvider = person "Proveedor de Servicios" "Atiende agenda." "Provider"
        operations = person "Operaciones" "Mantenimiento." "Ops"

        mappingService = softwareSystem "Servicio de Mapas" "Google Maps." "External System"
        paymentGateway = softwareSystem "Pasarela de Pagos" "Stripe/PayPal." "External System"

        petCareBackend = softwareSystem "PetCare Backend" "API REST en Node.js/Express." "Target System" {
            
            postgres = container "PostgreSQL" "Base de datos principal." "PostgreSQL" "Database"
            fileStorage = container "Vaccination Storage" "Directorio uploads/." "Filesystem" "Storage"

            backendApi = container "Core API" "Monolito modular Express." "Node.js + Express" "Backend" {

                
                // Raíz (src/)
                appJs = component "app.js / server.js" "Punto de entrada. Inicializa Express y monta middlewares/rutas." "Node.js"
                
                // config/
                configModule = component "config.js" "Carga de variables de entorno (.env)." "Module"

                // middlewares/
                asyncMiddleware = component "async-handler.js" "Wrapper para errores en promesas." "Express middleware"
                errorMiddleware = component "error-handler.js" "Manejador global de respuestas de error." "Express middleware"

                // routes/
                routesIndex = component "index.routes.js" "Enrutador principal que agrupa los demás." "Router"
                routesUsers = component "users.routes.js" "Endpoints de usuarios." "Router"
                routesBookings = component "bookings.routes.js" "Endpoints de reservas." "Router"

                // controllers/
                userController = component "user.controller.js" "Extrae req.body/params y orquesta la respuesta." "Controller"
                bookingController = component "booking.controller.js" "Controlador HTTP para reservas." "Controller"

                // services/
                userService = component "user.service.js" "Lógica de aplicación para usuarios." "Service"
                bookingService = component "booking.service.js" "Lógica principal de reservas." "Service"

                // domain/
                bookingRules = component "booking.rules.js" "Reglas puras de validación de negocio." "Domain rules"
                appError = component "app-error.js" "Clase base para errores de dominio." "Domain error"

                // infrastructure/ & prisma/
                prismaClient = component "prisma/client.js" "Cliente ORM autogenerado." "Prisma Client"
                mapsAdapter = component "google-maps.service.js" "Adaptador de geocodificación." "Infrastructure adapter"
                vaccinationUpload = component "vaccination-upload.js" "Configuración de Multer." "Infrastructure adapter"
            }
        }

        // --- 3. RELACIONES EXTERNAS (Al contenedor) ---
        petOwner -> backendApi "Consume API" "JSON/HTTPS"
        serviceProvider -> backendApi "Consume API" "JSON/HTTPS"
        operations -> backendApi "Ejecuta CRON" "HTTPS"

        // --- 4. RELACIONES INTERNAS DE CÓDIGO ---
        appJs -> configModule "Carga configuración"
        appJs -> asyncMiddleware "Registra"
        appJs -> errorMiddleware "Registra"
        appJs -> routesIndex "Monta rutas base"

        routesIndex -> routesUsers "Monta"
        routesIndex -> routesBookings "Monta"

        routesUsers -> userController "Delega a"
        routesBookings -> bookingController "Delega a"

        userController -> userService "Ejecuta caso de uso"
        bookingController -> bookingService "Ejecuta caso de uso"

        userService -> prismaClient "Lee/Escribe"
        bookingService -> prismaClient "Lee/Escribe"
        bookingService -> bookingRules "Valida estado"
        bookingService -> mapsAdapter "Obtiene ubicación"
        
        // Uso de errores de dominio
        userService -> appError "Lanza error si falla"
        bookingService -> appError "Lanza error si falla"

        // Infraestructura y BD
        prismaClient -> postgres "Queries SQL" "TCP/IP"
        vaccinationUpload -> fileStorage "Guarda binarios"
        mapsAdapter -> mappingService "Llama a API externa" "HTTPS"
        bookingService -> paymentGateway "Confirma pago" "HTTPS"
    }

    views {
        component backendApi "Codigo-Backend-C4" {
            include *
            // LA CLAVE ESTÁ AQUÍ: Ocultamos a las personas y sistemas que no aportan al código interno.
            exclude petOwner serviceProvider operations configModule
            autoLayout lr
            description "Nivel 4 (Código): Clases, módulos y dependencias internas de la API."
        }

        styles {
            element "Person" {
                shape Person
                background #08427b
                color #ffffff
            }
            element "Target System" {
                shape RoundedBox
                background #1168bd
                color #ffffff
            }
            element "External System" {
                shape RoundedBox
                background #999999
                color #ffffff
            }
            element "Backend" {
                shape RoundedBox
                background #0b5ed7
                color #ffffff
            }
            element "Component" {
                background #d9f0ff
                color #0b2239
            }
            element "Database" {
                shape Cylinder
                background #23a2d9
                color #ffffff
            }
            element "Storage" {
                shape Folder
                background #23a2d9
                color #ffffff
            }
        }
    }
}