workspace "PetCare Home Services" "Arquitectura para el sistema de reserva y gestión de servicios para mascotas." {

    model {
        // Actores (Personas)
        petOwner = person "Dueño de Mascota" "Cliente que gestiona perfiles de mascotas, reserva servicios, sube carnets de vacunación y realiza pagos." "Customer"
        serviceProvider = person "Proveedor de Servicios" "Empleado, contratista o franquiciado que gestiona su disponibilidad, acepta/rechaza reservas y actualiza el estado del servicio." "Provider"
        marketingAdmin = person "Administrador de Marketing" "Gestiona promociones tanto a nivel nacional como promociones locales por sucursal." "Admin"

        // Sistema Central
        petCareSystem = softwareSystem "Sistema PetCare Home Services" "Permite la reserva y gestión integral de servicios para mascotas (estética, veterinaria, paseos, hospedaje) y pagos." "Target System"

        // Sistemas Externos
        mappingService = softwareSystem "Servicio de Mapas" "Proporciona cálculo de rutas y direcciones para visitas a domicilio y servicios de recogida/entrega." "External System"
        paymentGateway = softwareSystem "Pasarela de Pagos" "Procesa pagos en línea de forma segura mediante tarjetas o métodos digitales." "External System"
        notificationService = softwareSystem "Servicio de Notificaciones" "Envía confirmaciones, recordatorios y alertas de estado vía SMS, Email o Push." "External System"

        // Relaciones: Usuarios -> Sistema Central
        petOwner -> petCareSystem "Reserva servicios, sube documentos, gestiona perfil y paga usando" "Mobile / Web"
        serviceProvider -> petCareSystem "Revisa requerimientos, acepta reservas y actualiza estado en" "Mobile / Web"
        marketingAdmin -> petCareSystem "Configura promociones nacionales y locales usando" "Web Portal"

        // Relaciones: Sistema Central -> Sistemas Externos
        petCareSystem -> mappingService "Consulta rutas y coordenadas usando" "HTTPS/REST API"
        petCareSystem -> paymentGateway "Procesa transacciones y cobros mediante" "HTTPS/API"
        petCareSystem -> notificationService "Solicita el envío de alertas y avisos usando" "HTTPS/REST API"
    }

    views {
        // Vista de Contexto de Sistema (C1)
        systemContext petCareSystem "Contexto-PetCare" {
            include *
            autoLayout tb
            description "Diagrama de Contexto para el Sistema PetCare Home Services."
        }

        // Estilos visuales básicos
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
            relationship "Relationship" {
                dashed false
                routing Direct
            }
        }
    }
}