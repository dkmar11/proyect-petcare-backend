workspace "PetCare Backend - Modular" "C3 - Modulos, mensajeria y consumidores del patron SAGA" {

    !identifiers hierarchical

    model {
        cliente = person "Cliente" "Dueno de mascota que registra perfiles y agenda servicios."
        proveedor = person "Proveedor" "Atiende servicios y actualiza estados de reservas."

        frontend = softwareSystem "PetCare Frontend" "SPA que consume la API REST."
        apiGateway = softwareSystem "PetCare API Gateway" "Punto unico de entrada HTTP; enruta /api y /reservations-api hacia los servicios internos." "API Gateway"
        sagaOrchestrator = softwareSystem "PetCare SAGA Orchestrator" "Dispara los comandos SAGA hacia el backend y consume sus eventos de resultado." "Orchestrator"
        googleMaps = softwareSystem "Google Maps" "Servicio externo para generar enlaces de ubicacion."
        paymentGateway = softwareSystem "Pasarela de Pagos" "Proveedor externo para pagos online."
        rabbitMq = softwareSystem "RabbitMQ" "Broker de comandos y eventos entre el backend y el orquestador." "Message Broker"

        reservationsService = softwareSystem "PetCare Reservations" "Microservicio independiente para reservas, con base de datos propia." "Reservations Service" {
            api = container "Reservations API" "Aplicacion Node.js que expone las rutas de reservas y publica eventos." "Node.js, Express" {
                reservations = component "Reservations Module" "POST /bookings, reglas y persistencia de reservas." "Domain module" {
                    tags "DomainModule"
                }
                reservationCompensationSubscriber = component "Reservation Compensation Subscriber" "Recibe ReservationCompensate, elimina la reserva y publica ReservationCompensated." "Subscriber" {
                    tags "Subscriber"
                }
            }
            database = container "Reservations Database" "Persistencia exclusiva de reservas y promociones." "PostgreSQL" {
                tags "Reservations Database"
            }
        }

        petcare = softwareSystem "PetCare Backend" "API REST implementada como monolito modular." {
            api = container "Express API" "Aplicacion Node.js que monta modulos y middlewares compartidos." "Node.js, Express" {
                app = component "App and Server" "Puntos de entrada app.js y server.js; inicia consumidores de pagos, notificaciones y compensaciones." "Node.js" {
                    tags "EntryPoint"
                }
                shared = component "Shared" "Config, errores, middlewares, Prisma, storage y RabbitMQBus." "Shared infrastructure" {
                    tags "Shared"
                }
                users = component "Users Module" "Clientes, proveedores y autenticacion." "Domain module" {
                    tags "DomainModule"
                }
                pets = component "Pets Module" "Perfiles de mascotas y cartillas de vacunacion." "Domain module" {
                    tags "DomainModule"
                }
                notifications = component "Notifications Module" "Listado, marcado y recordatorios de notificaciones." "Domain module" {
                    tags "DomainModule"
                }
                payments = component "Payments Module" "Confirmacion de pagos y publicacion de eventos PaymentConfirmed." "Domain module" {
                    tags "DomainModule"
                }
                paymentSubscriber = component "Payment Subscriber" "Suscribe payment.confirmed y sincroniza reservas." "Subscriber" {
                    tags "Subscriber"
                }
                paymentCommandSubscriber = component "Payment Command Subscriber" "Recibe PaymentRequested desde RabbitMQ y ejecuta el pago; publica PaymentConfirmed o PaymentFailed." "Subscriber" {
                    tags "Subscriber"
                }
                notificationCommandSubscriber = component "Notification Command Subscriber" "Recibe NotificationRequested desde RabbitMQ y publica NotificationSent o NotificationFailed." "Subscriber" {
                    tags "Subscriber"
                }
            }

            database = container "PetCare Database" "Persistencia relacional de usuarios, mascotas y notificaciones." "PostgreSQL" {
                tags "Database"
            }
            files = container "Vaccination Files" "Almacenamiento local de evidencias de vacunacion." "Filesystem" {
                tags "FileStorage"
            }
        }

        cliente -> frontend "Usa"
        proveedor -> frontend "Usa"
        frontend -> apiGateway "Consume API publica" "JSON/HTTPS"
        apiGateway -> petcare.api.app "Enruta /api hacia usuarios, mascotas, pagos y notificaciones" "HTTP"
        apiGateway -> reservationsService.api "Enruta /reservations-api hacia reservas" "HTTP"
        sagaOrchestrator -> rabbitMq "1. Publica comandos SAGA" "AMQP"
        rabbitMq -> sagaOrchestrator "Eventos de resultado: ReservationCreated, PaymentConfirmed, PaymentFailed, NotificationSent y ReservationCompensated" "AMQP"
        paymentGateway -> petcare.api.payments "Invoca confirmacion de pago" "HTTPS/Webhook"

        petcare.api.app -> petcare.api.shared "Inicializa configuracion y middlewares"
        petcare.api.app -> petcare.api.users "Monta rutas de users"
        petcare.api.app -> petcare.api.pets "Monta rutas de pets"
        petcare.api.app -> petcare.api.notifications "Monta rutas de notifications"
        petcare.api.app -> petcare.api.payments "Monta rutas de payments"
        petcare.api.app -> petcare.api.paymentSubscriber "Arranca consumidor payment.confirmed"
        petcare.api.app -> petcare.api.paymentCommandSubscriber "Arranca consumidor PaymentRequested"
        petcare.api.app -> petcare.api.notificationCommandSubscriber "Arranca consumidor NotificationRequested"

        petcare.api.users -> petcare.api.shared "Usa Prisma y errores compartidos"
        petcare.api.pets -> petcare.api.shared "Usa Prisma y storage compartido"
        petcare.api.pets -> petcare.files "Guarda cartillas"
        petcare.api.notifications -> petcare.api.shared "Usa Prisma y repositorio"

        petcare.api.payments -> petcare.api.shared "Usa Prisma y RabbitMQBus"
        petcare.api.payments -> rabbitMq "Publica payment.confirmed" "AMQP"

        rabbitMq -> petcare.api.paymentCommandSubscriber "Entrega PaymentRequested" "AMQP"
        petcare.api.paymentCommandSubscriber -> petcare.api.payments "Ejecuta confirmBookingPayment"
        petcare.api.paymentCommandSubscriber -> rabbitMq "Publica PaymentConfirmed o PaymentFailed" "AMQP"

        rabbitMq -> petcare.api.notificationCommandSubscriber "Entrega NotificationRequested" "AMQP"
        petcare.api.notificationCommandSubscriber -> petcare.api.notifications "Ejecuta notifications.create"
        petcare.api.notificationCommandSubscriber -> rabbitMq "Publica NotificationSent o NotificationFailed" "AMQP"

        rabbitMq -> petcare.api.paymentSubscriber "Entrega PaymentConfirmed" "AMQP"

        reservationsService.api.reservations -> rabbitMq "Publica ReservationCreated" "AMQP"
        reservationsService.api.reservations -> googleMaps "Genera URLs de ubicacion" "HTTPS"
        reservationsService.api.reservations -> reservationsService.database "Persiste reservas" "TCP/IP"
        rabbitMq -> reservationsService.api.reservationCompensationSubscriber "Entrega ReservationCompensate" "AMQP"
        reservationsService.api.reservationCompensationSubscriber -> reservationsService.api.reservations "Ejecuta reservations.compensate"
        reservationsService.api.reservationCompensationSubscriber -> rabbitMq "Publica ReservationCompensated" "AMQP"

        petcare.api.shared -> petcare.database "Ejecuta queries SQL" "TCP/IP"
    }

    views {
        component petcare.api "ComponentesBackendModular" "Vista C3: modulos de dominio, shared y eventos RabbitMQ." {
            include *
            include sagaOrchestrator
            include rabbitMq
            include frontend
            include apiGateway
            include reservationsService
            include reservationsService.api
            autolayout lr
            description "C3: Reservations se ejecuta como microservicio independiente con base de datos propia; el SAGA Orchestrator coordina sus eventos y comandos mediante RabbitMQ junto al backend principal."
        }

        dynamic petcare.api "Mensajeria-SAGA-Exitosa" {
            title "Mensajeria SAGA - Payment y Notification"
            sagaOrchestrator -> rabbitMq "1. PaymentRequested"
            rabbitMq -> petcare.api.paymentCommandSubscriber "2. Entrega PaymentRequested"
            petcare.api.paymentCommandSubscriber -> petcare.api.payments "3. Ejecuta el pago"
            petcare.api.paymentCommandSubscriber -> rabbitMq "4. PaymentConfirmed"
            rabbitMq -> sagaOrchestrator "5. Orchestrator recibe PaymentConfirmed"
            sagaOrchestrator -> rabbitMq "6. NotificationRequested"
            rabbitMq -> petcare.api.notificationCommandSubscriber "7. Entrega NotificationRequested"
            petcare.api.notificationCommandSubscriber -> petcare.api.notifications "8. Crea la notificacion"
            petcare.api.notificationCommandSubscriber -> rabbitMq "9. NotificationSent"
            rabbitMq -> sagaOrchestrator "10. SAGA COMPLETED"
            autoLayout lr
        }

        dynamic petcare.api "Mensajeria-SAGA-Compensacion" {
            title "Mensajeria SAGA - PaymentFailed y compensacion"
            sagaOrchestrator -> rabbitMq "1. PaymentRequested"
            rabbitMq -> petcare.api.paymentCommandSubscriber "2. Entrega PaymentRequested"
            petcare.api.paymentCommandSubscriber -> rabbitMq "3. PaymentFailed"
            rabbitMq -> sagaOrchestrator "4. Orchestrator activa compensacion"
            sagaOrchestrator -> rabbitMq "5. ReservationCompensate"
            rabbitMq -> reservationsService.api.reservationCompensationSubscriber "6. Entrega ReservationCompensate"
            reservationsService.api.reservationCompensationSubscriber -> reservationsService.api.reservations "7. Elimina la reserva"
            reservationsService.api.reservationCompensationSubscriber -> rabbitMq "8. ReservationCompensated"
            rabbitMq -> sagaOrchestrator "9. SAGA COMPENSATED"
            autoLayout lr
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
            element "EntryPoint" {
                background "#0b5ed7"
                color "#ffffff"
            }
            element "Shared" {
                background "#6c757d"
                color "#ffffff"
            }
            element "DomainModule" {
                background "#2a9d8f"
                color "#ffffff"
            }
            element "Subscriber" {
                background "#f4a261"
                color "#102a43"
            }
            element "API Gateway" {
                background "#5c677d"
                color "#ffffff"
            }
            element "Reservations Service" {
                background "#2a9d8f"
                color "#ffffff"
            }
            element "Reservations Database" {
                shape cylinder
                background "#52b788"
                color "#ffffff"
            }
            element "Orchestrator" {
                background "#7b61ff"
                color "#ffffff"
            }
            element "Message Broker" {
                background "#f4b942"
                color "#ffffff"
                shape pipe
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