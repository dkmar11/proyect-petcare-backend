workspace "PetCare Backend - Modular" "C4 - Codigo con modulo Notifications y RabbitMQ" {

    !identifiers hierarchical

    model {
        cliente = person "Cliente" "Solicita servicios y administra sus mascotas." "Customer"
        proveedor = person "Proveedor" "Gestiona servicios y reservas." "Provider"
        operations = person "Operaciones" "Ejecuta tareas de mantenimiento." "Ops"

        mappingService = softwareSystem "Google Maps" "Servicio externo de mapas." "ExternalSystem"
        paymentGateway = softwareSystem "Pasarela de Pagos" "Proveedor externo de pagos online." "ExternalSystem"
        rabbitMq = softwareSystem "RabbitMQ" "Broker de mensajeria." "ExternalSystem"

        petcare = softwareSystem "PetCare Backend" "API REST Node.js/Express como monolito modular." "TargetSystem" {
            database = container "PetCare Database" "Persistencia relacional." "PostgreSQL" "Database"
            fileStorage = container "Vaccination Files" "Almacenamiento de cartillas." "Filesystem" "Storage"

                api = container "Express API" "Aplicacion Express que monta modulos y subscribers." "Node.js + Express" "Backend" {
                app = component "app.js" "Configura Express, middlewares y rutas de modulos." "Entry point" "EntryPoint"
                server = component "server.js" "Bootstrap: inicia RabbitMQ, subscriber y servidor HTTP." "Bootstrap" "EntryPoint"

                sharedConfig = component "shared/config" "env.js y swagger.js." "Config" "Shared"
                sharedMiddleware = component "shared/middlewares" "async-handler y error-handler." "Express middleware" "Shared"
                sharedErrors = component "shared/errors/app-error.js" "Error de dominio comun." "Error handling" "Shared"
                prismaClient = component "shared/infrastructure/persistence/prisma/client.js" "Cliente Prisma compartido." "Prisma Client" "Shared"
                uploadAdapter = component "shared/infrastructure/storage/vaccination-upload.js" "Multer para cartillas." "Storage adapter" "Shared"
                rabbitBus = component "shared/infrastructure/RabbitMQBus.js" "Bus AMQP para publish/subscribe." "Messaging adapter" "Shared"

                usersRoutes = component "modules/users/*.routes.js" "Rutas de usuarios y proveedores." "Router" "Users"
                usersControllers = component "modules/users/*controller.js" "Controladores de usuarios/proveedores." "Controller" "Users"
                usersServices = component "modules/users/*service.js" "Casos de uso de usuarios/proveedores." "Application service" "Users"

                petsRoutes = component "modules/pets/pet.routes.js" "Rutas de mascotas y vacunas." "Router" "Pets"
                petsController = component "modules/pets/pet.controller.js" "Controlador de mascotas." "Controller" "Pets"
                petsService = component "modules/pets/pet.service.js" "Casos de uso de mascotas." "Application service" "Pets"

                reservationsRoutes = component "modules/reservations/reservation.routes.js" "Rutas de reservas." "Router" "Reservations"
                reservationsController = component "modules/reservations/reservation.controller.js" "Controlador de reservas." "Controller" "Reservations"
                reservationsService = component "modules/reservations/reservation.service.js" "Agendamiento y cambios de estado." "Application service" "Reservations"
                reservationsRules = component "modules/reservations/domain/booking.rules.js" "Reglas de validacion de reservas." "Domain rules" "Reservations"
                promotionsRoutes = component "modules/reservations/promotion.routes.js" "Rutas de promociones." "Router" "Reservations"
                promotionsController = component "modules/reservations/promotion.controller.js" "Controlador de promociones." "Controller" "Reservations"
                promotionsService = component "modules/reservations/promotion.service.js" "Consulta y validacion de promociones." "Application service" "Reservations"
                mapRoutes = component "modules/reservations/map.routes.js" "Rutas de mapas." "Router" "Reservations"
                mapController = component "modules/reservations/map.controller.js" "Controlador de links de mapa." "Controller" "Reservations"
                mapsAdapter = component "modules/reservations/infrastructure/google-maps.service.js" "Adaptador Google Maps." "Infrastructure adapter" "Reservations"
                paymentSubscriber = component "modules/reservations/subscribers/paymentSubscriber.js" "Consumer de payment.confirmed." "Subscriber" "Reservations"

                notificationsRoutes = component "modules/notifications/notification.routes.js" "Rutas de notificaciones y mantenimiento." "Router" "Notifications"
                notificationsController = component "modules/notifications/notification.controller.js" "Controlador de notificaciones." "Controller" "Notifications"
                notificationsService = component "modules/notifications/notification.service.js" "Listado, markRead y reminders." "Application service" "Notifications"
                notificationsRepository = component "modules/notifications/infrastructure/notification.repository.js" "Persistencia de notificaciones." "Repository" "Notifications"

                paymentsRoutes = component "modules/payments/payment.routes.js" "Ruta de confirmacion de pagos." "Router" "Payments"
                paymentsController = component "modules/payments/payment.controller.js" "Controlador de pagos." "Controller" "Payments"
                paymentsService = component "modules/payments/payment.service.js" "Confirma pago y publica PaymentConfirmed." "Application service" "Payments"
            }
        }

        cliente -> petcare.api "Consume API" "JSON/HTTPS"
        proveedor -> petcare.api "Consume API" "JSON/HTTPS"
        operations -> petcare.api "Ejecuta mantenimiento" "HTTPS"
        paymentGateway -> petcare.api.paymentsRoutes "Invoca confirmacion de pago" "HTTPS/Webhook"

        petcare.api.server -> petcare.api.rabbitBus "Inicializa y cierra"
        petcare.api.server -> petcare.api.paymentSubscriber "Arranca consumidor"
        petcare.api.app -> petcare.api.sharedConfig "Carga"
        petcare.api.app -> petcare.api.sharedMiddleware "Registra"
        petcare.api.app -> petcare.api.usersRoutes "Monta"
        petcare.api.app -> petcare.api.petsRoutes "Monta"
        petcare.api.app -> petcare.api.reservationsRoutes "Monta"
        petcare.api.app -> petcare.api.notificationsRoutes "Monta"
        petcare.api.app -> petcare.api.promotionsRoutes "Monta"
        petcare.api.app -> petcare.api.mapRoutes "Monta"
        petcare.api.app -> petcare.api.paymentsRoutes "Monta"

        petcare.api.usersRoutes -> petcare.api.usersControllers "Delega"
        petcare.api.usersControllers -> petcare.api.usersServices "Ejecuta casos de uso"
        petcare.api.usersServices -> petcare.api.prismaClient "Lee y escribe"
        petcare.api.usersServices -> petcare.api.sharedErrors "Lanza errores"

        petcare.api.petsRoutes -> petcare.api.petsController "Delega"
        petcare.api.petsController -> petcare.api.petsService "Ejecuta casos de uso"
        petcare.api.petsService -> petcare.api.prismaClient "Lee y escribe"
        petcare.api.petsRoutes -> petcare.api.uploadAdapter "Middleware de upload"
        petcare.api.uploadAdapter -> petcare.fileStorage "Guarda archivos"
        petcare.api.petsService -> petcare.api.sharedErrors "Lanza errores"

        petcare.api.reservationsRoutes -> petcare.api.reservationsController "Delega"
        petcare.api.reservationsController -> petcare.api.reservationsService "Ejecuta reservas"
        petcare.api.reservationsService -> petcare.api.reservationsRules "Valida reglas"
        petcare.api.reservationsService -> petcare.api.promotionsService "Consulta promociones"
        petcare.api.reservationsService -> petcare.api.notificationsService "Crea notificaciones"
        petcare.api.reservationsService -> petcare.api.mapsAdapter "Genera links"
        petcare.api.reservationsService -> petcare.api.prismaClient "Lee y escribe"
        petcare.api.reservationsService -> petcare.api.sharedErrors "Lanza errores"

        petcare.api.promotionsRoutes -> petcare.api.promotionsController "Delega"
        petcare.api.promotionsController -> petcare.api.promotionsService "Ejecuta"
        petcare.api.promotionsService -> petcare.api.prismaClient "Lee y escribe"

        petcare.api.mapRoutes -> petcare.api.mapController "Delega"
        petcare.api.mapController -> petcare.api.mapsAdapter "Genera enlaces"
        petcare.api.mapsAdapter -> mappingService "Llama API externa" "HTTPS"

        petcare.api.notificationsRoutes -> petcare.api.notificationsController "Delega"
        petcare.api.notificationsController -> petcare.api.notificationsService "Ejecuta"
        petcare.api.notificationsService -> petcare.api.notificationsRepository "Persiste"
        petcare.api.notificationsService -> petcare.api.prismaClient "Consulta"
        petcare.api.notificationsRepository -> petcare.api.prismaClient "Usa"

        petcare.api.paymentsRoutes -> petcare.api.paymentsController "Delega"
        petcare.api.paymentsController -> petcare.api.paymentsService "Ejecuta"
        petcare.api.paymentsService -> petcare.api.prismaClient "Actualiza pago"
        petcare.api.paymentsService -> petcare.api.rabbitBus "Publica PaymentConfirmed"
        petcare.api.rabbitBus -> rabbitMq "Publica y consume" "AMQP"

        rabbitMq -> petcare.api.paymentSubscriber "Entrega payment.confirmed" "AMQP"
        petcare.api.paymentSubscriber -> petcare.api.reservationsService "handlePaymentConfirmed"

        petcare.api.prismaClient -> petcare.database "Queries SQL" "TCP/IP"
    }

    views {
        component petcare.api "CodigoPetCare" {
            include *
            exclude cliente proveedor operations mappingService paymentGateway rabbitMq petcare.database petcare.fileStorage
            autolayout lr
            description "Nivel 4: modulos de codigo, dependencias internas y flujo asincrono RabbitMQ."
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
            element "Notifications" {
                background "#577590"
                color "#ffffff"
            }
            element "Payments" {
                background "#e76f51"
                color "#ffffff"
            }
            element "EntryPoint" {
                background "#264653"
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
