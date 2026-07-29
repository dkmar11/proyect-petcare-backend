workspace "PetCare Backend - Modular" "C3 - Componentes modulares con Notifications y RabbitMQ" {

    !identifiers hierarchical

    model {
        cliente = person "Cliente" "Dueno de mascota que registra perfiles y agenda servicios."
        proveedor = person "Proveedor" "Atiende servicios y actualiza estados de reservas."

        frontend = softwareSystem "PetCare Frontend" "SPA que consume la API REST."
        googleMaps = softwareSystem "Google Maps" "Servicio externo para generar enlaces de ubicacion."
        paymentGateway = softwareSystem "Pasarela de Pagos" "Proveedor externo para pagos online."
        rabbitMq = softwareSystem "RabbitMQ" "Broker de mensajeria para eventos asincronos." "External System"

        petcare = softwareSystem "PetCare Backend" "API REST implementada como monolito modular." {
            api = container "Express API" "Aplicacion Node.js que monta modulos y middlewares compartidos." "Node.js, Express" {
                app = component "App and Server" "Puntos de entrada app.js y server.js; inicia subscriber de pagos." "Node.js" {
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
                reservations = component "Reservations Module" "Agendamiento, estado y promociones." "Domain module" {
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
            }

            database = container "PetCare Database" "Persistencia relacional de los contextos de negocio." "PostgreSQL" {
                tags "Database"
            }
            files = container "Vaccination Files" "Almacenamiento local de evidencias de vacunacion." "Filesystem" {
                tags "FileStorage"
            }
        }

        cliente -> frontend "Usa"
        proveedor -> frontend "Usa"
        frontend -> petcare.api.app "Consume API REST" "JSON/HTTPS"
        paymentGateway -> petcare.api.payments "Invoca confirmacion de pago" "HTTPS/Webhook"

        petcare.api.app -> petcare.api.shared "Inicializa configuracion y middlewares"
        petcare.api.app -> petcare.api.users "Monta rutas de users"
        petcare.api.app -> petcare.api.pets "Monta rutas de pets"
        petcare.api.app -> petcare.api.reservations "Monta rutas de reservations"
        petcare.api.app -> petcare.api.notifications "Monta rutas de notifications"
        petcare.api.app -> petcare.api.payments "Monta rutas de payments"
        petcare.api.app -> petcare.api.paymentSubscriber "Arranca consumidor RabbitMQ"

        petcare.api.users -> petcare.api.shared "Usa Prisma y errores compartidos"
        petcare.api.pets -> petcare.api.shared "Usa Prisma y storage compartido"
        petcare.api.pets -> petcare.files "Guarda cartillas"
        petcare.api.reservations -> petcare.api.shared "Usa Prisma y errores compartidos"
        petcare.api.reservations -> petcare.api.notifications "Crea notificaciones de negocio"
        petcare.api.reservations -> googleMaps "Genera URLs de ubicacion" "HTTPS"

        petcare.api.notifications -> petcare.api.shared "Usa Prisma y repositorio"

        petcare.api.payments -> petcare.api.shared "Usa Prisma y RabbitMQBus"
        petcare.api.payments -> rabbitMq "Publica payment.confirmed" "AMQP"

        rabbitMq -> petcare.api.paymentSubscriber "Entrega PaymentConfirmed" "AMQP"
        petcare.api.paymentSubscriber -> petcare.api.reservations "Ejecuta handlePaymentConfirmed"

        petcare.api.shared -> petcare.database "Ejecuta queries SQL" "TCP/IP"
    }

    views {
        component petcare.api "ComponentesBackendModular" "Vista C3: modulos de dominio, shared y eventos RabbitMQ." {
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
            element "Database" {
                shape cylinder
            }
            element "FileStorage" {
                shape folder
            }
        }
    }
}
