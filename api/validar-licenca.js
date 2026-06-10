import crypto from 'crypto';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { codigo } = req.body || {};
  if (!codigo || typeof codigo !== 'string') {
    return res.json({ valido: false });
  }

  const secret = process.env.LICENSE_SECRET;
  if (!secret) {
    return res.status(500).json({ valido: false, erro: 'Configuração ausente no servidor.' });
  }

  // Remove traços e normaliza
  const raw = codigo.replace(/-/g, '').toUpperCase();
  if (raw.length !== 16) return res.json({ valido: false });

  const seed        = raw.slice(0, 8);
  const sigRecebida = raw.slice(8, 16);

  const sigEsperada = crypto
    .createHmac('sha256', secret)
    .update(seed)
    .digest('hex')
    .slice(0, 8)
    .toUpperCase();

  return res.json({ valido: sigRecebida === sigEsperada });
}
