


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."projek_enum" AS ENUM (
    'perbincangan',
    'mesyuarat',
    'ulang kaji'
);


ALTER TYPE "public"."projek_enum" OWNER TO "postgres";


CREATE TYPE "public"."student_class_enum" AS ENUM (
    'dit5a',
    'dit5b'
);


ALTER TYPE "public"."student_class_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."booker_delete"("p_booker_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$declare
  v_profile_id uuid;
begin
  -- Get profile
  select profile_id
  into v_profile_id
  from public.bookers
  where id = p_booker_id;

  if v_profile_id is null then
    raise exception 'Booker not found';
  end if;

  -- Delete reservations first
  delete from public.reservations
  where booker_id = p_booker_id;

  -- Delete booker
  delete from public.bookers
  where id = p_booker_id;

  -- Delete profile
  delete from public.profiles
  where id = v_profile_id;
end;$$;


ALTER FUNCTION "public"."booker_delete"("p_booker_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_daily_limit"("p_booker_id" "uuid", "p_date" "date") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  booking_count integer;
  max_allowed integer;
BEGIN
  SELECT max_slots_per_user_per_day
  INTO max_allowed
  FROM public.booking_settings
  LIMIT 1;

  SELECT count(*)
  INTO booking_count
  FROM public.reservations
  WHERE booker_id = p_booker_id
    AND booking_date = p_date
    AND status = 'confirmed';

  RETURN booking_count < max_allowed;
END;
$$;


ALTER FUNCTION "public"."check_daily_limit"("p_booker_id" "uuid", "p_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_signup_available"("p_email" "text", "p_phone_number" "text") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin

    if exists (
        select 1
        from profiles
        where phone_number = p_phone_number
    ) then
        return json_build_object(
            'available', false,
            'message', 'Nombor telefon telah digunakan.'
        );
    end if;


    if exists (
        select 1
        from profiles
        where email = p_email
    ) then
        return json_build_object(
            'available', false,
            'message', 'Email telah digunakan.'
        );
    end if;


    return json_build_object(
        'available', true
    );

end;
$$;


ALTER FUNCTION "public"."check_signup_available"("p_email" "text", "p_phone_number" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_booker_if_missing"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  insert into public.bookers (
    profile_id,
    name
  )
  values (
    new.id,
    new.name
  )
  on conflict (profile_id) do nothing;

  return new;
end;
$$;


ALTER FUNCTION "public"."create_booker_if_missing"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_reservation"("p_slot_ids" "uuid"[], "p_room_id" "text", "p_booking_date" "date", "p_full_name" "text", "p_user_role" "text", "p_capacity" integer, "p_project_type" "text", "p_project_progress" "text", "p_booker_id" "uuid" DEFAULT NULL::"uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
  v_blocked_count int;
  v_taken_count int;
  v_user_count int;
  v_room_capacity int;
  v_is_blocked boolean;
BEGIN

  -- 🔐 Authorization
  IF p_booker_id IS NULL THEN
    RAISE EXCEPTION 'Booker ID is required';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM public.bookers
    WHERE id = p_booker_id
      AND (
        profile_id = auth.uid()
        OR public.is_admin()
      )
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- 0. isBlocked (MUST BE FIRST)
  SELECT is_blocked
  INTO v_is_blocked
  FROM bookers
  WHERE id = p_booker_id;

  IF v_is_blocked THEN
    RAISE EXCEPTION 'You are blocked from making reservations';
  END IF;

  -- 🔒 LOCK
  PERFORM 1
  FROM reservations
  WHERE booker_id = p_booker_id
    AND booking_date = p_booking_date
  FOR UPDATE;

  -- 1. blocked slots
  SELECT count(*)
  INTO v_blocked_count
  FROM room_time_slots
  WHERE id = ANY(p_slot_ids)
    AND is_blocked = true;

  IF v_blocked_count > 0 THEN
    RAISE EXCEPTION 'One or more slots are blocked';
  END IF;

  -- 2. already booked
  SELECT count(*)
  INTO v_taken_count
  FROM reservations
  WHERE slot_id = ANY(p_slot_ids)
    AND booking_date = p_booking_date
    AND status = 'confirmed';

  IF v_taken_count > 0 THEN
    RAISE EXCEPTION 'One or more slots already booked';
  END IF;

  -- 3. daily limit
  SELECT count(*)
  INTO v_user_count
  FROM reservations
  WHERE booker_id = p_booker_id
    AND booking_date = p_booking_date
    AND status = 'confirmed';

  IF v_user_count + coalesce(array_length(p_slot_ids, 1), 0) > 2 THEN
    RAISE EXCEPTION 'Daily booking limit exceeded (max 2 slots)';
  END IF;

  -- 4. capacity limit
  SELECT capacity
  INTO v_room_capacity
  FROM rooms
  WHERE id = p_room_id;

  IF v_room_capacity IS NULL THEN
    RAISE EXCEPTION 'Room not found';
  END IF;

  IF p_capacity > v_room_capacity THEN
    RAISE EXCEPTION
      'Maximum room capacity is % participants', v_room_capacity;
  END IF;

  -- 5. insert
  INSERT INTO reservations (
    room_id,
    slot_id,
    booking_date,
    full_name,
    user_role,
    capacity,
    project_type,
    project_progress,
    booker_id
  )
  SELECT
    p_room_id,
    unnest(p_slot_ids),
    p_booking_date,
    p_full_name,
    p_user_role,
    p_capacity,
    p_project_type,
    p_project_progress,
    p_booker_id;

END;$$;


ALTER FUNCTION "public"."create_reservation"("p_slot_ids" "uuid"[], "p_room_id" "text", "p_booking_date" "date", "p_full_name" "text", "p_user_role" "text", "p_capacity" integer, "p_project_type" "text", "p_project_progress" "text", "p_booker_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."room_time_slots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "room_id" "text" NOT NULL,
    "slot_index" integer NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "is_blocked" boolean DEFAULT false,
    "blocked_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "day_of_week" smallint DEFAULT 1 NOT NULL,
    CONSTRAINT "day_of_week_valid" CHECK ((("day_of_week" >= 1) AND ("day_of_week" <= 5))),
    CONSTRAINT "slot_index_positive" CHECK (("slot_index" >= 1))
);


ALTER TABLE "public"."room_time_slots" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_room_time_slot"("p_room_id" "text", "p_day_of_week" smallint, "p_start_time" time without time zone, "p_end_time" time without time zone) RETURNS "public"."room_time_slots"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_slot_index integer;
  v_slot public.room_time_slots;
begin
  if p_start_time >= p_end_time then
    raise exception 'Start time must be before end time';
  end if;

  select coalesce(max(slot_index), 0) + 1
  into v_slot_index
  from public.room_time_slots
  where room_id = p_room_id
    and day_of_week = p_day_of_week;

  insert into public.room_time_slots (
    room_id,
    day_of_week,
    slot_index,
    start_time,
    end_time
  )
  values (
    p_room_id,
    p_day_of_week,
    v_slot_index,
    p_start_time,
    p_end_time
  )
  returning *
  into v_slot;

  return v_slot;
end;
$$;


ALTER FUNCTION "public"."create_room_time_slot"("p_room_id" "text", "p_day_of_week" smallint, "p_start_time" time without time zone, "p_end_time" time without time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_room_time_slot"("p_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  delete from public.room_time_slots
  where id = p_id;

  if not found then
    raise exception 'Time slot not found';
  end if;
end;
$$;


ALTER FUNCTION "public"."delete_room_time_slot"("p_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_booked_slots"("p_room_id" "text", "p_date" "date") RETURNS TABLE("slot_id" "uuid")
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  select slot_id
  from reservations
  where room_id = p_room_id
    and booking_date = p_date
    and status = 'confirmed';
$$;


ALTER FUNCTION "public"."get_booked_slots"("p_room_id" "text", "p_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_bookers_admin"() RETURNS TABLE("id" "uuid", "name" "text", "is_blocked" boolean, "phone_number" "text", "total_bookings" bigint)
    LANGUAGE "sql"
    SET "search_path" TO 'public'
    AS $$select
  b.id,
  b.name,
  b.is_blocked,
  p.phone_number,
  count(r.id)::int as "totalBookings"
from bookers b
left join profiles p
  on p.id = b.profile_id
left join reservations r
  on r.booker_id = b.id
where get_my_role() = 'admin'
group by
  b.id,
  b.name,
  b.is_blocked,
  p.phone_number
order by count(r.id) desc;$$;


ALTER FUNCTION "public"."get_bookers_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_monthly_report"("p_month" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
begin
return (
  select jsonb_build_object(

    'month', p_month,

    /* ---------------- TIME SLOT ---------------- */
    'timeSlotData', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'name', t.slot_type,
        'value', t.total,
        'color', case when t.slot_type = 'Pagi' then '#6366F1' else '#F59E0B' end
      )), '[]'::jsonb)
      from (
        select
          case when ts.slot_index <= 3 then 'Pagi' else 'Petang' end as slot_type,
          count(*) as total
        from reservations r
        join room_time_slots ts on ts.id = r.slot_id
        where to_char(r.booking_date, 'YYYY-MM') = p_month
          and r.status = 'confirmed'
        group by case when ts.slot_index <= 3 then 'Pagi' else 'Petang' end
      ) t
    ),

    /* ---------------- PARTICIPANT BREAKDOWN ---------------- */
    'participantBreakdown', (
      select jsonb_build_object(
        'category', 'Peserta',
        'pelajar', count(*) filter (where r.user_role = 'student'),
        'pensyarah', count(*) filter (where r.user_role = 'teacher')
      )
      from reservations r
      where to_char(r.booking_date, 'YYYY-MM') = p_month
        and r.status = 'confirmed'
    ),

    /* ---------------- CATEGORY DISTRIBUTION ---------------- */
    'categoryDistribution', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'name', t.project_type,
        'value', t.total
      )), '[]'::jsonb)
      from (
        select
          project_type,
          count(*) as total
        from reservations
        where to_char(booking_date, 'YYYY-MM') = p_month
          and status = 'confirmed'
        group by project_type
      ) t
    ),

    /* ---------------- ROOM USAGE ---------------- */
    'roomUsage', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'room', t.room_name,
        'bookings', t.total
      )), '[]'::jsonb)
      from (
        select
          r2.name as room_name,
          count(*) as total
        from reservations r
        join rooms r2 on r2.id = r.room_id
        where to_char(r.booking_date, 'YYYY-MM') = p_month
          and r.status = 'confirmed'
        group by r2.name
      ) t
    )

  )
);
end;
$$;


