/* VitaDose — Calculadora de Dose Pediátrica
   Referências: Taketomo et al. (Lexi-Comp Pediatric), SBPD, PCRB 2023.
   ATENÇÃO: Ferramenta de apoio. Sempre confirmar com o prescritor.

   Estrutura de cada entrada:
     id           — identificador único
     nome         — nome genérico completo
     grupo        — grupo terapêutico
     doseMgKg     — mg/kg/dose: número único ou [min, max]
     intervalo    — texto descritivo (ex.: "a cada 8 horas")
     doseMaxMg    — dose máxima por administração (mg)
     doseMaxDiaMg — (opcional) dose máxima diária (mg)
     formas       — [ { desc, concMgMl } ] ou [ { desc, compMg } ]
     nota         — orientação clínica
     alerta       — aviso de segurança (opcional)
     idadeMinMeses— (opcional) idade mínima em meses
     naoUsaPeso   — true → dose por faixa etária (não por peso)
*/

const PEDI_GRUPOS = {
  analgesico:   'Analgésico / Antipirético',
  antibiotico:  'Antibiótico / Antifúngico',
  corticoide:   'Corticoide',
  gi:           'Gastrintestinal',
  respiratorio: 'Respiratório / Alergia',
  neuro:        'Neurológico',
  outros:       'Outros',
};

