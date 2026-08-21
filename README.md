> [!NOTE]
> **Contributions are welcome!**
>
> Reserv is an open-source project and contributions are encouraged. You can help by reporting bugs, suggesting improvements, improving documentation, or submitting pull requests.
>
> Reserv is currently running in production for an institution I work with.


&nbsp;


<div align="center">

 <picture>
  <source media="(prefers-color-scheme: light)" srcset="./public/images/reserv-black.jpg">
  <img alt="Reserv logo" src="./public/images/reserv-black.jpg" width="100%">
</picture>

</div>

<h3 align="center">
  Resource Reservation System
  <br/>
  Modern, Minimal, and Curated for Institutions
</h3>

<p align="center">
    <a href="https://raufsemi.wordpress.com/docs"> Documentation </a>·
    <a href="https://github.com/raufsemi/reserv/issues/new?assignees=&labels=bug&projects=&template=bug_report.md&title=%F0%9F%90%9B+Bug+Report%3A+"> Report Bug </a>·
    <a href="https://github.com/raufsemi/reserv/issues/new?assignees=&labels=enhancement&projects=&template=feature_request.md&title=%F0%9F%9A%80+Feature%3A+"> Request Feature </a>
</p>

&nbsp;


Reserv is an open-source reservation management system built with Next.js and Supabase.

It is designed for managing facilities, libraries, rooms, and other reservable resources within universities, institutions, or organizations.

If you are interested in getting the full public-facing application (frontend), contact me via Instagram [@raufsemi](https://instagram.com/raufsemi).



## Features

Reserv provides a focused set of features for modern resource reservation and administrative management.

- **Resource Management**: create, organize, configure, and manage reservable rooms and resources
- **Time Slot Management**: define available booking times, schedules, and time-based availability
- **Reservation Management**: create, view, manage, and monitor reservations from a centralized dashboard
- **Booking Rules**: configure booking windows, daily limits, allowed days, and resource capacity
- **User Management**: manage bookers, profiles, roles, and administrative access
- **Conflict Prevention**: prevent overlapping reservations and enforce resource availability constraints
- **Access Control**: secure administrative operations with authentication and role-based permissions
- **Reports**: review reservation activity and generate operational insights for administrators
- **Responsive Interface**: modern, minimal interface designed for desktop and mobile use

and many more..



# Installation

## 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/reserv.git
cd reserv
```

## 2. Install dependencies

```bash
npm install
```

## 3. Create a Supabase project

Create a new project at [supabase.com](https://supabase.com/).

You will need:

- Project URL
- Publishable Key
- Project Reference ID

## 4. Create `.env`

Create the environment file at the project root:

```bash
touch .env
```

Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

## 5. Install Supabase CLI

If you don't already have it:

**macOS**
```bash
brew install supabase/tap/supabase
```

**Windows**
```bash
scoop install supabase
```

Check the installation:

```bash
supabase --version
```

## 6. Login to Supabase

```bash
supabase login
```

## 7. Link your Supabase project

Replace `YOUR_PROJECT_REF` with your Supabase project reference ID:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

## 8. Install the database schema

Push the included database migrations to your Supabase project:

```bash
supabase db push
```

This will create the required database structure, including:

- Tables
- Relationships
- Indexes
- Functions / RPCs
- Triggers
- RLS policies
- Constraints

## 9. Start the application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 10. Create Admin credentials

You can manually create a user in Supabase Auth and populate it into the `profiles` table:

```sql
INSERT INTO public.profiles (
  id,
  email,
  name,
  role
)
VALUES (
  '{auth UID}',
  '{auth email}',
  'admin',
  'admin'
);
```

---



Your **Reserv System** is now ready!