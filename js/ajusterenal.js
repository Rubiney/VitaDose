/* VitaDose — Ajuste Renal (Fase 3)
   Referências: UpToDate, KDIGO 2022, SBN, Micromedex
   Fórmula: Cockcroft-Gault (CrCl mL/min)
*/

/* ── Cálculo TFG (Cockcroft-Gault) ── */
function calcularTFG(idade, peso, sexo, creatinina) {
  if (!idade || !peso || !creatinina || creatinina <= 0) return null;
  const fator = (sexo === 'F') ? 0.85 : 1.0;
  return Math.round(((140 - idade) * peso * fator) / (72 * creatinina));
}

/* ── Estágio CKD (KDIGO) ── */
function estagioRenal(tfg) {
  if (tfg === null) return null;
  if (tfg >= 90) return { estadio: 'G1', descricao: 'Normal', cor: '#16a34a' };
  if (tfg >= 60) return { estadio: 'G2', descricao: 'Levemente reduzida', cor: '#65a30d' };
  if (tfg >= 45) return { estadio: 'G3a', descricao: 'Leve a moderada', cor: '#ca8a04' };
  if (tfg >= 30) return { estadio: 'G3b', descricao: 'Moderada a grave', cor: '#d97706' };
  if (tfg >= 15) return { estadio: 'G4', descricao: 'Grave', cor: '#ea580c' };
  return          { estadio: 'G5', descricao: 'Muito grave / DRT', cor: '#dc2626' };
}

