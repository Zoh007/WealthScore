# WealthScore Backend

This backend folder contains Supabase integration for the WealthScore application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase project credentials

3. Set up your Supabase database tables:
   - `wealth_profiles` - User wealth information
   - `financial_goals` - User financial goals
   - `transactions` - User transaction history

## Database Schema

### wealth_profiles
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- total_assets (decimal)
- total_liabilities (decimal)
- net_worth (decimal)
- monthly_income (decimal)
- monthly_expenses (decimal)
- created_at (timestamp)
- updated_at (timestamp)

### financial_goals
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- title (text)
- description (text)
- target_amount (decimal)
- current_amount (decimal)
- target_date (date)
- category (text)
- status (text)
- created_at (timestamp)
- updated_at (timestamp)

### transactions
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- amount (decimal)
- description (text)
- category (text)
- type (text) - 'income' or 'expense'
- date (date)
- created_at (timestamp)

## Usage

Import the functions you need in your Next.js app:

```javascript
import { signUp, signIn } from './backend/utils/auth.js'
import { createWealthProfile, getWealthProfile } from './backend/utils/database.js'
```
