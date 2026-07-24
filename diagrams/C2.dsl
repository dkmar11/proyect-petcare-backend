workspace "PetCare Home Services" "Arquitectura de Contenedores (C2) - Enfoque Web Responsivo" {

    model {
        // --- Actores ---
        petOwner = person "Dueño de Mascota" "Cliente que reserva servicios y sube carnets." "Customer"
        serviceProvider = person "Proveedor de Servicios" "Gestiona disponibilidad y actualiza el estado del servicio." "Provider"
        marketingAdmin = person "Administrador de Marketing" "Gestiona promociones locales y nacionales." "Admin"

        // --- Sistemas Externos ---
        mappingService = softwareSystem "Servicio de Mapas" "Cálculo de rutas para visitas a domicilio." "External System"
        paymentGateway = softwareSystem "Pasarela de Pagos" "Procesa transacciones en línea." "External System"
        notificationService = softwareSystem "Servicio de Notificaciones" "Envía recordatorios y alertas (Email/SMS)." "External System"

        // --- Sistema Central ---
        petCareSystem = softwareSystem "Sistema PetCare Home Services" "Target System" {
            
            // 1. Única Aplicación Front-end (Responsiva)
            responsiveWebApp = container "Aplicación Web Responsiva" "Proporciona toda la interfaz de usuario (móvil y escritorio). Adapta la experiencia según el rol (Dueño, Proveedor, Admin)." "React" "Web Browser"
            
            // 2. Lógica de Negocio
            backendApi = container "Core API" "Maneja la lógica de negocio, reglas de reservas, validaciones y orquestación con terceros." "Node.js" "Backend"
            
            // 3. Infraestructura de Supabase
            supabaseDb = container "Supabase DB & Auth" "Gestiona identidades (Roles), seguridad (RLS) y almacena datos relacionales." "PostgreSQL" "Database"
            supabaseStorage = container "Supabase Storage" "Almacena carnets de vacunación y fotos en buckets seguros." "Object Storage" "Storage"

            // --- Relaciones de Usuarios hacia el Front-end ---
            petOwner -> responsiveWebApp "Accede desde navegador móvil/desktop para reservar y pagar"
            serviceProvider -> responsiveWebApp "Accede desde navegador móvil/desktop para ver agenda"
            marketingAdmin -> responsiveWebApp "Accede desde escritorio para gestionar promociones"

            // --- Relaciones Front-end a Back-end y Supabase ---
            responsiveWebApp -> backendApi "Realiza peticiones de negocio mediante" "JSON/HTTPS"
            
            // El cliente web sigue subiendo el archivo directamente usando el SDK de Supabase para mayor eficiencia
            responsiveWebApp -> supabaseStorage "Sube imágenes directamente usando" "Supabase SDK / HTTPS"
            
            // --- Relaciones de Back-end ---
            backendApi -> supabaseDb "Lee y escribe datos relacionales usando" "TCP/IP"
            backendApi -> supabaseStorage "Genera URLs firmadas para lectura de imágenes usando" "REST API"

            // --- Relaciones a Sistemas Externos ---
            backendApi -> mappingService "Consulta distancias para servicios a domicilio en" "JSON/HTTPS"
            backendApi -> paymentGateway "Procesa pagos seguros en" "JSON/HTTPS"
            backendApi -> notificationService "Dispara eventos de notificación en" "JSON/HTTPS"
        }
    }

    views {
        // Vista de Contenedores (C2)
        container petCareSystem "Contenedores-PetCare-Web" {
            include *
            autoLayout tb
            description "Diagrama de Contenedores (C2) utilizando una única Aplicación Web Responsiva para todos los actores."
        }

        // Estilos visuales
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
            element "Web Browser" {
                shape WebBrowser
                background #1168bd
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