/* ── Tabela de ajuste renal ──
   alertas: array ordenado do mais restritivo para o menos restritivo
   tfgMax: limite superior (TFG <= tfgMax → alerta se aplica)
   nivel: 'contraindicado' | 'reduzir' | 'cautela'
*/
const _AJUSTE_RENAL = {

  /* ── Antidiabéticos ── */
  'metformina': { alertas: [
    { tfgMax: 30,  nivel: 'contraindicado', texto: 'TFG < 30: CONTRAINDICADA — risco de acidose lática' },
    { tfgMax: 45,  nivel: 'reduzir',         texto: 'TFG 30–45: Reduzir dose para 500 mg 2×/dia; monitorar função renal a cada 3 meses' },
    { tfgMax: 60,  nivel: 'cautela',          texto: 'TFG 45–60: Usar com cautela; monitorar função renal' },
  ]},

  /* ── Anti-hipertensivos ── */
  'enalapril': { alertas: [
    { tfgMax: 30,  nivel: 'reduzir', texto: 'TFG < 30: Iniciar com 2,5 mg/dia; titular lentamente; monitorar K⁺ e creatinina' },
    { tfgMax: 60,  nivel: 'cautela', texto: 'TFG 30–60: Monitorar K⁺ e função renal; risco de hipercalemia' },
  ]},
  'captopril': { alertas: [
    { tfgMax: 30,  nivel: 'reduzir', texto: 'TFG < 30: Reduzir para 6,25–12,5 mg/dose; monitorar K⁺' },
    { tfgMax: 60,  nivel: 'cautela', texto: 'TFG 30–60: Cautela — risco de hipercalemia e piora de função renal' },
  ]},
  'lisinopril': { alertas: [
    { tfgMax: 30,  nivel: 'reduzir', texto: 'TFG < 30: Reduzir dose em 50%; iniciar com 2,5 mg/dia' },
    { tfgMax: 60,  nivel: 'cautela', texto: 'TFG 30–60: Monitorar K⁺ e creatinina regularmente' },
  ]},
  'losartana': { alertas: [
    { tfgMax: 30,  nivel: 'cautela', texto: 'TFG < 30: Usar com cautela — risco de hipercalemia e piora de função renal' },
    { tfgMax: 60,  nivel: 'cautela', texto: 'TFG 30–60: Monitorar K⁺ e função renal; ajuste geralmente não necessário' },
  ]},
  'valsartana': { alertas: [
    { tfgMax: 30,  nivel: 'cautela', texto: 'TFG < 30: Cautela — sem dados robustos; monitorar K⁺' },
  ]},
  'espironolactona': { alertas: [
    { tfgMax: 30,  nivel: 'contraindicado', texto: 'TFG < 30: CONTRAINDICADA — risco grave de hipercalemia' },
    { tfgMax: 45,  nivel: 'reduzir',         texto: 'TFG 30–45: Reduzir dose; monitorar K⁺ rigorosamente' },
    { tfgMax: 60,  nivel: 'cautela',          texto: 'TFG 45–60: Cautela — monitorar K⁺ e função renal' },
  ]},
  'atenolol': { alertas: [
    { tfgMax: 15,  nivel: 'reduzir', texto: 'TFG < 15: Reduzir para 25 mg em dias alternados' },
    { tfgMax: 35,  nivel: 'reduzir', texto: 'TFG 15–35: Reduzir para 25–50 mg/dia' },
    { tfgMax: 60,  nivel: 'cautela', texto: 'TFG 35–60: Cautela; monitorar bradicardia e hipotensão' },
  ]},
  'furosemida': { alertas: [
    { tfgMax: 30,  nivel: 'cautela', texto: 'TFG < 30: Doses maiores podem ser necessárias (resistência ao diurético na IRC)' },
  ]},
  'hidroclorotiazida': { alertas: [
    { tfgMax: 30,  nivel: 'contraindicado', texto: 'TFG < 30: Ineficaz e potencialmente prejudicial — substituir por diurético de alça' },
  ]},

  /* ── Antigotosos ── */
  'alopurinol': { alertas: [
    { tfgMax: 10,  nivel: 'contraindicado', texto: 'TFG < 10: Contraindicado — risco de toxicidade grave' },
    { tfgMax: 20,  nivel: 'reduzir',         texto: 'TFG 10–20: Dose máxima 50 mg/dia' },
    { tfgMax: 30,  nivel: 'reduzir',         texto: 'TFG 20–30: Dose máxima 100 mg/dia' },
    { tfgMax: 60,  nivel: 'reduzir',         texto: 'TFG 30–60: Dose máxima 100–200 mg/dia; monitorar toxicidade' },
  ]},
  'colchicina': { alertas: [
    { tfgMax: 10,  nivel: 'contraindicado', texto: 'TFG < 10: Evitar — acúmulo com risco de toxicidade grave (miopatia, mielossupressão)' },
    { tfgMax: 30,  nivel: 'reduzir',         texto: 'TFG 10–30: Reduzir dose em 50%; evitar uso prolongado' },
    { tfgMax: 60,  nivel: 'cautela',          texto: 'TFG 30–60: Cautela no uso prolongado; monitorar toxicidade' },
  ]},

  /* ── Antibióticos / Antivirais ── */
  'amoxicilina': { alertas: [
    { tfgMax: 10,  nivel: 'reduzir', texto: 'TFG < 10: Reduzir dose em 50%; ampliar intervalo para 24 h' },
    { tfgMax: 30,  nivel: 'reduzir', texto: 'TFG 10–30: Reduzir para 250–500 mg a cada 12 h' },
  ]},
  'amoxicilina clavulanato': { alertas: [
    { tfgMax: 10,  nivel: 'reduzir', texto: 'TFG < 10: 250 mg (amox.) a cada 24 h; evitar formulação 875 mg' },
    { tfgMax: 30,  nivel: 'reduzir', texto: 'TFG 10–30: 500 mg a cada 12 h; evitar dose 875 mg' },
  ]},
  'ciprofloxacino': { alertas: [
    { tfgMax: 30,  nivel: 'reduzir', texto: 'TFG < 30: Reduzir dose em 50% ou ampliar intervalo para 18–24 h' },
    { tfgMax: 60,  nivel: 'cautela', texto: 'TFG 30–60: Monitorar; redução leve pode ser necessária' },
  ]},
  'levofloxacino': { alertas: [
    { tfgMax: 20,  nivel: 'reduzir', texto: 'TFG < 20: 250 mg a cada 48 h (dose de ataque 500 mg no 1.º dia)' },
    { tfgMax: 50,  nivel: 'reduzir', texto: 'TFG 20–50: 250 mg/dia ou 500 mg a cada 48 h' },
  ]},
  'nitrofurantoina': { alertas: [
    { tfgMax: 30,  nivel: 'contraindicado', texto: 'TFG < 30: CONTRAINDICADA — ineficaz + acúmulo de metabólitos tóxicos' },
    { tfgMax: 45,  nivel: 'reduzir',         texto: 'TFG 30–45: Evitar uso; se necessário, tratar com alternativa' },
  ]},
  'sulfametoxazol': { alertas: [
    { tfgMax: 15,  nivel: 'contraindicado', texto: 'TFG < 15: CONTRAINDICADO' },
    { tfgMax: 30,  nivel: 'reduzir',         texto: 'TFG 15–30: Reduzir dose em 50%' },
  ]},
  'trimetoprim sulfametoxazol': { alertas: [
    { tfgMax: 15,  nivel: 'contraindicado', texto: 'TFG < 15: CONTRAINDICADO — risco de hipercalemia e piora renal' },
    { tfgMax: 30,  nivel: 'reduzir',         texto: 'TFG 15–30: Reduzir dose; monitorar K⁺' },
  ]},
  'cefalexina': { alertas: [
    { tfgMax: 10,  nivel: 'reduzir', texto: 'TFG < 10: 250–500 mg a cada 24 h' },
    { tfgMax: 30,  nivel: 'reduzir', texto: 'TFG 10–30: 250–500 mg a cada 12 h' },
  ]},
  'aciclovir': { alertas: [
    { tfgMax: 10,  nivel: 'reduzir', texto: 'TFG < 10: Reduzir dose em 50%; ampliar intervalo para 24 h' },
    { tfgMax: 25,  nivel: 'reduzir', texto: 'TFG 10–25: Reduzir dose em 50%; ampliar intervalo para 12 h' },
    { tfgMax: 50,  nivel: 'reduzir', texto: 'TFG 25–50: Ampliar intervalo para 12 h' },
  ]},
  'valaciclovir': { alertas: [
    { tfgMax: 10,  nivel: 'reduzir', texto: 'TFG < 10: 500 mg a cada 24 h; diálise: dose após sessão' },
    { tfgMax: 30,  nivel: 'reduzir', texto: 'TFG 10–30: 1 g a cada 24 h (herpes zoster)' },
    { tfgMax: 50,  nivel: 'reduzir', texto: 'TFG 30–50: 1 g a cada 12 h' },
  ]},
  'azitromicina': { alertas: [
    { tfgMax: 10,  nivel: 'cautela', texto: 'TFG < 10: Usar com cautela; sem ajuste de dose estabelecido' },
  ]},

  /* ── Neurológicos ── */
  'gabapentina': { alertas: [
    { tfgMax: 15,  nivel: 'reduzir', texto: 'TFG < 15: 100–300 mg/dia (dose única diária)' },
    { tfgMax: 30,  nivel: 'reduzir', texto: 'TFG 15–30: 200–700 mg/dia divididos em 1–2 doses' },
    { tfgMax: 60,  nivel: 'reduzir', texto: 'TFG 30–60: 400–1400 mg/dia divididos em 2 doses' },
  ]},
  'pregabalina': { alertas: [
    { tfgMax: 15,  nivel: 'reduzir', texto: 'TFG < 15: 25–75 mg/dia' },
    { tfgMax: 30,  nivel: 'reduzir', texto: 'TFG 15–30: 25–150 mg/dia' },
    { tfgMax: 60,  nivel: 'reduzir', texto: 'TFG 30–60: 75–300 mg/dia' },
  ]},
  'topiramato': { alertas: [
    { tfgMax: 30,  nivel: 'reduzir', texto: 'TFG < 30: Reduzir dose em 50%' },
    { tfgMax: 60,  nivel: 'cautela', texto: 'TFG 30–60: Cautela; redução leve pode ser necessária' },
  ]},

  /* ── Cardiovasculares ── */
  'digoxina': { alertas: [
    { tfgMax: 10,  nivel: 'contraindicado', texto: 'TFG < 10: Evitar; se necessário, doses muito reduzidas com monitoramento sérico rigoroso' },
    { tfgMax: 30,  nivel: 'reduzir',         texto: 'TFG 10–30: Reduzir para 0,0625 mg/dia; monitorar nível sérico (alvo 0,5–0,9 ng/mL)' },
    { tfgMax: 60,  nivel: 'reduzir',         texto: 'TFG 30–60: Reduzir dose inicial; intervalo de dose pode ser aumentado' },
  ]},
  'sotalol': { alertas: [
    { tfgMax: 10,  nivel: 'contraindicado', texto: 'TFG < 10: CONTRAINDICADO' },
    { tfgMax: 30,  nivel: 'reduzir',         texto: 'TFG 10–30: Ampliar intervalo para 36–48 h' },
    { tfgMax: 60,  nivel: 'reduzir',         texto: 'TFG 30–60: Ampliar intervalo para 24 h' },
  ]},
  'dabigatrana': { alertas: [
    { tfgMax: 30,  nivel: 'contraindicado', texto: 'TFG < 30: CONTRAINDICADA (FA) — risco hemorrágico elevado' },
    { tfgMax: 50,  nivel: 'reduzir',         texto: 'TFG 30–50: Considerar redução de dose para 110 mg 2×/dia em > 80 anos ou uso de verapamil' },
  ]},
  'rivaroxabana': { alertas: [
    { tfgMax: 15,  nivel: 'contraindicado', texto: 'TFG < 15: CONTRAINDICADA' },
    { tfgMax: 30,  nivel: 'reduzir',         texto: 'TFG 15–30: 15 mg/dia com alimentos (FA); monitorar' },
  ]},
  'apixabana': { alertas: [
    { tfgMax: 25,  nivel: 'cautela', texto: 'TFG < 25: Cautela; considerar redução de dose (2,5 mg 2×/dia)' },
  ]},

  /* ── AINEs / Analgésicos ── */
  'ibuprofeno': { alertas: [
    { tfgMax: 30,  nivel: 'contraindicado', texto: 'TFG < 30: CONTRAINDICADO — risco de piora aguda de função renal' },
    { tfgMax: 60,  nivel: 'cautela',          texto: 'TFG 30–60: Evitar uso prolongado; preferir Paracetamol; monitorar função renal' },
  ]},
  'naproxeno': { alertas: [
    { tfgMax: 30,  nivel: 'contraindicado', texto: 'TFG < 30: CONTRAINDICADO' },
    { tfgMax: 60,  nivel: 'cautela',          texto: 'TFG 30–60: Evitar uso crônico; risco nefrotóxico' },
  ]},
  'diclofenaco': { alertas: [
    { tfgMax: 30,  nivel: 'contraindicado', texto: 'TFG < 30: CONTRAINDICADO' },
    { tfgMax: 60,  nivel: 'cautela',          texto: 'TFG 30–60: Evitar uso prolongado; monitorar função renal' },
  ]},
  'cetoprofeno': { alertas: [
    { tfgMax: 30,  nivel: 'contraindicado', texto: 'TFG < 30: CONTRAINDICADO' },
    { tfgMax: 60,  nivel: 'cautela',          texto: 'TFG 30–60: Evitar; se necessário, doses menores e curto prazo' },
  ]},
  'celecoxibe': { alertas: [
    { tfgMax: 30,  nivel: 'contraindicado', texto: 'TFG < 30: CONTRAINDICADO' },
    { tfgMax: 60,  nivel: 'cautela',          texto: 'TFG 30–60: Evitar uso crônico; preferir Paracetamol' },
  ]},
  'morfina': { alertas: [
    { tfgMax: 30,  nivel: 'reduzir', texto: 'TFG < 30: Reduzir dose em 75%; ampliar intervalos; risco de acúmulo de metabólito ativo (M6G)' },
    { tfgMax: 60,  nivel: 'reduzir', texto: 'TFG 30–60: Reduzir dose em 50%; monitorar sedação e depressão respiratória' },
  ]},
  'tramadol': { alertas: [
    { tfgMax: 10,  nivel: 'contraindicado', texto: 'TFG < 10: Evitar; risco de convulsão por acúmulo' },
    { tfgMax: 30,  nivel: 'reduzir',         texto: 'TFG 10–30: Ampliar intervalo para 12 h; dose máxima 200 mg/dia' },
    { tfgMax: 60,  nivel: 'cautela',          texto: 'TFG 30–60: Cautela com uso prolongado' },
  ]},

  /* ── Hipoglicemiantes / Outros ── */
  'glibenclamida': { alertas: [
    { tfgMax: 30,  nivel: 'contraindicado', texto: 'TFG < 30: CONTRAINDICADA — risco de hipoglicemia grave e prolongada (Critérios de Beers)' },
    { tfgMax: 60,  nivel: 'cautela',          texto: 'TFG 30–60: Cautela; risco aumentado de hipoglicemia' },
  ]},
  'glipizida': { alertas: [
    { tfgMax: 30,  nivel: 'cautela', texto: 'TFG < 30: Preferir ao invés da Glibenclamida; iniciar com dose baixa' },
  ]},
  'sitagliptina': { alertas: [
    { tfgMax: 15,  nivel: 'contraindicado', texto: 'TFG < 15: Contraindicada' },
    { tfgMax: 30,  nivel: 'reduzir',         texto: 'TFG 15–30: 25 mg/dia' },
    { tfgMax: 45,  nivel: 'reduzir',         texto: 'TFG 30–45: 50 mg/dia' },
  ]},
  'ranitidina': { alertas: [
    { tfgMax: 25,  nivel: 'reduzir', texto: 'TFG < 25: Reduzir para 75 mg/dose (ou ampliar intervalo para 24 h)' },
  ]},
  'famotidina': { alertas: [
    { tfgMax: 30,  nivel: 'reduzir', texto: 'TFG < 30: Ampliar intervalo para 36–48 h ou reduzir dose' },
  ]},
  'cimetidina': { alertas: [
    { tfgMax: 30,  nivel: 'reduzir', texto: 'TFG < 30: Reduzir para 200 mg a cada 12 h' },
    { tfgMax: 60,  nivel: 'cautela', texto: 'TFG 30–60: Reduzir dose em 25–50%' },
  ]},

  /* ── Oncológicos ── */
  'metotrexato': { alertas: [
    { tfgMax: 30,  nivel: 'contraindicado', texto: 'TFG < 30: CONTRAINDICADO — acúmulo com risco de toxicidade grave' },
    { tfgMax: 60,  nivel: 'reduzir',         texto: 'TFG 30–60: Reduzir dose em 50%; monitorar toxicidade hematológica e mucosa' },
  ]},

  /* ── Outros ── */
  'amlodipina': { alertas: [] }, // sem ajuste necessário
  'sinvastatina': { alertas: [
    { tfgMax: 30,  nivel: 'cautela', texto: 'TFG < 30: Iniciar com dose baixa (5–10 mg/dia); risco de miopatia aumentado' },
  ]},
  'atorvastatina': { alertas: [
    { tfgMax: 30,  nivel: 'cautela', texto: 'TFG < 30: Monitorar sinais de miopatia; sem ajuste de dose estabelecido' },
  ]},
  'rosuvastatina': { alertas: [
    { tfgMax: 30,  nivel: 'reduzir', texto: 'TFG < 30: Dose máxima 10 mg/dia; risco elevado de miopatia' },
  ]},
  'varfarina': { alertas: [
    { tfgMax: 30,  nivel: 'cautela', texto: 'TFG < 30: Monitorar INR com maior frequência — IRC altera metabolismo e aumenta risco hemorrágico' },
  ]},
  'carbonato de calcio': { alertas: [] }, // uso intencional na IRC
};

