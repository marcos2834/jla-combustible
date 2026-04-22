import { createSign } from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    vehiculo, conductor, estacion, fecha, litros,
    precio_por_litro, importe_total, tipo_combustible,
    metodo_pago, observaciones, modo
  } = req.body

  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY
  const sheetId = process.env.GOOGLE_SHEET_ID

  if (!serviceAccountEmail || !privateKeyRaw || !sheetId) {
    return res.status(500).json({ error: 'Google Sheets not configured' })
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, '\n')

  try {
    const accessToken = await getGoogleAccessToken(serviceAccountEmail, privateKey)

    const now = new Date()
    const timestamp = now.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })

    const rowValues = [
      timestamp,
      vehiculo || '',
      conductor || '',
      estacion || '',
      fecha || '',
      litros || '',
      precio_por_litro || '',
      importe_total || '',
      tipo_combustible || '',
      metodo_pago || '',
      observaciones || '',
      modo || 'Auto'
    ]

    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Cargas!A:L:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`

    const sheetsResp = await fetch(sheetsUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values: [rowValues] })
    })

    if (!sheetsResp.ok) {
      const errData = await sheetsResp.json().catch(() => ({}))
      throw new Error(errData.error?.message || 'Error al guardar en Google Sheets')
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Save error:', err)
    return res.status(500).json({ error: err.message || 'Error al guardar' })
  }
}

async function getGoogleAccessToken(serviceAccountEmail, privateKey) {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: serviceAccountEmail,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  }

  const encodedHeader = base64url(JSON.stringify(header))
  const encodedPayload = base64url(JSON.stringify(payload))
  const signingInput = encodedHeader + '.' + encodedPayload

  const signature = signRS256(signingInput, privateKey)
  const jwt = signingInput + '.' + signature

  const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  })

  if (!tokenResp.ok) {
    const err = await tokenResp.json().catch(() => ({}))
    throw new Error('OAuth error: ' + (err.error_description || err.error || 'unknown'))
  }

  const tokenData = await tokenResp.json()
  return tokenData.access_token
}

function base64url(str) {
  const b64 = Buffer.from(str).toString('base64')
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function signRS256(data, privateKeyPem) {
  const sign = createSign('RSA-SHA256')
  sign.update(data)
  sign.end()
  const signature = sign.sign(privateKeyPem)
  return signature.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}
