# PetCare API

API REST para perfiles de mascotas, reservas, proveedores, promociones y notificaciones. Está construida con Express y Prisma/PostgreSQL.

## Arquitectura

- `presentation/routes`: define los endpoints por recurso.
- `presentation/controllers`: traduce la petición HTTP a una llamada de aplicación.
- `application/services`: contiene casos de uso y coordinación de reglas.
- `domain/rules`: reglas puras de reserva y requisitos de negocio.
- `infrastructure`: Prisma, almacenamiento de vacunas, mapas y repositorio de notificaciones.

## Inicio

1. Copia `.env.example` a `.env` y configura `DATABASE_URL`.
2. Ejecuta `npm install`.
3. Crea las tablas con `npm run prisma:migrate -- --name petcare`.
4. Carga datos de prueba con `npm run prisma:seed`.
5. Inicia la API con `npm run dev`.

El frontend se conecta por defecto a `http://localhost:3000/api`. Para cambiarlo, crea `frontend/.env` con `VITE_API_URL=http://tu-api/api`.

## Endpoints principales

- `POST /api/users` crea o actualiza un usuario por correo.
- `GET|POST /api/users/:userId/pets` lista o crea perfiles de mascotas.
- `POST /api/pets/:petId/vaccination-record` sube un PDF o imagen (`record`, máximo 5 MB).
- `GET /api/providers` lista proveedores y sus capacidades de domicilio/recojo.
- `POST /api/bookings` crea una reserva y valida modalidad, pago y requisitos de vacunas.
- `GET /api/users/:userId/bookings` consulta reservas con mascota, proveedor y promoción.
- `PATCH /api/bookings/:bookingId/status` permite al proveedor marcar `CONFIRMED`, `IN_PROGRESS`, `COMPLETED` o `REJECTED` (requiere `rejectionReason`).
- `POST /api/bookings/:bookingId/payment/confirm` confirma un pago online; sirve como punto de integración/webhook para la pasarela elegida.
- `GET /api/promotions?branchId=&providerId=` entrega promociones nacionales, de sucursal y de proveedor.
- `GET /api/users/:userId/notifications` obtiene las confirmaciones, rechazos y avances.
- `POST /api/maintenance/appointment-reminders` genera recordatorios para citas confirmadas de las siguientes 24 horas; debe invocarse con un cron.
- `GET /api/maps/link?address=` genera un enlace de Google Maps para una visita a domicilio.

Los valores esperados para `paymentMethod` son `ONLINE` y `AT_LOCATION`; para visitas se usan `HOME_VISIT`, `PICKUP_DROPOFF` y `AT_BRANCH`.
