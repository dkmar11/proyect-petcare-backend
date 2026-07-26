workspace "PetCare Backend - Modular" "Arquitectura de codigo C4 Nivel 4" {

    model {
        cliente = person "Cliente" "Solicita servicios y administra sus mascotas." "Customer"
        proveedor = person "Proveedor" "Gestiona servicios y reservas." "Provider"
        operations = person "Operaciones" "Ejecuta tareas de mantenimiento." "Ops"

        mappingService = softwareSystem "Google Maps" "Servicio externo de mapas." "ExternalSystem"
        paymentGateway = softwareSystem "Pasarela de Pagos" "Proveedor externo de pagos online." "ExternalSystem"

        petcare = softwareSystem "PetCare Backend" "API REST Node.js/Express como monolito modular." "TargetSystem" {
            database = container "PetCare Database" "Persistencia relacional." "PostgreSQL" "Database"
            fileStorage = container "Vaccination Files" "Almacenamiento de cartillas." "Filesystem" "Storage"

            api = container "Express API" "Aplicacion Express que monta los paquetes de dominio." "Node.js + Express" "Backend" {
                app = component "app.js / server.js" "Inicializa Express y monta las rutas de cada modulo." "Entry point" "EntryPoint"

                sharedConfig = component "shared/config" "Carga variables de entorno y configuracion de Swagger." "Config" "Shared"
                sharedMiddleware = component "shared/middlewares" "Manejo asincrono y errores HTTP globales." "Express middleware" "Shared"
                sharedErrors = component "shared/errors" "Errores comunes de la aplicacion." "Error handling" "Shared"
                prismaClient = component "shared/infrastructure/persistence/prisma" "Cliente Prisma compartido por los modulos." "Prisma Client" "Shared"
                uploadAdapter = component "shared/infrastructure/storage" "Configuracion de Multer para cartillas." "Storage adapter" "Shared"

                userRoutes = component "users/*.routes.js" "Rutas de clientes y proveedores." "Router" "Users"
                userControllers = component "users/*controller.js" "Adaptadores HTTP del contexto de usuarios." "Controller" "Users"
                userServices = component "users/*service.js" "Casos de uso de usuarios y proveedores." "Application service" "Users"

                petRoutes = component "pets/pet.routes.js" "Rutas de perfiles y cartillas." "Router" "Pets"
                petController = component "pets/pet.controller.js" "Adaptador HTTP de mascotas." "Controller" "Pets"
                petService = component "pets/pet.service.js" "Casos de uso de mascotas." "Application service" "Pets"

                reservationRoutes = component "reservations/*.routes.js" "Rutas de reservas, promociones, mapas y notificaciones." "Router" "Reservations"
                reservationControllers = component "reservations/*controller.js" "Adaptadores HTTP de reservas." "Controller" "Reservations"
                reservationService = component "reservations/reservation.service.js" "Casos de uso de agendamiento y estados." "Application service" "Reservations"
                reservationRules = component "reservations/domain/booking.rules.js" "Reglas de validacion de reservas." "Domain rules" "Reservations"
                mapsAdapter = component "reservations/infrastructure/google-maps.service.js" "Adaptador para enlaces de Google Maps." "Infrastructure adapter" "Reservations"
                promotionService = component "reservations/promotion.service.js" "Reglas y consultas de promociones." "Application service" "Reservations"
                notificationService = component "reservations/notification.service.js" "Notificaciones de reservas y recordatorios." "Application service" "Reservations"
                notificationRepository = component "reservations/infrastructure/notification.repository.js" "Persistencia de notificaciones." "Repository" "Reservations"

                paymentRoutes = component "payments/payment.routes.js" "Ruta de confirmacion de pagos." "Router" "Payments"
                paymentController = component "payments/payment.controller.js" "Adaptador HTTP de pagos." "Controller" "Payments"
                paymentService = component "payments/payment.service.js" "Caso de uso de confirmacion de pagos." "Application service" "Payments"
            }
        }

        cliente -> api "Consume API" "JSON/HTTPS"
        proveedor -> api "Consume API" "JSON/HTTPS"
        operations -> api "Ejecuta mantenimiento" "HTTPS"

        app -> sharedConfig "Carga"
        app -> sharedMiddleware "Registra"
        app -> userRoutes "Monta"
        app -> petRoutes "Monta"
        app -> reservationRoutes "Monta"
        app -> paymentRoutes "Monta"

        userRoutes -> userControllers "Delega a"
        petRoutes -> petController "Delega a"
        reservationRoutes -> reservationControllers "Delega a"
        paymentRoutes -> paymentController "Delega a"

        userControllers -> userServices "Ejecuta casos de uso"
        petController -> petService "Ejecuta casos de uso"
        reservationControllers -> reservationService "Ejecuta reservas"
        reservationControllers -> promotionService "Ejecuta promociones"
        reservationControllers -> notificationService "Ejecuta notificaciones"
        reservationControllers -> mapsAdapter "Genera enlaces"
        paymentController -> paymentService "Ejecuta confirmacion"

        userServices -> prismaClient "Lee y escribe"
        petService -> prismaClient "Lee y escribe"
        reservationService -> prismaClient "Lee y escribe"
        reservationService -> reservationRules "Valida reglas"
        reservationService -> promotionService "Consulta promociones"
        reservationService -> notificationService "Crea notificaciones"
        notificationService -> notificationRepository "Persiste"
        notificationRepository -> prismaClient "Usa"
        paymentService -> prismaClient "Actualiza estado de pago"

        petService -> uploadAdapter "Configura carga de cartillas"
        uploadAdapter -> fileStorage "Guarda archivos"
        mapsAdapter -> mappingService "Llama API externa" "HTTPS"
        paymentService -> paymentGateway "Confirma pago externo" "HTTPS"

        // No se modelan dependencias directas entre modulos de dominio.
        // TODO: Refactor to use Domain Events para PaymentConfirmed.
    }

    views {
        component api "CodigoPetCare" {
            include *
            exclude cliente proveedor operations mappingService paymentGateway database fileStorage
            autolayout lr
            description "Nivel 4: paquetes de dominio, adaptadores y dependencias internas."
        }

        styles {
            element "Person" {
                shape person
                background "#08427b"
                color "#ffffff"
            }
            element "TargetSystem" {
                shape roundedbox
                background "#1168bd"
                color "#ffffff"
            }
            element "ExternalSystem" {
                shape roundedbox
                background "#999999"
                color "#ffffff"
            }
            element "Backend" {
                shape roundedbox
                background "#0b5ed7"
                color "#ffffff"
            }
            element "Shared" {
                background "#6c757d"
                color "#ffffff"
            }
            element "Users" {
                background "#2a9d8f"
                color "#ffffff"
            }
            element "Pets" {
                background "#e9c46a"
                color "#102a43"
            }
            element "Reservations" {
                background "#f4a261"
                color "#102a43"
            }
            element "Payments" {
                background "#e76f51"
                color "#ffffff"
            }
            element "Database" {
                shape cylinder
                background "#23a2d9"
                color "#ffffff"
            }
            element "Storage" {
                shape folder
                background "#23a2d9"
                color "#ffffff"
            }
        }
    }
}
