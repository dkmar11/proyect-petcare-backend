workspace "PetCare Backend" "C2 - Diagrama de contenedores con RabbitMQ" {

    model {
        petOwner = person "Dueno de Mascota" "Cliente final de la plataforma." "Customer"
        serviceProvider = person "Proveedor de Servicios" "Gestiona agenda y estados de servicio." "Provider"
        operations = person "Operaciones" "Ejecuta recordatorios y monitorea procesos." "Ops"

        frontend = softwareSystem "PetCare Frontend" "SPA React." "Client System"
        paymentGateway = softwareSystem "Pasarela de Pagos" "Sistema externo para pagos online." "External System"
        mappingService = softwareSystem "Google Maps" "Servicio externo de ubicacion." "External System"
        rabbitMq = softwareSystem "RabbitMQ" "Broker de eventos asincronos." "External System"

        petcare = softwareSystem "PetCare Backend" "API REST modular." "Target System" {
            api = container "Express API" "Expone endpoints /api y /api-docs; implementa modulos de negocio." "Node.js + Express" "Backend"
            database = container "PetCare Database" "Persistencia relacional de usuarios, mascotas, reservas, promociones y notificaciones." "PostgreSQL" "Database"
            files = container "Vaccination Files" "Almacenamiento local en uploads/vaccinations." "Filesystem" "Storage"
        }

        petOwner -> frontend "Usa" "Web"
        serviceProvider -> frontend "Usa" "Web"
        frontend -> api "Consume API" "JSON/HTTPS"

        operations -> api "Dispara /maintenance/appointment-reminders" "HTTPS"
        paymentGateway -> api "Confirma pagos en /bookings/:id/payment/confirm" "HTTPS/Webhook"

        api -> database "Lee y escribe" "TCP/IP"
        api -> files "Guarda y sirve archivos" "Filesystem"
        api -> mappingService "Genera links" "HTTPS"
        api -> rabbitMq "Publica PaymentConfirmed y consume payment.confirmed" "AMQP"
    }

    views {
        container petcare "Contenedores-PetCare-Backend" {
            include *
            autoLayout lr
            description "Contenedores reales del backend, incluyendo broker de eventos RabbitMQ."
        }

        styles {
            element "Person" {
                shape Person
                background #08427b
                color #ffffff
            }
            element "Target System" {
                background #1168bd
                color #ffffff
            }
            element "External System" {
                shape RoundedBox
                background #999999
                color #ffffff
            }
            element "Client System" {
                shape RoundedBox
                background #1f7a8c
                color #ffffff
            }
            element "Backend" {
                shape RoundedBox
                background #1168bd
                color #ffffff
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