ALTER FUNCTION "public"."get_monthly_report"("p_month" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_role"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select role
  from profiles
  where id = auth.uid()
  limit 1
$$;


ALTER FUNCTION "public"."get_my_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_reservation_reports"() RETURNS TABLE("id" "uuid", "booking_date" "date", "status" "text", "room_id" "text", "capacity" integer, "room_name" "text", "booker_name" "text", "booker_phone" "text", "time_slot" "text")
    LANGUAGE "sql"
    SET "search_path" TO 'public'
    AS $$select
    r.id,
    r.booking_date,
    r.status,
    r.room_id,
    r.capacity,
    rm.name as room_name,
    b.name as booker_name,
    p.phone_number as booker_phone,
    concat(
        to_char(ts.start_time, 'FMHH12:MI AM'),

    ' - ',

    to_char(ts.end_time, 'FMHH12:MI AM')
    ) as time_slot
from reservations r
join rooms rm on rm.id = r.room_id
join bookers b on b.id = r.booker_id
join profiles p on p.id = b.profile_id
join room_time_slots ts on ts.id = r.slot_id;$$;


ALTER FUNCTION "public"."get_reservation_reports"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_room_time_slots_for_date"("p_room_id" "text", "p_date" "date") RETURNS TABLE("id" "uuid", "room_id" "text", "slot_index" integer, "start_time" time without time zone, "end_time" time without time zone, "day_of_week" smallint, "is_blocked" boolean, "blocked_reason" "text")
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  select
    ts.id,
    ts.room_id,
    ts.slot_index,
    ts.start_time,
    ts.end_time,
    ts.day_of_week,
    ts.is_blocked,
    ts.blocked_reason
  from public.room_time_slots ts
  where ts.room_id = p_room_id
    and ts.day_of_week = extract(isodow from p_date)::smallint
  order by ts.slot_index;
$$;


ALTER FUNCTION "public"."get_room_time_slots_for_date"("p_room_id" "text", "p_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."profile_create"("user_id" "uuid", "user_email" "text", "user_role" "text", "user_name" "text", "user_phone_number" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$BEGIN

  -- 🔐 Authorization
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 🔒 Prevent arbitrary role assignment
  IF user_role NOT IN ('student', 'teacher') THEN
    user_role := 'student';
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    role,
    name,
    phone_number
  )
  VALUES (
    auth.uid(),
    user_email,
    user_role,
    user_name,
    user_phone_number
  );

END;$$;


ALTER FUNCTION "public"."profile_create"("user_id" "uuid", "user_email" "text", "user_role" "text", "user_name" "text", "user_phone_number" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_booking_settings_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_booking_settings_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_room_time_slot"("p_id" "uuid", "p_start_time" time without time zone, "p_end_time" time without time zone) RETURNS "public"."room_time_slots"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  v_slot public.room_time_slots;
begin
  if p_start_time >= p_end_time then
    raise exception 'Start time must be before end time';
  end if;

  select *
  into v_slot
  from public.room_time_slots
  where id = p_id;

  if not found then
    raise exception 'Time slot not found';
  end if;

  if exists (
    select 1
    from public.room_time_slots
    where room_id = v_slot.room_id
      and day_of_week = v_slot.day_of_week
      and id <> p_id
      and p_start_time < end_time
      and p_end_time > start_time
  ) then
    raise exception 'Time slot overlaps an existing slot';
  end if;

  update public.room_time_slots
  set
    start_time = p_start_time,
    end_time = p_end_time
  where id = p_id
  returning *
  into v_slot;

  return v_slot;
end;
$$;


ALTER FUNCTION "public"."update_room_time_slot"("p_id" "uuid", "p_start_time" time without time zone, "p_end_time" time without time zone) OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bookers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "is_blocked" boolean DEFAULT false,
    "block_reason" "text",
    "name" "text",
    "profile_id" "uuid"
);


ALTER TABLE "public"."bookers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."booking_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_enabled" boolean DEFAULT true NOT NULL,
    "min_days_ahead" integer DEFAULT 1 NOT NULL,
    "max_days_ahead" integer DEFAULT 14 NOT NULL,
    "max_slots_per_user_per_day" integer DEFAULT 2 NOT NULL,
    "allowed_days" smallint[] DEFAULT ARRAY[1, 2, 3, 4, 5] NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "booking_settings_allowed_days_check" CHECK (("allowed_days" <@ ARRAY[(1)::smallint, (2)::smallint, (3)::smallint, (4)::smallint, (5)::smallint, (6)::smallint, (7)::smallint])),
    CONSTRAINT "booking_settings_max_days_ahead_check" CHECK (("max_days_ahead" >= 0)),
    CONSTRAINT "booking_settings_max_slots_per_user_per_day_check" CHECK (("max_slots_per_user_per_day" >= 1)),
    CONSTRAINT "booking_settings_min_days_ahead_check" CHECK (("min_days_ahead" >= 0)),
    CONSTRAINT "booking_settings_window_check" CHECK (("max_days_ahead" >= "min_days_ahead"))
);