const PEDI_MEDS = [

  /* ════════ Analgésicos / Antipiréticos ════════ */
  {
    id:'paracetamol', nome:'Paracetamol / Acetaminofeno', grupo:'analgesico',
    doseMgKg:[10,15], intervalo:'a cada 6 horas (mín. 4h)', doseMaxMg:750, doseMaxDiaMg:4000,
    formas:[
      { desc:'Gotas 200 mg/mL', concMgMl:200 },
      { desc:'Suspensão 160 mg/5 mL (32 mg/mL)', concMgMl:32 },
    ],
    nota:'Não ultrapassar 5 doses/dia (máx. 4 g/dia). Intervalo mínimo de 4 horas entre doses. Escolha preferencial para analgesia e antitérmica em crianças.',
  },
  {
    id:'ibuprofeno', nome:'Ibuprofeno', grupo:'analgesico',
    doseMgKg:[5,10], intervalo:'a cada 6–8 horas', doseMaxMg:400, doseMaxDiaMg:1200,
    formas:[
      { desc:'Suspensão 100 mg/5 mL (20 mg/mL)', concMgMl:20 },
      { desc:'Suspensão 200 mg/5 mL (40 mg/mL)', concMgMl:40 },
    ],
    nota:'Contraindicado < 6 meses. Evitar em varicela, dengue, desidratação e sangramento gastrointestinal.',
    alerta:'Contraindicado em dengue, varicela e desidratação.',
    idadeMinMeses:6,
  },
  {
    id:'dipirona', nome:'Dipirona / Metamizol', grupo:'analgesico',
    doseMgKg:[10,15], intervalo:'a cada 6 horas (mín. 4h)', doseMaxMg:1000,
    formas:[
      { desc:'Gotas 500 mg/mL', concMgMl:500 },
      { desc:'Suspensão 250 mg/5 mL (50 mg/mL)', concMgMl:50 },
    ],
    nota:'Contraindicado < 3 meses. Intervalo mínimo de 4 horas. Risco (raro) de agranulocitose.',
    idadeMinMeses:3,
  },

  /* ════════ Antibióticos / Antifúngicos ════════ */
  {
    id:'amoxicilina', nome:'Amoxicilina', grupo:'antibiotico',
    doseMgKg:[8,17], intervalo:'a cada 8 horas', doseMaxMg:500,
    formas:[
      { desc:'Suspensão 250 mg/5 mL (50 mg/mL)', concMgMl:50 },
      { desc:'Suspensão 500 mg/5 mL (100 mg/mL)', concMgMl:100 },
    ],
    nota:'Dose equivale a 25–50 mg/kg/dia ÷ 3 doses. Para otite média/sinusite/pneumonia: 40–90 mg/kg/dia (12–30 mg/kg/dose).',
  },
  {
    id:'amoxicilina-clavulanato', nome:'Amoxicilina + Clavulanato', grupo:'antibiotico',
    doseMgKg:[13,22], intervalo:'a cada 8 horas', doseMaxMg:875,
    formas:[
      { desc:'Suspensão 250+62,5 mg/5 mL (50 mg/mL amox)', concMgMl:50 },
      { desc:'Suspensão 400+57 mg/5 mL (80 mg/mL amox)', concMgMl:80 },
    ],
    nota:'Dose refere-se à amoxicilina (componente ativo principal). Indicado quando há suspeita de bactérias produtoras de beta-lactamase.',
  },
  {
    id:'cefalexina', nome:'Cefalexina', grupo:'antibiotico',
    doseMgKg:[12,25], intervalo:'a cada 6–8 horas', doseMaxMg:500,
    formas:[
      { desc:'Suspensão 250 mg/5 mL (50 mg/mL)', concMgMl:50 },
    ],
    nota:'Para infecções graves (celulite, osteomielite): até 100 mg/kg/dia. Cefalosporina de 1ª geração.',
  },
  {
    id:'azitromicina', nome:'Azitromicina', grupo:'antibiotico',
    doseMgKg:10, intervalo:'1 vez ao dia', doseMaxMg:500,
    formas:[
      { desc:'Suspensão 200 mg/5 mL (40 mg/mL)', concMgMl:40 },
    ],
    nota:'Faringite estreptocócica: 10 mg/kg/dia × 3 dias. Sinusite/pneumonia atípica: 10 mg/kg/dia × 5 dias (D1: 10 mg/kg, D2–5: 5 mg/kg/dia).',
  },
  {
    id:'claritromicina', nome:'Claritromicina', grupo:'antibiotico',
    doseMgKg:7.5, intervalo:'a cada 12 horas', doseMaxMg:500,
    formas:[
      { desc:'Suspensão 125 mg/5 mL (25 mg/mL)', concMgMl:25 },
      { desc:'Suspensão 250 mg/5 mL (50 mg/mL)', concMgMl:50 },
    ],
    nota:'Dose equivale a 15 mg/kg/dia ÷ 2 doses. Indicada em infecções por organismos atípicos (Mycoplasma, Chlamydia).',
  },
  {
    id:'smz-tmp', nome:'Sulfametoxazol + Trimetoprima (SMZ-TMP)', grupo:'antibiotico',
    doseMgKg:12.5, intervalo:'a cada 12 horas', doseMaxMg:800,
    formas:[
      { desc:'Suspensão 200+40 mg/5 mL (40 mg/mL SMZ)', concMgMl:40 },
    ],
    nota:'Dose refere-se ao sulfametoxazol (SMZ). Indicado para ITU, otite e pneumocistose. Contraindicado < 2 meses.',
    alerta:'Contraindicado em menores de 2 meses. Cuidado com desidratação.',
    idadeMinMeses:2,
  },
  {
    id:'metronidazol', nome:'Metronidazol', grupo:'antibiotico',
    doseMgKg:5, intervalo:'a cada 8 horas', doseMaxMg:500,
    formas:[
      { desc:'Suspensão 40 mg/mL (200 mg/5 mL)', concMgMl:40 },
    ],
    nota:'Giardíase: 15 mg/kg/dose (8/8h × 5 dias). Amebíase: 10–15 mg/kg/dose (8/8h × 10 dias). Infecção anaeróbia: 5 mg/kg/dose (8/8h).',
  },
  {
    id:'cefadroxila', nome:'Cefadroxila', grupo:'antibiotico',
    doseMgKg:15, intervalo:'a cada 12 horas', doseMaxMg:1000,
    formas:[
      { desc:'Suspensão 250 mg/5 mL (50 mg/mL)', concMgMl:50 },
      { desc:'Suspensão 500 mg/5 mL (100 mg/mL)', concMgMl:100 },
    ],
    nota:'Dose equivale a 30 mg/kg/dia ÷ 2 doses. Para faringite: pode usar 30 mg/kg/dose em dose única diária × 10 dias.',
  },
  {
    id:'nitrofurantoina', nome:'Nitrofurantoína', grupo:'antibiotico',
    doseMgKg:1.75, intervalo:'a cada 6 horas', doseMaxMg:100,
    formas:[
      { desc:'Suspensão 25 mg/5 mL (5 mg/mL)', concMgMl:5 },
    ],
    nota:'ITU: 5–7 mg/kg/dia ÷ 4 doses. Profilaxia de ITU: 1–2 mg/kg/noite. Contraindicado < 1 mês e TFG < 30 mL/min.',
    alerta:'Contraindicado < 1 mês e em insuficiência renal.',
    idadeMinMeses:1,
  },
  {
    id:'fluconazol', nome:'Fluconazol', grupo:'antibiotico',
    doseMgKg:6, intervalo:'1 vez ao dia', doseMaxMg:400,
    formas:[
      { desc:'Suspensão 10 mg/mL (50 mg/5 mL)', concMgMl:10 },
      { desc:'Suspensão 40 mg/mL (200 mg/5 mL)', concMgMl:40 },
    ],
    nota:'Candidíase orofaríngea: 6 mg/kg no D1, depois 3 mg/kg/dia × 7–14 dias. Candidemia: 12 mg/kg/dia × 14 dias pós-última hemocultura negativa.',
  },
  {
    id:'cefalotina', nome:'Cefalotina / Cefazolina (EV)', grupo:'antibiotico',
    doseMgKg:[25,50], intervalo:'a cada 6–8 horas (EV)', doseMaxMg:2000,
    formas:[],
    nota:'Via endovenosa. Dose de 25–100 mg/kg/dia ÷ 3–4 doses. Cefalosporina 1ª geração — infecções cirúrgicas e estafilocócicas.',
    alerta:'Uso hospitalar — via endovenosa.',
  },

  /* ════════ Corticoides ════════ */
  {
    id:'prednisolona', nome:'Prednisolona', grupo:'corticoide',
    doseMgKg:[1,2], intervalo:'1 vez ao dia (pela manhã)', doseMaxMg:60,
    formas:[
      { desc:'Suspensão 3 mg/mL (15 mg/5 mL)', concMgMl:3 },
    ],
    nota:'Asma aguda: 1–2 mg/kg/dia × 3–5 dias. Croup leve-moderado: 1 mg/kg/dose (dose única). Síndrome nefrótica: 2 mg/kg/dia.',
  },
  {
    id:'dexametasona', nome:'Dexametasona', grupo:'corticoide',
    doseMgKg:[0.15,0.6], intervalo:'dose única ou conforme prescrição', doseMaxMg:12,
    formas:[
      { desc:'Suspensão 0,1 mg/mL (0,5 mg/5 mL)', concMgMl:0.1 },
    ],
    nota:'Croup: 0,15–0,6 mg/kg/dose (máx. 12 mg). Edema cerebral: 0,5–1,5 mg/kg/dose (inicial). Potência 6× maior que prednisolona.',
  },

  /* ════════ Gastrintestinal ════════ */
  {
    id:'ondansetrona', nome:'Ondansetrona', grupo:'gi',
    doseMgKg:[0.1,0.15], intervalo:'a cada 8 horas', doseMaxMg:4,
    formas:[
      { desc:'Solução 0,8 mg/mL (4 mg/5 mL)', concMgMl:0.8 },
      { desc:'Comprimido 4 mg', compMg:4 },
    ],
    nota:'Náuseas e vômitos agudos. Não usar rotineiramente em < 6 meses. Máximo 3 doses/dia por até 2 dias.',
    idadeMinMeses:6,
  },
  {
    id:'domperidona', nome:'Domperidona', grupo:'gi',
    doseMgKg:0.25, intervalo:'a cada 8 horas', doseMaxMg:10,
    formas:[
      { desc:'Suspensão 1 mg/mL (5 mg/5 mL)', concMgMl:1 },
    ],
    nota:'Refluxo gastroesofágico. Usar pelo menor tempo necessário. Risco de prolongamento do QT.',
    alerta:'Risco de arritmia. Contraindicado em cardiopatias e < 1 ano.',
    idadeMinMeses:12,
  },
  {
    id:'ranitidina', nome:'Ranitidina', grupo:'gi',
    doseMgKg:[2,4], intervalo:'a cada 12 horas', doseMaxMg:150,
    formas:[
      { desc:'Xarope 15 mg/mL (75 mg/5 mL)', concMgMl:15 },
    ],
    nota:'Proteção gástrica em uso de AINEs ou corticoides. Para DRGE: preferir omeprazol.',
  },
  {
    id:'omeprazol', nome:'Omeprazol', grupo:'gi',
    doseMgKg:[0.5,1], intervalo:'1 vez ao dia (30 min antes do café)', doseMaxMg:20,
    formas:[
      { desc:'Cápsula 20 mg (referência por peso)', compMg:20 },
    ],
    nota:'Para < 20 kg: 10 mg/dia. Para ≥ 20 kg: 20 mg/dia. Cápsulas de 10 mg disponíveis para dose < 20 mg. Pode abrir a cápsula e misturar em suco levemente ácido.',
  },
  {
    id:'metoclopramida', nome:'Metoclopramida', grupo:'gi',
    doseMgKg:0.1, intervalo:'a cada 8 horas', doseMaxMg:5,
    formas:[
      { desc:'Gotas 4 mg/mL', concMgMl:4 },
      { desc:'Xarope 1 mg/mL (5 mg/5 mL)', concMgMl:1 },
    ],
    nota:'Usar pelo menor tempo possível (< 5 dias). Risco de reação extrapiramidal, especialmente em crianças < 14 anos.',
    alerta:'Risco de discinesia/trismo em crianças. Uso breve e monitorado.',
  },

  /* ════════ Respiratório / Alergia ════════ */
  {
    id:'cetirizina', nome:'Cetirizina', grupo:'respiratorio',
    doseMgKg:0.25, intervalo:'1 vez ao dia', doseMaxMg:10,
    formas:[
      { desc:'Solução 1 mg/mL (5 mg/5 mL)', concMgMl:1 },
    ],
    nota:'Para ≥ 6 meses. 6 meses–2 anos: 2,5 mg/dia. 2–6 anos: 2,5 mg/12h ou 5 mg/dia. ≥ 6 anos: 5–10 mg/dia.',
    idadeMinMeses:6,
  },
  {
    id:'loratadina', nome:'Loratadina', grupo:'respiratorio',
    doseMgKg:0.2, intervalo:'1 vez ao dia', doseMaxMg:10,
    formas:[
      { desc:'Xarope 1 mg/mL (5 mg/5 mL)', concMgMl:1 },
    ],
    nota:'Para ≥ 2 anos. < 30 kg: 5 mg/dia. ≥ 30 kg: 10 mg/dia. Não sedativo — preferível para uso diurno.',
    idadeMinMeses:24,
  },
  {
    id:'dexclorfeniramina', nome:'Dexclorfeniramina', grupo:'respiratorio',
    doseMgKg:0.1, intervalo:'a cada 6–8 horas', doseMaxMg:2,
    formas:[
      { desc:'Xarope 0,4 mg/mL (2 mg/5 mL)', concMgMl:0.4 },
    ],
    nota:'Para ≥ 1 ano. Causa sedação — evitar uso diurno. Efeito anticolinérgico (boca seca, retenção urinária).',
    alerta:'Causa sedação. Contraindicado < 1 ano.',
    idadeMinMeses:12,
  },
  {
    id:'salbutamol-oral', nome:'Salbutamol / Albuterol (oral)', grupo:'respiratorio',
    doseMgKg:0.1, intervalo:'a cada 6–8 horas', doseMaxMg:4,
    formas:[
      { desc:'Xarope 0,4 mg/mL (2 mg/5 mL)', concMgMl:0.4 },
    ],
    nota:'Via inalatória é preferível (aerocâmara): 100–200 mcg (1–2 jatos) a cada 20 min nas 3 primeiras doses. Via oral é alternativa de manutenção.',
  },
  {
    id:'ambroxol', nome:'Ambroxol (Mucolítico)', grupo:'respiratorio',
    doseMgKg:1.2, intervalo:'a cada 8 horas', doseMaxMg:30,
    formas:[
      { desc:'Xarope 3 mg/mL (15 mg/5 mL)', concMgMl:3 },
      { desc:'Gotas 7,5 mg/mL', concMgMl:7.5 },
    ],
    nota:'Dose equivale a 1,2–1,6 mg/kg/dose. Ingestão de líquidos potencializa o efeito mucolítico. Não utilizar em < 2 anos sem orientação.',
  },
  {
    id:'carbocisteina', nome:'Carbocisteína (Mucolítico)', grupo:'respiratorio',
    doseMgKg:7, intervalo:'a cada 8 horas', doseMaxMg:250,
    formas:[
      { desc:'Xarope 50 mg/mL (250 mg/5 mL)', concMgMl:50 },
    ],
    nota:'~20 mg/kg/dia ÷ 3 doses. Não utilizar em < 2 anos sem prescrição médica.',
    idadeMinMeses:24,
  },
  {
    id:'montelucaste', nome:'Montelucaste', grupo:'respiratorio',
    doseMgKg:null, naoUsaPeso:true,
    intervalo:'1 vez ao dia (noite)', doseMaxMg:10,
    notaDosePorIdade:{ '6 meses–5 anos':'4 mg/noite', '6–14 anos':'5 mg/noite', '≥ 15 anos':'10 mg/noite' },
    formas:[
      { desc:'Comprimido mastigável 4 mg (6 meses–5 anos)', compMg:4 },
      { desc:'Comprimido mastigável 5 mg (6–14 anos)', compMg:5 },
    ],
    nota:'Dose por faixa etária (não por peso). Profilaxia de asma e rinite alérgica. Pode causar alterações de humor em crianças.',
    alerta:'Monitorar alterações de humor (ansiedade, pesadelos).',
  },

  /* ════════ Neurológico ════════ */
  {
    id:'fenobarbital', nome:'Fenobarbital (manutenção)', grupo:'neuro',
    doseMgKg:[3,5], intervalo:'1–2 vezes ao dia', doseMaxMg:100,
    formas:[
      { desc:'Elixir 40 mg/mL', concMgMl:40 },
    ],
    nota:'Dose de manutenção. Dose de ataque (status epilepticus): 15–20 mg/kg EV — uso hospitalar. Monitorar com nível sérico (alvo: 15–40 mcg/mL).',
    alerta:'Dose de ataque apenas em ambiente hospitalar.',
  },
  {
    id:'carbamazepina', nome:'Carbamazepina', grupo:'neuro',
    doseMgKg:[5,7], intervalo:'a cada 12 horas', doseMaxMg:200,
    formas:[
      { desc:'Suspensão 20 mg/mL (100 mg/5 mL)', concMgMl:20 },
    ],
    nota:'Dose inicial (5–10 mg/kg/dia). Dose alvo: 10–20 mg/kg/dia. Monitorar com nível sérico (alvo: 4–12 mcg/mL) e hemograma.',
    alerta:'Monitorar hemograma e Na⁺ (risco de hiponatremia). Induz enzimas hepáticas.',
  },
  {
    id:'valproato', nome:'Ácido Valproico / Valproato', grupo:'neuro',
    doseMgKg:[5,10], intervalo:'a cada 8–12 horas', doseMaxMg:500,
    formas:[
      { desc:'Suspensão 50 mg/mL (250 mg/5 mL)', concMgMl:50 },
    ],
    nota:'Dose inicial. Alvo: 15–40 mg/kg/dia. Nível sérico alvo: 50–100 mcg/mL. Monitorar função hepática.',
    alerta:'Hepatotoxicidade grave em < 2 anos. Contraindicado em doenças mitocondriais.',
    idadeMinMeses:24,
  },
  {
    id:'clonazepam', nome:'Clonazepam', grupo:'neuro',
    doseMgKg:[0.01,0.05], intervalo:'a cada 12 horas', doseMaxMg:0.5,
    formas:[
      { desc:'Gotas 2,5 mg/mL (0,1 mg/gota)', concMgMl:2.5 },
    ],
    nota:'Dose inicial (0,01–0,05 mg/kg/dia ÷ 2 doses). Dose alvo: até 0,2 mg/kg/dia (máx. 20 mg/dia). Não interromper abruptamente.',
    alerta:'Dependência e sedação. Não suspender abruptamente — risco de crises.',
  },
  {
    id:'levetiracetam', nome:'Levetiracetam', grupo:'neuro',
    doseMgKg:[10,20], intervalo:'a cada 12 horas', doseMaxMg:1500,
    formas:[
      { desc:'Solução oral 100 mg/mL', concMgMl:100 },
    ],
    nota:'Dose inicial (10 mg/kg/dose, 12/12h). Aumentar a cada 2 semanas até 20–30 mg/kg/dose. Bem tolerado, sem interações enzimáticas.',
  },

  /* ════════ Outros ════════ */
  {
    id:'sulfato-ferroso', nome:'Sulfato Ferroso (Fe elementar)', grupo:'outros',
    doseMgKg:[3,6], intervalo:'1–2 vezes ao dia (em jejum)', doseMaxMg:60,
    formas:[
      { desc:'Gotas 25 mg/mL (Fe elementar ≈ 5 mg/mL)', concMgMl:5 },
    ],
    nota:'Dose em mg/kg/dia de FERRO ELEMENTAR (≈20% da fórmula de sulfato ferroso). Volume calculado com base no Fe elementar das gotas padrão (~5 mg/mL). Escurecimento das fezes é esperado.',
    alerta:'Volume calculado para Fe elementar. Verificar concentração da formulação disponível.',
  },
  {
    id:'zinco', nome:'Zinco (Sulfato/Gluconato)', grupo:'outros',
    doseMgKg:[0.5,1], intervalo:'1 vez ao dia', doseMaxMg:20,
    formas:[
      { desc:'Solução 10 mg/5 mL (2 mg/mL de Zn elementar)', concMgMl:2 },
    ],
    nota:'Para diarreia aguda (OMS/SBGP): < 6 meses → 10 mg/dia; ≥ 6 meses → 20 mg/dia × 10–14 dias.',
  },
  {
    id:'hidróxido-alumínio', nome:'Hidróxido de Alumínio (Antiácido)', grupo:'outros',
    doseMgKg:null, naoUsaPeso:true,
    intervalo:'1–2 horas após as refeições e ao deitar',
    doseMaxMg:null,
    notaDosePorIdade:{ 'Lactentes':'2,5 mL/dose', 'Pré-escolares (2–5 anos)':'5 mL/dose', 'Escolares (> 6 anos)':'10 mL/dose' },
    formas:[{ desc:'Suspensão 61 mg/mL (305 mg/5 mL)', concMgMl:61 }],
    nota:'Doses por faixa etária (não por peso). Não usar cronicamente — pode causar hipofosfatemia.',
  },
];

