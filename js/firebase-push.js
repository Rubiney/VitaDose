/* VitaDose — Firebase Cloud Messaging (push com app fechado) */

const _FB_CONFIG = {
  apiKey:            "AIzaSyDB80c9ambFWPz8qwO5fP8AZ4oNKS3imjg",
  authDomain:        "vitadose-d5522.firebaseapp.com",
  projectId:         "vitadose-d5522",
  storageBucket:     "vitadose-d5522.firebasestorage.app",
  messagingSenderId: "695847450957",
  appId:             "1:695847450957:web:5ad11988f77c92dcec5f04"
};

const _VAPID_KEY = "BNKfpA-hNeSGCVZg8W91nM8GUnws52RArE5H7ACmb5SP4iEMdXdp7exy-CoFffTgN1VdRv0DOhzvyVu5tbvMvEQ";

function _deviceId() {
  let id = localStorage.getItem('vd_device_id');
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID()
       : Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('vd_device_id', id);
  }
  return id;
}

async function iniciarFirebasePush(meds) {
  try {
    if (typeof firebase === 'undefined') return;
    if (Notification.permission !== 'granted') return;

    if (!firebase.apps.length) firebase.initializeApp(_FB_CONFIG);

    const messaging = firebase.messaging();
    const db        = firebase.firestore();

    const token = await messaging.getToken({ vapidKey: _VAPID_KEY });
    if (!token) return;

    localStorage.setItem('vd_fcm_token', token);

    const doses = (meds || [])
      .filter(m => m.ativo !== false)
      .flatMap(m => (m.horarios || []).map(h => ({
        nome:    m.nome,
        dose:    `${m.dose}${m.unidade || ''}`,
        horario: h,
      })));

    await db.collection('agendas').doc(_deviceId()).set({
      token,
      doses,
      tz:        Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Belem',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

  } catch (e) {
    console.warn('[VitaDose FCM]', e.message);
  }
}
