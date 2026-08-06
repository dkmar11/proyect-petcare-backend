# PetCare API

API REST para perfiles de mascotas, proveedores, pagos y notificaciones. Está construida con Express y Prisma/PostgreSQL.

Las reservas viven en el microservicio `petcareReservations`, que usa un proyecto Supabase independiente y expone sus endpoints en `http://localhost:3200/api`.

## Arquitectura

- `presentation/routes`: define los endpoints por recurso.
- `presentation/controllers`: traduce la petición HTTP a una llamada de aplicación.
- `application/services`: contiene casos de uso y coordinación de reglas.
- `domain/rules`: reglas puras de reserva y requisitos de negocio.
- `infrastructure`: Prisma, almacenamiento de vacunas y repositorio de notificaciones.

## Inicio

1. Copia `.env.example` a `.env` y configura `DATABASE_URL`.
2. Ejecuta `npm install`.
3. Crea las tablas con `npm run prisma:migrate -- --name petcare`.
4. Carga datos de prueba con `npm run prisma:seed`.
5. Inicia la API con `npm run dev`.

El frontend se conecta por defecto a `http://localhost:3000/api`. Para cambiarlo, crea `frontend/.env` con `VITE_API_URL=http://tu-api/api`.

RabbitMQ es obligatorio para arrancar el servidor: define `CLOUDAMQP_URL` en `.env` y asigna un `RABBITMQ_NAMESPACE` único por despliegue (`staging-472916` para staging y `os-445014` para producción). El bus crea las colas como `petcare.<namespace>.<queue>`, evitando colisiones entre réplicas y entornos.

## Endpoints principales

- `POST /api/users` crea o actualiza un usuario por correo.
- `GET|POST /api/users/:userId/pets` lista o crea perfiles de mascotas.
- `POST /api/pets/:petId/vaccination-record` sube un PDF o imagen (`record`, máximo 5 MB).
- `GET /api/providers` lista proveedores y sus capacidades de domicilio/recojo.
- El microservicio `petcareReservations` publica `ReservationCreated` y consume la confirmación de pago para actualizar la reserva.
- El backend conserva el endpoint de confirmación de pago como adaptador de integración; no escribe `Booking` directamente.
- `GET /api/users/:userId/notifications` obtiene las confirmaciones, rechazos y avances.
- `GET /api/maps/link?address=` está expuesto por `petcareReservations` en el puerto 3200.

Los valores esperados para `paymentMethod` son `ONLINE` y `AT_LOCATION`; para visitas se usan `HOME_VISIT`, `PICKUP_DROPOFF` y `AT_BRANCH`.
