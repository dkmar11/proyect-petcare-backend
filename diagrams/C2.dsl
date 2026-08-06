workspace "PetCare - Arquitectura SAGA" "C2 - Frontend, Backend, Orchestrator y RabbitMQ" {

    !identifiers hierarchical

    model {
        petOwner = person "Dueno de Mascota" "Cliente final de la plataforma." "Customer"
        serviceProvider = person "Proveedor de Servicios" "Gestiona agenda y estados de servicio." "Provider"

        frontend = softwareSystem "PetCare Frontend" "SPA React que crea y consulta reservas mediante la API del backend." "Client System"
        apiGateway = softwareSystem "PetCare API Gateway" "Punto unico de entrada HTTP para el frontend; enruta /api y /reservations-api hacia los servicios internos." "API Gateway"
        sagaOrchestrator = softwareSystem "PetCare SAGA Orchestrator" "Coordina payment, notification y la compensacion de la reserva." "Orchestrator"
        paymentGateway = softwareSystem "Pasarela de Pagos" "Sistema externo para pagos online." "External System"
        mappingService = softwareSystem "Google Maps" "Servicio externo de ubicacion." "External System"
        rabbitMq = softwareSystem "RabbitMQ" "Broker de comandos y eventos asincronos del patron SAGA." "Message Broker"

        reservations = softwareSystem "PetCare Reservations" "Microservicio que gestiona reservas con su propia base de datos." "Reservations Service" {
            api = container "Reservations API" "Expone los endpoints de reservas y publica eventos del SAGA." "Node.js + Express" "Reservations Backend"
            database = container "Reservations Database" "Persistencia exclusiva de reservas y promociones." "PostgreSQL" "Reservations Database"
        }

        petcare = softwareSystem "PetCare Backend" "API REST modular." "Target System" {
            api = container "Express API" "Expone endpoints /api y /api-docs; implementa modulos de negocio." "Node.js + Express" "Backend"
            database = container "PetCare Database" "Persistencia relacional de usuarios, mascotas y notificaciones." "PostgreSQL" "Database"
            files = container "Vaccination Files" "Almacenamiento local en uploads/vaccinations." "Filesystem" "Storage"
        }

        petOwner -> frontend "Usa" "Web"
        serviceProvider -> frontend "Usa" "Web"
        frontend -> apiGateway "Consume API publica" "JSON/HTTPS"
        apiGateway -> petcare.api "Enruta /api: usuarios, mascotas, pagos y notificaciones" "HTTP"
        apiGateway -> reservations.api "Enruta /reservations-api: reservas" "HTTP"

        paymentGateway -> petcare.api "Confirma pagos en /bookings/:id/payment/confirm" "HTTPS/Webhook"

        petcare.api -> petcare.database "Lee y escribe" "TCP/IP"
        petcare.api -> petcare.files "Guarda y sirve archivos" "Filesystem"
        reservations.api -> reservations.database "Lee y escribe reservas" "TCP/IP"
        reservations.api -> mappingService "Genera links de ubicacion" "HTTPS"
        petcare.api -> rabbitMq "Publica PaymentConfirmed, PaymentFailed y NotificationSent" "AMQP"
        reservations.api -> rabbitMq "Publica ReservationCreated" "AMQP"
        rabbitMq -> petcare.api "Entrega PaymentRequested y NotificationRequested" "AMQP"
        rabbitMq -> reservations.api "Entrega ReservationCompensate" "AMQP"
        sagaOrchestrator -> rabbitMq "Publica comandos SAGA" "AMQP"
        rabbitMq -> sagaOrchestrator "Entrega eventos SAGA" "AMQP"
    }

    views {
        container petcare "Contenedores-PetCare-Backend" {
            include *
            include frontend
            include apiGateway
            include sagaOrchestrator
            include rabbitMq
            include paymentGateway
            include mappingService
            include reservations
            include petOwner
            include serviceProvider
            autoLayout lr
            description "C2 del patron SAGA: Frontend consume el API Gateway, que enruta hacia Backend y Reservations; el Orchestrator coordina Payment, Notification y Compensation mediante RabbitMQ."
        }

        dynamic petcare "SAGA-Flujo-Exitoso" {
            title "Patron SAGA - flujo exitoso"
            frontend -> apiGateway "1. POST /reservations-api/bookings"
            apiGateway -> reservations.api "2. Enruta POST /api/bookings"
            reservations.api -> rabbitMq "3. ReservationCreated"
            rabbitMq -> sagaOrchestrator "4. Orchestrator recibe el evento"
            sagaOrchestrator -> rabbitMq "5. PaymentRequested"
            rabbitMq -> petcare.api "6. Backend procesa el pago"
            petcare.api -> rabbitMq "7. PaymentConfirmed"
            rabbitMq -> sagaOrchestrator "8. Orchestrator recibe confirmacion"
            sagaOrchestrator -> rabbitMq "9. NotificationRequested"
            rabbitMq -> petcare.api "10. Backend crea la notificacion"
            petcare.api -> rabbitMq "11. NotificationSent"
            rabbitMq -> sagaOrchestrator "12. SAGA COMPLETED"
            autoLayout lr
        }

        dynamic petcare "SAGA-Flujo-Compensacion" {
            title "Patron SAGA - PaymentFailed y compensacion"
            frontend -> apiGateway "1. POST /reservations-api/bookings"
            apiGateway -> reservations.api "2. Enruta POST /api/bookings"
            reservations.api -> rabbitMq "3. ReservationCreated"
            rabbitMq -> sagaOrchestrator "4. Orchestrator inicia PAYMENT"
            sagaOrchestrator -> rabbitMq "5. PaymentRequested"
            rabbitMq -> petcare.api "6. Backend procesa el pago"
            petcare.api -> rabbitMq "7. PaymentFailed"
            rabbitMq -> sagaOrchestrator "8. Orchestrator activa compensacion"
            sagaOrchestrator -> rabbitMq "9. ReservationCompensate"
            rabbitMq -> reservations.api "10. Reservations elimina la reserva"
            reservations.api -> rabbitMq "11. ReservationCompensated"
            rabbitMq -> sagaOrchestrator "12. SAGA COMPENSATED"
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
            element "API Gateway" {
                shape RoundedBox
                background #5c677d
                color #ffffff
            }
            element "Reservations Service" {
                shape RoundedBox
                background #2a9d8f
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
            element "Reservations Backend" {
                shape RoundedBox
                background #2a9d8f
                color #ffffff
            }
            element "Reservations Database" {
                shape Cylinder
                background #52b788
                color #ffffff
            }
        }
    }
}