ALTER TABLE "public"."booking_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "email" "text",
    "role" "text" DEFAULT 'student'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "phone_number" "text",
    CONSTRAINT "profiles_name_check" CHECK (("name" ~ '^[a-z]+$'::"text")),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['student'::"text", 'teacher'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reservations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "room_id" "text" NOT NULL,
    "slot_id" "uuid" NOT NULL,
    "booking_date" "date" NOT NULL,
    "full_name" "text" NOT NULL,
    "user_role" "text" NOT NULL,
    "capacity" integer NOT NULL,
    "project_type" "text",
    "project_progress" "text",
    "status" "text" DEFAULT 'confirmed'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "booker_id" "uuid",
    "cancel_reason" "text",
    CONSTRAINT "reservations_jumlah_peserta_check" CHECK (("capacity" >= 1)),
    CONSTRAINT "reservations_status_check" CHECK (("status" = ANY (ARRAY['confirmed'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "reservations_user_role_check" CHECK (("user_role" = ANY (ARRAY['student'::"text", 'teacher'::"text"])))
);

ALTER TABLE ONLY "public"."reservations" REPLICA IDENTITY FULL;


ALTER TABLE "public"."reservations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rooms" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "teacher_only" boolean DEFAULT false,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "capacity" integer DEFAULT 1 NOT NULL,
    "label" "text"
);


ALTER TABLE "public"."rooms" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."reservation_reports" WITH ("security_invoker"='on') AS
 SELECT "r"."id",
    "r"."booking_date",
    "r"."status",
    "b"."name" AS "booker_name",
    "p"."phone_number" AS "booker_phone",
    "rm"."name" AS "room_name"
   FROM ((("public"."reservations" "r"
     LEFT JOIN "public"."bookers" "b" ON (("b"."id" = "r"."booker_id")))
     LEFT JOIN "public"."profiles" "p" ON (("p"."id" = "b"."profile_id")))
     LEFT JOIN "public"."rooms" "rm" ON (("rm"."id" = "r"."room_id")));


ALTER VIEW "public"."reservation_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."room_overrides" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "room_id" "text" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "is_blocked" boolean DEFAULT true NOT NULL,
    "blocked_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "room_overrides_date_check" CHECK (("start_date" <= "end_date"))
);


ALTER TABLE "public"."room_overrides" OWNER TO "postgres";


ALTER TABLE ONLY "public"."bookers"
    ADD CONSTRAINT "bookers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bookers"
    ADD CONSTRAINT "bookers_profile_id_key" UNIQUE ("profile_id");



ALTER TABLE ONLY "public"."booking_settings"
    ADD CONSTRAINT "booking_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_phone_number_key" UNIQUE ("phone_number");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reservations"
    ADD CONSTRAINT "reservations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."room_overrides"
    ADD CONSTRAINT "room_overrides_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."room_time_slots"
    ADD CONSTRAINT "room_time_slots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."room_time_slots"
    ADD CONSTRAINT "room_time_slots_unique_slot" UNIQUE ("room_id", "day_of_week", "slot_index");



ALTER TABLE ONLY "public"."rooms"
    ADD CONSTRAINT "rooms_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "reservations_active_unique" ON "public"."reservations" USING "btree" ("room_id", "slot_id", "booking_date") WHERE ("status" = 'confirmed'::"text");



CREATE UNIQUE INDEX "unique_active_slot_booking" ON "public"."reservations" USING "btree" ("room_id", "slot_id", "booking_date") WHERE ("status" = 'confirmed'::"text");



CREATE OR REPLACE TRIGGER "booking_settings_updated_at" BEFORE UPDATE ON "public"."booking_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_booking_settings_updated_at"();



CREATE OR REPLACE TRIGGER "create_booker_if_missing_trigger" AFTER INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."create_booker_if_missing"();



ALTER TABLE ONLY "public"."bookers"
    ADD CONSTRAINT "bookers_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reservations"
    ADD CONSTRAINT "reservations_booker_id_fkey" FOREIGN KEY ("booker_id") REFERENCES "public"."bookers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reservations"
    ADD CONSTRAINT "reservations_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reservations"
    ADD CONSTRAINT "reservations_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "public"."room_time_slots"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."room_overrides"
    ADD CONSTRAINT "room_overrides_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."room_time_slots"
    ADD CONSTRAINT "room_time_slots_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can delete room overrides" ON "public"."room_overrides" FOR DELETE TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Admins can insert room overrides" ON "public"."room_overrides" FOR INSERT TO "authenticated" WITH CHECK (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Admins can view room overrides" ON "public"."room_overrides" FOR SELECT TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Authenticated users can view booking settings" ON "public"."booking_settings" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Student/Teacher can view room overrides" ON "public"."room_overrides" FOR SELECT TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['student'::"text", 'teacher'::"text"])));



