# RentNest Backend

A RESTful backend API for a rental property marketplace where landlords can manage rental properties, tenants can request and rent properties, and admins can manage the entire platform.

## Features

### Public

* Browse available properties
* Search & filter properties
* View property details
* View categories

### Tenant

* Authentication (Register/Login)
* Submit rental requests
* View rental request history
* Make payments with Stripe
* View payment history
* Leave reviews after rental completion

### Landlord

* Manage properties (CRUD)
* Approve or reject rental requests
* Complete rentals
* View payment history

### Admin

* Manage users
* Manage categories
* View all properties
* View all rental requests
* View all payments

---

## Tech Stack

* Node.js
* Express.js
* TypeScript
* PostgreSQL
* Prisma ORM
* JWT Authentication
* Stripe Payment Gateway
* bcrypt

---

## Installation

Clone the repository

```bash
git clone https://github.com/saifullahkabir/rentnest-backend.git
```

Move into the project

```bash
cd RentNest-Backend
```

Install dependencies

```bash
npm install
```

Generate Prisma Client

```bash
npx prisma generate
```

Run database migrations

```bash
npx prisma migrate dev
```

Start the development server

```bash
npm run dev
```
