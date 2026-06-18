import crypto from 'crypto';

function normalizarChave(raw) {
  const base64 = raw
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\\n/g, '').replace(/\r/g, '').replace(/\n/g, '').replace(/\s/g, '');
  const linhas = base64.match(/.{1,64}/g) || [];
  return `-----BEGIN PRIVATE KEY-----\n${linhas.join('\n')}\n-----END PRIVATE KEY-----\n`;
}

function criarJWT(clientEmail, privateKey) {
  const now    = Math.floor(Date.now() / 1000);
  const header  = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss:   clientEmail,
    scope: 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/firebase.messaging',
    aud:   'https://oauth2.googleapis.com/token',
    iat:   now,
    exp:   now + 3600,
  })).toString('base64url');

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  sign.end();
  const sig = sign.sign(privateKey, 'base64url');
  return `${header}.${payload}.${sig}`;
}

async function getAccessToken(clientEmail, privateKey) {
  const jwt = criarJWT(clientEmail, privateKey);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion:  jwt,
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Token OAuth falhou: ' + JSON.stringify(data));
  return data.access_token;
}

async function lerAgendas(projectId, token) {
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/agendas`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.documents || [];
}

function parseDoc(doc) {
  const f      = doc.fields || {};
  const docId  = doc.name.split('/').pop();
  const token  = f.token?.stringValue;
  const tz     = f.tz?.stringValue || 'America/Belem';
  const doses  = (f.doses?.arrayValue?.values || []).map(v => ({
    nome:    v.mapValue?.fields?.nome?.stringValue,
    dose:    v.mapValue?.fields?.dose?.stringValue,
    horario: v.mapValue?.fields?.horario?.stringValue,
  }));
  return { docId, token, tz, doses };
}

async function enviarFCM(projectId, accessToken, deviceToken, title, body, tag) {
  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method:  'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          token: deviceToken,
          notification: { title, body },
          webpush: {
            notification: {
              icon:    'https://vitadose.vercel.app/icons/icon-192.svg',
              badge:   'https://vitadose.vercel.app/icons/icon-192.svg',
              tag,
              vibrate: [200, 100, 200],
            },
            fcm_options: { link: 'https://vitadose.vercel.app' },
          },
        },
      }),
    }
  );
  return res.ok;
}

async function deletarDoc(projectId, accessToken, docId) {
  await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/agendas/${docId}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } }
  );
}

export default async function handler(req, res) {
  if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const projectId   = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey  = normalizarChave(process.env.FIREBASE_PRIVATE_KEY || '');

  if (!projectId || !clientEmail || !privateKey) {
    return res.status(500).json({ error: 'Credenciais Firebase ausentes' });
  }

  try {
    const accessToken = await getAccessToken(clientEmail, privateKey);
    const docs        = await lerAgendas(projectId, accessToken);

    if (!docs.length) return res.json({ ok: true, enviados: 0 });

    const agora   = new Date();
    const envios  = [];

    for (const doc of docs) {
      const { docId, token, tz, doses } = parseDoc(doc);
      if (!token || !doses.length) continue;

      const horaDevice = agora.toLocaleTimeString('pt-BR', {
        timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false,
      });

      for (const dose of doses.filter(d => d.horario === horaDevice)) {
        const ok = await enviarFCM(
          projectId, accessToken, token,
          '💊 Hora do remédio — VitaDose',
          `${dose.nome} ${dose.dose}`,
          `vd-${docId}-${dose.horario}`
        ).catch(async () => { await deletarDoc(projectId, accessToken, docId); return false; });

        if (ok) envios.push(dose);
      }
    }

    res.json({ ok: true, enviados: envios.length, hora: agora.toISOString() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
