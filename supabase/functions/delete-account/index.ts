import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders })

  const authorization = request.headers.get('Authorization')
  const token = authorization?.replace(/^Bearer\s+/i, '')
  if (!token) return Response.json({ error: 'Authentication required' }, { status: 401, headers: corsHeaders })

  const url = Deno.env.get('SUPABASE_URL') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const authClient = createClient(url, anonKey, { auth: { persistSession: false } })
  const { data: { user }, error: authError } = await authClient.auth.getUser(token)
  if (authError || !user) return Response.json({ error: 'Invalid or expired session' }, { status: 401, headers: corsHeaders })

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { error: progressError } = await admin.from('user_progress').delete().eq('user_id', user.id)
  if (progressError) return Response.json({ error: 'Could not delete learning progress' }, { status: 500, headers: corsHeaders })

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id, false)
  if (deleteError) return Response.json({ error: 'Could not delete account' }, { status: 500, headers: corsHeaders })

  return Response.json({ deleted: true }, { headers: corsHeaders })
})