CREATE POLICY "admin bookers" ON "public"."bookers" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."bookers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "bookers_insert_own" ON "public"."bookers" FOR INSERT TO "authenticated" WITH CHECK (("profile_id" = "auth"."uid"()));



CREATE POLICY "bookers_select" ON "public"."bookers" FOR SELECT TO "authenticated" USING ((("profile_id" = "auth"."uid"()) OR ("public"."get_my_role"() = 'admin'::"text")));



CREATE POLICY "bookers_update_own" ON "public"."bookers" FOR UPDATE TO "authenticated" USING (("profile_id" = "auth"."uid"())) WITH CHECK (("profile_id" = "auth"."uid"()));



ALTER TABLE "public"."booking_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "booking_settings_admin" ON "public"."booking_settings" TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text")) WITH CHECK (("public"."get_my_role"() = 'admin'::"text"));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_select" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((("id" = "auth"."uid"()) OR ("public"."get_my_role"() = 'admin'::"text")));



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



ALTER TABLE "public"."reservations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "reservations_delete" ON "public"."reservations" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."bookers" "b"
  WHERE (("b"."id" = "reservations"."booker_id") AND ("b"."profile_id" = "auth"."uid"())))));



CREATE POLICY "reservations_select" ON "public"."reservations" FOR SELECT TO "authenticated" USING ((("public"."get_my_role"() = 'admin'::"text") OR (EXISTS ( SELECT 1
   FROM "public"."bookers" "b"
  WHERE (("b"."id" = "reservations"."booker_id") AND ("b"."profile_id" = "auth"."uid"()))))));



