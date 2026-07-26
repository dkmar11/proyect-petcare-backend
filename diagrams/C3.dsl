workspace "PetCare Backend - Modular" "Diagrama C3 de la arquitectura de monolito modular" {

    model {
        cliente = person "Cliente" "Duenio de mascota que registra perfiles y agenda servicios."
        proveedor = person "Proveedor" "Atiende servicios y actualiza estados de reservas."

        frontend = softwareSystem "PetCare Frontend" "SPA que consume la API REST."
        googleMaps = softwareSystem "Google Maps" "Servicio externo para generar enlaces de ubicacion."
        paymentGateway = softwareSystem "Pasarela de Pagos" "Proveedor externo para pagos online."

        petcare = softwareSystem "PetCare Backend" "API REST implementada como monolito modular." {
            api = container "Express API" "Aplicacion Node.js que monta los modulos y middlewares." "Node.js, Express" {
                app = component "App and Server" "Puntos de entrada app.js y server.js." "Node.js" {
                    tags "EntryPoint"
                }
                shared = component "Shared" "Configuracion, errores, middlewares, Prisma y almacenamiento compartido." "Shared infrastructure" {
                    tags "Shared"
                }
                users = component "Users Module" "Clientes, proveedores, perfiles y autenticacion." "Domain module" {
                    tags "DomainModule"
                }
                pets = component "Pets Module" "Perfiles de mascotas y cartillas de vacunacion." "Domain module" {
                    tags "DomainModule"
                }
                reservations = component "Reservations Module" "Agendamiento, promociones, notificaciones y mapas." "Domain module" {
                    tags "DomainModule"
                }
                payments = component "Payments Module" "Confirmacion de pagos e integracion con pasarela externa." "Domain module" {
                    tags "DomainModule"
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
        frontend -> app "Consume API REST" "JSON/HTTPS"

        app -> shared "Inicializa configuracion y middlewares"
        app -> users "Monta rutas de users"
        app -> pets "Monta rutas de pets"
        app -> reservations "Monta rutas de reservations"
        app -> payments "Monta rutas de payments"

        users -> shared "Usa Prisma y errores compartidos"
        pets -> shared "Usa Prisma y errores compartidos"
        pets -> files "Guarda cartillas mediante uploads"
        reservations -> shared "Usa Prisma y errores compartidos"
        reservations -> googleMaps "Genera URLs de ubicacion" "HTTPS"
        payments -> shared "Usa Prisma y errores compartidos"
        payments -> paymentGateway "Confirma pagos online" "HTTPS"
        shared -> database "Ejecuta queries SQL" "TCP/IP"
    }

    views {
        component api "ComponentesBackendModular" "Vista C3: modulos de dominio y shared." {
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
            element "Database" {
                shape cylinder
            }
            element "FileStorage" {
                shape folder
            }
        }
    }
}
