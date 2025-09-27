import { supabase } from '../lib/supabase.js'

// Wealth Score related database operations

// Create a new wealth profile
export async function createWealthProfile(userId, profileData) {
  const { data, error } = await supabase
    .from('wealth_profiles')
    .insert([{ user_id: userId, ...profileData }])
    .select()
  return { data, error }
}

// Get wealth profile for a user
export async function getWealthProfile(userId) {
  const { data, error } = await supabase
    .from('wealth_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  return { data, error }
}

// Update wealth profile
export async function updateWealthProfile(userId, updates) {
  const { data, error } = await supabase
    .from('wealth_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
  return { data, error }
}

// Create a new financial goal
export async function createFinancialGoal(userId, goalData) {
  const { data, error } = await supabase
    .from('financial_goals')
    .insert([{ user_id: userId, ...goalData }])
    .select()
  return { data, error }
}

// Get all financial goals for a user
export async function getFinancialGoals(userId) {
  const { data, error } = await supabase
    .from('financial_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

// Update financial goal
export async function updateFinancialGoal(goalId, updates) {
  const { data, error } = await supabase
    .from('financial_goals')
    .update(updates)
    .eq('id', goalId)
    .select()
  return { data, error }
}

// Delete financial goal
export async function deleteFinancialGoal(goalId) {
  const { error } = await supabase
    .from('financial_goals')
    .delete()
    .eq('id', goalId)
  return { error }
}

// Create a new transaction
export async function createTransaction(userId, transactionData) {
  const { data, error } = await supabase
    .from('transactions')
    .insert([{ user_id: userId, ...transactionData }])
    .select()
  return { data, error }
}

// Get transactions for a user
export async function getTransactions(userId, limit = 50) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return { data, error }
}

// Calculate wealth score
export async function calculateWealthScore(userId) {
  // This would contain your wealth scoring logic
  // For now, it's a placeholder
  const { data: profile, error: profileError } = await getWealthProfile(userId)
  
  if (profileError) return { score: 0, error: profileError }
  
  // Add your wealth scoring algorithm here
  // This is just a placeholder calculation
  const score = Math.floor(Math.random() * 100) + 1
  
  return { score, error: null }
}
