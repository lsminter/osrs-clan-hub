import { createClient } from 'https://esm.sh'

Deno.serve(async (req) => {
  try {
    const payload = await req.json()
    const { data, type } = payload

    // Only run when a new user is created in Clerk
    if (type === 'user.created') {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )

      // Get the username and ID from the Clerk payload
      // Clerk sometimes puts the username in 'username' or the first 'email_address'
      const clerkId = data.id
      const username = data.username || data.email_addresses[0].email_address

      const { error } = await supabase
        .from('Users') // Fixed: using capital 'Users' to match your table
        .insert({
          id: clerkId,
          username: username
        })

      if (error) throw error
    }

    return new Response(JSON.stringify({ message: "Success" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    })
  }
})
