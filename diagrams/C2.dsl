workspace "PetCare - Arquitectura SAGA" "C2 - Frontend, Backend, Orchestrator y RabbitMQ" {

    model {
        petOwner = person "Dueno de Mascota" "Cliente final de la plataforma." "Customer"
        serviceProvider = person "Proveedor de Servicios" "Gestiona agenda y estados de servicio." "Provider"

        frontend = softwareSystem "PetCare Frontend" "SPA React que crea y consulta reservas mediante la API del backend." "Client System"
        sagaOrchestrator = softwareSystem "PetCare SAGA Orchestrator" "Coordina payment, notification y la compensacion de la reserva." "Orchestrator"
        paymentGateway = softwareSystem "Pasarela de Pagos" "Sistema externo para pagos online." "External System"
        mappingService = softwareSystem "Google Maps" "Servicio externo de ubicacion." "External System"
        rabbitMq = softwareSystem "RabbitMQ" "Broker de comandos y eventos asincronos del patron SAGA." "Message Broker"

        petcare = softwareSystem "PetCare Backend" "API REST modular." "Target System" {
            api = container "Express API" "Expone endpoints /api y /api-docs; implementa modulos de negocio." "Node.js + Express" "Backend"
            database = container "PetCare Database" "Persistencia relacional de usuarios, mascotas, reservas, promociones y notificaciones." "PostgreSQL" "Database"
            files = container "Vaccination Files" "Almacenamiento local en uploads/vaccinations." "Filesystem" "Storage"
        }

        petOwner -> frontend "Usa" "Web"
        serviceProvider -> frontend "Usa" "Web"
        frontend -> api "Crea reserva: POST /api/bookings" "JSON/HTTPS"
        frontend -> api "Consulta reservas: GET /api/users/:userId/bookings" "JSON/HTTPS"

        paymentGateway -> api "Confirma pagos en /bookings/:id/payment/confirm" "HTTPS/Webhook"

        api -> database "Lee y escribe" "TCP/IP"
        api -> files "Guarda y sirve archivos" "Filesystem"
        api -> mappingService "Genera links" "HTTPS"
        api -> rabbitMq "Publica ReservationCreated, PaymentConfirmed, PaymentFailed y NotificationSent" "AMQP"
        rabbitMq -> api "Entrega PaymentRequested, NotificationRequested y ReservationCompensate" "AMQP"
        sagaOrchestrator -> rabbitMq "Publica comandos SAGA" "AMQP"
        rabbitMq -> sagaOrchestrator "Entrega eventos SAGA" "AMQP"
    }

    views {
        container petcare "Contenedores-PetCare-Backend" {
            include *
            include frontend
            include sagaOrchestrator
            include rabbitMq
            include paymentGateway
            include mappingService
            include petOwner
            include serviceProvider
            autoLayout lr
            description "C2 del patron SAGA: Frontend crea la reserva, Backend publica ReservationCreated y el Orchestrator coordina Payment, Notification y Compensation mediante RabbitMQ."
        }

        dynamic petcare "SAGA-Flujo-Exitoso" {
            title "Patron SAGA - flujo exitoso"
            frontend -> api "1. POST /api/bookings"
            api -> rabbitMq "2. ReservationCreated"
            rabbitMq -> sagaOrchestrator "3. Orchestrator recibe el evento"
            sagaOrchestrator -> rabbitMq "4. PaymentRequested"
            rabbitMq -> api "5. Backend procesa el pago"
            api -> rabbitMq "6. PaymentConfirmed"
            rabbitMq -> sagaOrchestrator "7. Orchestrator recibe confirmacion"
            sagaOrchestrator -> rabbitMq "8. NotificationRequested"
            rabbitMq -> api "9. Backend crea la notificacion"
            api -> rabbitMq "10. NotificationSent"
            rabbitMq -> sagaOrchestrator "11. SAGA COMPLETED"
            autoLayout lr
        }

        dynamic petcare "SAGA-Flujo-Compensacion" {
            title "Patron SAGA - PaymentFailed y compensacion"
            frontend -> api "1. POST /api/bookings"
            api -> rabbitMq "2. ReservationCreated"
            rabbitMq -> sagaOrchestrator "3. Orchestrator inicia PAYMENT"
            sagaOrchestrator -> rabbitMq "4. PaymentRequested"
            rabbitMq -> api "5. Backend procesa el pago"
            api -> rabbitMq "6. PaymentFailed"
            rabbitMq -> sagaOrchestrator "7. Orchestrator activa compensacion"
            sagaOrchestrator -> rabbitMq "8. ReservationCompensate"
            rabbitMq -> api "9. Backend elimina reserva y notificaciones"
            api -> rabbitMq "10. ReservationCompensated"
            rabbitMq -> sagaOrchestrator "11. SAGA COMPENSATED"
            autoLayout lr
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
            element "Orchestrator" {
                shape RoundedBox
                background #7b61ff
                color #ffffff
            }
            element "Message Broker" {
                shape Pipe
                background #f4b942
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