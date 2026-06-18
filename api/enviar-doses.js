const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

const db        = admin.firestore();
const messaging = admin.messaging();

module.exports = async (req, res) => {
  if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const agora = new Date();
  const snap  = await db.collection('agendas').get();

  if (snap.empty) {
    return res.json({ ok: true, enviados: 0 });
  }

  const envios = [];

  snap.forEach(doc => {
    const { token, doses, tz } = doc.data();
    if (!token || !doses?.length) return;

    const horaDevice = agora.toLocaleTimeString('pt-BR', {
      timeZone: tz || 'America/Belem',
      hour:     '2-digit',
      minute:   '2-digit',
      hour12:   false,
    });

    const dosesAgora = doses.filter(d => d.horario === horaDevice);

    for (const dose of dosesAgora) {
      envios.push(
        messaging.send({
          token,
          notification: {
            title: '💊 Hora do remédio — VitaDose',
            body:  `${dose.nome} ${dose.dose}`,
          },
          webpush: {
            notification: {
              icon:    'https://vitadose.vercel.app/icons/icon-192.svg',
              badge:   'https://vitadose.vercel.app/icons/icon-192.svg',
              tag:     `vd-${doc.id}-${dose.horario}`,
              vibrate: [200, 100, 200],
            },
            fcm_options: { link: 'https://vitadose.vercel.app' },
          },
        }).catch(() => db.collection('agendas').doc(doc.id).delete())
      );
    }
  });

  await Promise.allSettled(envios);
  res.json({ ok: true, enviados: envios.length, hora: agora.toISOString() });
};
