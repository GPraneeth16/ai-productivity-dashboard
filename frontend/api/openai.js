// Serverless handler example for Vercel/Netlify.
export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { prompt } = req.body || {}
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' })

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [ { role: 'user', content: prompt } ],
        max_tokens: 500,
        temperature: 0.6
      })
    })

    const data = await r.json()
    const text = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? ''
    return res.status(200).json({ text })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: String(err) })
  }
}