/* ═══ Busca de medicamento ════════════════════════════════ */
function buscarPediMed(query) {
  const q = query.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  if (!q) return [];
  return PEDI_MEDS.filter(m =>
    m.nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q) ||
    m.id.includes(q)
  );
}

/* ═══ Cálculo de dose ═════════════════════════════════════ */
/**
 * @param {string}  medId    — ID do medicamento em PEDI_MEDS
 * @param {number}  pesoKg   — peso do paciente em kg (> 0)
 * @param {number}  formaIdx — índice da forma farmacêutica desejada
 * @returns {Object|null}
 */
function calcularDosePediatrica(medId, pesoKg, formaIdx = 0) {
  const med = PEDI_MEDS.find(m => m.id === medId);
  if (!med) return null;
  if (med.naoUsaPeso) return { med, pesoKg, naoUsaPeso: true };
  if (!pesoKg || pesoKg <= 0) return null;

  const [dMin, dMax] = Array.isArray(med.doseMgKg)
    ? [med.doseMgKg[0], med.doseMgKg[1]]
    : [med.doseMgKg, med.doseMgKg];

  const calcMin = +(dMin * pesoKg).toFixed(2);
  const calcMax = +(dMax * pesoKg).toFixed(2);

  const doseMin = +Math.min(calcMin, med.doseMaxMg).toFixed(1);
  const doseMax = +Math.min(calcMax, med.doseMaxMg).toFixed(1);

  const forma = med.formas?.[formaIdx] ?? null;

  let volMin = null, volMax = null;
  let compMin = null, compMax = null;
  if (forma?.concMgMl) {
    volMin = +(doseMin / forma.concMgMl).toFixed(1);
    volMax = +(doseMax / forma.concMgMl).toFixed(1);
  } else if (forma?.compMg) {
    compMin = +(doseMin / forma.compMg).toFixed(2);
    compMax = +(doseMax / forma.compMg).toFixed(2);
  }

  return {
    med, pesoKg, formaIdx, forma,
    doseMin, doseMax,
    limitadaMin: calcMin > med.doseMaxMg,
    limitadaMax: calcMax > med.doseMaxMg,
    doseUnica: dMin === dMax,
    volMin, volMax,
    compMin, compMax,
  };
}
