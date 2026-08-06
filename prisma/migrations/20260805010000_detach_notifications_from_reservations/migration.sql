-- Reservations now has its own Supabase database. Notification keeps the
-- external bookingId as a scalar reference instead of a cross-database FK.
ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "Notification_bookingId_fkey";
