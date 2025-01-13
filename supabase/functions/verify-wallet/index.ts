import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import nacl from 'https://esm.sh/tweetnacl@1.0.3?dts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './_shared/cors.ts'

// A lightweight JWT library (JOSE in Deno):
import * as jose from 'https://deno.land/x/jose@v4.14.1/index.ts'

/**
 * In your Edge Function environment, set these:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - JWT_SECRET (your own secret for signing tokens)
 */
const supabaseAdminClient = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

const JWT_SECRET = Deno.env.get('JWT_SECRET') || ''
const JWT_SECRET_BYTES = new TextEncoder().encode(JWT_SECRET)

serve(async (req: Request) => {
  // Handle preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { publicKey, signature, nonce } = await req.json()
    if (!publicKey || !signature || !nonce) {
      return new Response(
        JSON.stringify({ error: 'Missing publicKey, signature, or nonce' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1) Verify the signature
    const pubKeyBytes = new Uint8Array(publicKey)
    const sigBytes = new Uint8Array(signature)
    const msgBytes = new TextEncoder().encode(nonce)

    const verified = nacl.sign.detached.verify(msgBytes, sigBytes, pubKeyBytes)
    if (!verified) {
      return new Response(
        JSON.stringify({ error: 'Signature verification failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2) Create or fetch a user in Supabase
    const walletAddress = bytesToBase58(pubKeyBytes)
    let user = await findUserByWallet(walletAddress)
    if (!user) {
      // Create a user with a dummy email = <walletAddress>@example.com
      const { data, error } = await supabaseAdminClient.auth.admin.createUser({
        email: `${walletAddress}@example.com`,
        email_confirm: true,
        password: crypto.randomUUID(),
        user_metadata: { wallet: walletAddress },
      })
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      user = data.user
    }

    if (!user) {
      return new Response(JSON.stringify({ error: 'Failed to fetch or create user' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 3) Generate a custom JWT embedding user.id
    const jwt = await new jose.SignJWT({ userId: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h') // Expires in 1 day
      .setSubject(user.id)
      .sign(JWT_SECRET_BYTES)

    // 4) Return the token to the frontend
    return new Response(JSON.stringify({ token: jwt, userId: user.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('Edge Function Error:', err)
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

/** 
 * Example helper to find a user by wallet address. 
 * This uses a naive approach: list all users and search. 
 * For a production app with many users, store (wallet->user) in a separate table.
 */
async function findUserByWallet(wallet: string) {
  const { data, error } = await supabaseAdminClient.auth.admin.listUsers()
  if (error) {
    console.error('listUsers error:', error)
    return null
  }
  return data.users.find(u => u.email?.startsWith(wallet)) || null
}

/** 
 * Convert a publicKey byte array into base58 (common for Solana addresses) 
 */
function bytesToBase58(bytes: Uint8Array) {
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  let carry: number
  const digits = [0]
  for (let i = 0; i < bytes.length; i++) {
    carry = bytes[i]
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8
      digits[j] = carry % 58
      carry = (carry / 58) | 0
    }
    while (carry) {
      digits.push(carry % 58)
      carry = (carry / 58) | 0
    }
  }
  let str = ''
  for (let k = 0; k < bytes.length && bytes[k] === 0; k++) {
    str += '1'
  }
  for (let q = digits.length - 1; q >= 0; q--) {
    str += ALPHABET[digits[q]]
  }
  return str
}