CREATE POLICY "reservations_update_own" ON "public"."reservations" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."bookers" "b"
  WHERE (("b"."id" = "reservations"."booker_id") AND ("b"."profile_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."bookers" "b"
  WHERE (("b"."id" = "reservations"."booker_id") AND ("b"."profile_id" = "auth"."uid"())))));



ALTER TABLE "public"."room_overrides" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."room_time_slots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rooms" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "rooms_admin_write" ON "public"."rooms" TO "authenticated" USING (("public"."get_my_role"() = 'admin'::"text")) WITH CHECK (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "rooms_read_all" ON "public"."rooms" FOR SELECT TO "authenticated" USING (("public"."get_my_role"() = ANY (ARRAY['student'::"text", 'teacher'::"text"])));



CREATE POLICY "slots_admin_all" ON "public"."room_time_slots" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "slots_read_all" ON "public"."room_time_slots" FOR SELECT TO "authenticated" USING (("public"."is_admin"() OR ("public"."get_my_role"() = ANY (ARRAY['student'::"text", 'teacher'::"text"]))));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."reservations";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."room_time_slots" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."room_time_slots" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."room_time_slots" TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_bookers_admin"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_bookers_admin"() TO "authenticated";



GRANT ALL ON FUNCTION "public"."get_room_time_slots_for_date"("p_room_id" "text", "p_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_room_time_slots_for_date"("p_room_id" "text", "p_date" "date") TO "authenticated";


















GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."bookers" TO "anon";
GRANT ALL ON TABLE "public"."bookers" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."bookers" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."booking_settings" TO "anon";
GRANT ALL ON TABLE "public"."booking_settings" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."booking_settings" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."profiles" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."profiles" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."reservations" TO "anon";
GRANT SELECT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."reservations" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."reservations" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."rooms" TO "anon";
GRANT ALL ON TABLE "public"."rooms" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."rooms" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."reservation_reports" TO "anon";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."reservation_reports" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."reservation_reports" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."room_overrides" TO "anon";
GRANT ALL ON TABLE "public"."room_overrides" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."room_overrides" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "service_role";



































drop extension if exists "pg_net";

revoke delete on table "public"."bookers" from "anon";

revoke delete on table "public"."bookers" from "service_role";

revoke insert on table "public"."bookers" from "service_role";

revoke select on table "public"."bookers" from "service_role";

revoke update on table "public"."bookers" from "service_role";

revoke delete on table "public"."booking_settings" from "anon";

revoke insert on table "public"."booking_settings" from "anon";

revoke select on table "public"."booking_settings" from "anon";

revoke update on table "public"."booking_settings" from "anon";

revoke delete on table "public"."booking_settings" from "service_role";

revoke insert on table "public"."booking_settings" from "service_role";

revoke select on table "public"."booking_settings" from "service_role";

revoke update on table "public"."booking_settings" from "service_role";

revoke delete on table "public"."profiles" from "anon";

revoke insert on table "public"."profiles" from "anon";

revoke select on table "public"."profiles" from "anon";

revoke update on table "public"."profiles" from "anon";

revoke delete on table "public"."profiles" from "authenticated";

revoke insert on table "public"."profiles" from "authenticated";

revoke update on table "public"."profiles" from "authenticated";

revoke delete on table "public"."profiles" from "service_role";

revoke insert on table "public"."profiles" from "service_role";

revoke select on table "public"."profiles" from "service_role";

revoke update on table "public"."profiles" from "service_role";

revoke insert on table "public"."reservations" from "authenticated";

revoke delete on table "public"."reservations" from "service_role";

revoke insert on table "public"."reservations" from "service_role";

revoke select on table "public"."reservations" from "service_role";

revoke update on table "public"."reservations" from "service_role";

revoke delete on table "public"."room_overrides" from "anon";

revoke insert on table "public"."room_overrides" from "anon";

revoke select on table "public"."room_overrides" from "anon";

revoke update on table "public"."room_overrides" from "anon";

revoke delete on table "public"."room_overrides" from "service_role";

revoke insert on table "public"."room_overrides" from "service_role";

revoke select on table "public"."room_overrides" from "service_role";

revoke update on table "public"."room_overrides" from "service_role";

revoke delete on table "public"."room_time_slots" from "anon";

revoke insert on table "public"."room_time_slots" from "anon";

revoke delete on table "public"."room_time_slots" from "authenticated";

revoke insert on table "public"."room_time_slots" from "authenticated";

revoke delete on table "public"."room_time_slots" from "service_role";

revoke insert on table "public"."room_time_slots" from "service_role";

revoke select on table "public"."room_time_slots" from "service_role";

revoke update on table "public"."room_time_slots" from "service_role";

revoke delete on table "public"."rooms" from "anon";

revoke insert on table "public"."rooms" from "anon";

revoke delete on table "public"."rooms" from "service_role";

revoke insert on table "public"."rooms" from "service_role";

revoke select on table "public"."rooms" from "service_role";

revoke update on table "public"."rooms" from "service_role";


