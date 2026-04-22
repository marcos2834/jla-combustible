export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { image, mediaType } = req.body

  if (!image) {
    return res.status(400).json({ error: 'No image provided' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  const prompt = `Analizá esta imagen de un ticket de combustible de Argentina. Extraé los siguientes datos en formato JSON. Si no podés leer algún campo con certeza, devolvé null para ese campo. No inventes datos.

{
  "estacion": "nombre de la estación o marca (ej: YPF, Shell, Axion)",
  "fecha": "fecha en formato YYYY-MM-DD",
  "litros": número con decimales,
  "precio_por_litro": número con decimales,
  "importe_total": número con decimales,
  "tipo_combustible": "nafta premium / nafta super / gasoil / gasoil premium / otro"
}

Devolvé únicamente el JSON, sin texto adicional.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType || 'image/jpeg',
                  data: image
                }
              },
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ]
      })
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.error?.message || 'Error en la API de Claude')
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No se pudo parsear la respuesta de la IA')
    }

    const parsed = JSON.parse(jsonMatch[0])
    return res.status(200).json(parsed)
  } catch (err) {
    console.error('Extract error:', err)
    return res.status(500).json({ error: err.message || 'Error al procesar la imagen' })
  }
}