/* ── Normalização (igual ao marcas.js) ── */
function _normAR(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\b(comprimido|capsula|solucao|suspensao|injetavel|xarope|cloridrato|maleato|besilato|mesilato|sodico|potassico|calcico|hemihidratado)\b/g, '')
    .replace(/\b\d[\d,.]*\s*(mg|ml|mcg|g|ui|%|meg|ug)\b/g, '')
    .replace(/\s+/g, ' ').trim();
}

/* ── Busca de ajuste por TFG ── */
function buscarAjusteRenal(nomeGenerico, tfg) {
  if (tfg === null || tfg === undefined) return null;
  const chave = _normAR(nomeGenerico);

  let dados = _AJUSTE_RENAL[chave];

  if (!dados) {
    const palavras = chave.split(' ');
    for (const [k, v] of Object.entries(_AJUSTE_RENAL)) {
      if (k.startsWith(palavras[0])) { dados = v; break; }
    }
  }
  if (!dados) {
    const primeira = chave.split(' ')[0];
    for (const [k, v] of Object.entries(_AJUSTE_RENAL)) {
      if (k.split(' ')[0] === primeira) { dados = v; break; }
    }
  }
  if (!dados || !dados.alertas || !dados.alertas.length) return null;

  for (const a of dados.alertas) {
    if (tfg <= a.tfgMax) return { nivel: a.nivel, texto: a.texto };
  }
  return null;
}
