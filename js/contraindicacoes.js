/* VitaDose — Contraindicações por Patologia */

/* Labels exibidos nas UIs (app.js, relatorio.html, perfil.html) */
const CONDICOES_LABELS = {
  asma:        'Asma / DPOC',
  ic:          'Insuficiência Cardíaca',
  hepatica:    'Insuficiência Hepática',
  epilepsia:   'Epilepsia',
  glaucoma:    'Glaucoma Ângulo Fechado',
  hpb:         'Hiperplasia Prostática',
  gota:        'Gota / Hiperuricemia',
  gastrite:    'Gastrite / Úlcera Péptica',
  gestacao:    'Gestação',
  osteoporose: 'Osteoporose',
  miastenia:   'Miastenia Gravis',
  parkinson:   'Doença de Parkinson',
  dm:          'Diabetes Mellitus',
  has:         'Hipertensão Arterial',
};

/*
  Cada entrada:
    termos     — fragmentos de nome genérico (lowercase, sem acento)
    condicoes  — IDs de condições clínicas (devem estar em CONDICOES_LABELS)
    risco      — 'grave' | 'moderado'
    motivo     — explicação clínica
    alternativa — alternativa terapêutica recomendada
*/
const _CI_TABLE = [

  /* ── Betabloqueadores + Asma ── */
  {
    termos: ['atenolol','metoprolol','propranolol','carvedilol','bisoprolol','nebivolol','nadolol','timolol'],
    condicoes: ['asma'],
    risco: 'grave',
    motivo: 'Betabloqueadores (seletivos ou não) podem precipitar broncoespasmo grave em asmáticos, mesmo em doses baixas. Cardiosseletivos têm menor risco mas não são seguros em asma moderada/grave.',
    alternativa: 'Para HAS + Asma: prefira amlodipino, IECA ou BRA. Para FA com asma: considere diltiazem ou amiodarona sob supervisão.',
  },

  /* ── AINEs + Insuficiência Cardíaca ── */
  {
    termos: ['ibuprofeno','naproxeno','diclofenaco','cetoprofeno','indometacina','piroxicam','meloxicam','celecoxibe','nimesulida','etoricoxibe','tenoxicam','rofecoxibe'],
    condicoes: ['ic'],
    risco: 'grave',
    motivo: 'AINEs causam retenção de sódio e água, elevam a pré-carga e a PA, podendo precipitar descompensação aguda da IC. Aumentam risco de internação hospitalar e mortalidade.',
    alternativa: 'Para dor/inflamação na IC: paracetamol é a primeira escolha. Evitar AINEs; se imprescindíveis, usar a menor dose pelo menor tempo com vigilância clínica.',
  },

  /* ── AINEs + Gastrite/Úlcera ── */
  {
    termos: ['ibuprofeno','naproxeno','diclofenaco','cetoprofeno','indometacina','piroxicam','meloxicam','nimesulida','etoricoxibe','tenoxicam','acido acetilsalicilico','aspirina','aas'],
    condicoes: ['gastrite'],
    risco: 'grave',
    motivo: 'AINEs inibem a síntese de prostaglandinas (PGE2) que protegem a mucosa gástrica, causando úlceras, sangramento e perfuração GI. O risco é dose-dependente e cumulativo.',
    alternativa: 'Se AINE for inevitável: associar IBP (omeprazol, pantoprazol). Preferir celecoxibe (menor risco GI) ou substituir por paracetamol.',
  },

  /* ── Corticoide + Gastrite ── */
  {
    termos: ['prednisona','prednisolona','dexametasona','betametasona','hidrocortisona','metilprednisolona','triamcinolona','budesonida oral'],
    condicoes: ['gastrite'],
    risco: 'moderado',
    motivo: 'Corticoides sistêmicos reduzem a mucosa de proteção gástrica e, em associação com AINEs, elevam substancialmente o risco de úlcera péptica e sangramento GI.',
    alternativa: 'Usar corticoides sistêmicos com IBP profilático (omeprazol ou pantoprazol) quando o tratamento ultrapassar 7–10 dias.',
  },

  /* ── Metformina + Insuficiência Hepática ── */
  {
    termos: ['metformina'],
    condicoes: ['hepatica'],
    risco: 'grave',
    motivo: 'Insuficiência hepática grave prejudica o clearance hepático de lactato, aumentando o risco de acidose lática (rara mas potencialmente fatal) com metformina.',
    alternativa: 'Em hepatopatas graves (Child-Pugh C): prefira insulina. Contraindicada com bilirrubina > 2× LSN ou ALT > 3× LSN.',
  },

  /* ── Estatinas + Insuficiência Hepática ── */
  {
    termos: ['sinvastatina','atorvastatina','rosuvastatina','lovastatina','pravastatina','fluvastatina','pitavastatina'],
    condicoes: ['hepatica'],
    risco: 'grave',
    motivo: 'Estatinas são metabolizadas extensamente pelo fígado (principalmente CYP3A4 para sinva/atorva). Em hepatopatia ativa podem agravar a lesão hepatocelular. Contraindicadas com transaminases > 3× LSN.',
    alternativa: 'Suspender até estabilização hepática. Reavaliação após 3 meses de função hepática normal.',
  },

  /* ── Anticolinérgicos + Glaucoma ── */
  {
    termos: ['oxibutinina','darifenacina','solifenacina','tolterodina','fesoterodina','biperideno','triexifenidila','escopolamina','hiosciamina','atropina','ipratropio','tiotropio'],
    condicoes: ['glaucoma'],
    risco: 'grave',
    motivo: 'Anticolinérgicos causam midríase (dilatação pupilar) que pode bloquear o canal de Schlemm e precipitar crise aguda de glaucoma de ângulo fechado — emergência oftalmológica com risco de cegueira.',
    alternativa: 'Para bexiga hiperativa: mirabegrona (agonista beta-3, sem efeito pupilar). Para broncoespasmo: beta-2 agonistas. Confirmar com oftalmologista se o tipo de glaucoma é ângulo fechado ou aberto.',
  },

  /* ── Anticolinérgicos + HPB ── */
  {
    termos: ['oxibutinina','darifenacina','solifenacina','tolterodina','fesoterodina','biperideno','triexifenidila','escopolamina','amitriptilina','imipramina','clomipramina'],
    condicoes: ['hpb'],
    risco: 'grave',
    motivo: 'Anticolinérgicos reduzem a contratilidade do detrusor vesical e aumentam o tônus do esfíncter uretral, podendo causar retenção urinária aguda em pacientes com HPB — urgência urológica.',
    alternativa: 'Para bexiga hiperativa: mirabegrona. Para HPB sintomático: alfabloqueadores (tansulosina, alfuzosina) ou finasterida. Evitar TCAs nessa população.',
  },

  /* ── Anticolinérgicos + Miastenia Gravis ── */
  {
    termos: ['oxibutinina','darifenacina','solifenacina','tolterodina','fesoterodina','biperideno','triexifenidila','escopolamina','atropina'],
    condicoes: ['miastenia'],
    risco: 'grave',
    motivo: 'Anticolinérgicos antagonizam a acetilcolina na junção neuromuscular, podendo precipitar crise miastênica com deterioração respiratória.',
    alternativa: 'Consultar neurologista antes de iniciar qualquer anticolinérgico. Para bexiga hiperativa: mirabegrona pode ser opção mais segura.',
  },

  /* ── Tramadol / Quinolonas / Bupropiona + Epilepsia ── */
  {
    termos: ['tramadol','bupropiona','ciprofloxacino','levofloxacino','moxifloxacino','norfloxacino','ofloxacino','metronidazol'],
    condicoes: ['epilepsia'],
    risco: 'grave',
    motivo: 'Tramadol e fluoroquinolonas reduzem significativamente o limiar convulsivo por mecanismos distintos (tramadol: inibição de recaptação de serotonina + agonismo opioide; quinolonas: antagonismo GABA-A). Bupropiona é contraindicada em epilepsia (convulsão dose-dependente).',
    alternativa: 'Para dor: prefira paracetamol ou dipirona. Para infecção: beta-lactâmicos, aminoglicosídeos ou sulfas. Para tabagismo: vareniclina ou TRN.',
  },

  /* ── IECA + Gestação ── */
  {
    termos: ['enalapril','lisinopril','ramipril','captopril','perindopril','quinapril','benazepril','fosinopril','trandolapril'],
    condicoes: ['gestacao'],
    risco: 'grave',
    motivo: 'IECAs são fetotóxicos no 2º e 3º trimestres: causam oligoidrâmnio, hipocalvária, displasia tubular renal fetal, hipotensão neonatal e anúria. Contraindicados em toda a gestação.',
    alternativa: 'HAS na gestação: metildopa (1ª linha), nifedipino de longa ação ou hidralazina. Betabloqueadores (labetalol) como opção adicional.',
  },

  /* ── BRA/Sartanas + Gestação ── */
  {
    termos: ['losartana','valsartana','irbesartana','candesartana','olmesartana','telmisartana','azilsartana','eprosartana'],
    condicoes: ['gestacao'],
    risco: 'grave',
    motivo: 'BRA/sartanas causam fetotoxicidade renal similar aos IECAs e estão contraindicados em toda a gestação. O risco se aplica desde o 1º trimestre.',
    alternativa: 'HAS na gestação: metildopa (1ª linha), nifedipino de longa ação ou hidralazina.',
  },

  /* ── Estatinas + Gestação ── */
  {
    termos: ['sinvastatina','atorvastatina','rosuvastatina','lovastatina','pravastatina','pitavastatina','fluvastatina'],
    condicoes: ['gestacao'],
    risco: 'grave',
    motivo: 'Estatinas são contraindicadas na gestação (possível teratogenicidade — inibição da via do mevalonato essencial ao desenvolvimento fetal). Suspender ao descobrir a gravidez.',
    alternativa: 'Suspender durante toda gestação e lactação. Reintroduzir após o desmame. Dislipidemia gestacional raramente requer farmacoterapia.',
  },

  /* ── Valproato + Gestação ── */
  {
    termos: ['acido valproico','valproato','valproato de sodio','divalproex','depakene','depakote'],
    condicoes: ['gestacao'],
    risco: 'grave',
    motivo: 'Valproato é o antiepiléptico mais teratogênico: espinha bífida (~1–2%), malformações cardíacas, fendas palatinas e déficit cognitivo persistente no filho. EURAP recomenda evitar sempre que possível.',
    alternativa: 'Alternativas com menor risco teratogênico: lamotrigina, levetiracetam ou lacosamida — em discussão compartilhada com neurologista e gestação de alto risco.',
  },

  /* ── Carbamazepina / Fenitoína + Gestação ── */
  {
    termos: ['carbamazepina','fenitoina','oxcarbazepina','fenobarbital','primidona'],
    condicoes: ['gestacao'],
    risco: 'moderado',
    motivo: 'Antiepilépticos enzimáticos (carbamazepina, fenitoína) têm risco teratogênico moderado (malformações cardíacas, palato fendido). Fenobarbital tem risco de deficiência cognitiva. Suplementação com folato é mandatória.',
    alternativa: 'Suplementar ácido fólico 4–5 mg/dia desde o pré-concepcional. Preferir antiepilépticos de menor risco (lamotrigina, levetiracetam) sempre que possível. Não suspender abruptamente — risco de crise convulsiva.',
  },

  /* ── Antipsicóticos típicos + Parkinson ── */
  {
    termos: ['haloperidol','clorpromazina','levomepromazina','tioridazina','risperidona','pimozida','metoclopramida','domperidona'],
    condicoes: ['parkinson'],
    risco: 'grave',
    motivo: 'Antipsicóticos típicos e metoclopramida bloqueiam receptores dopaminérgicos D2 no estriado, piorando dramaticamente os sintomas parkinsonianos: rigidez, tremor, acinesia. Podem precipitar crises agudas.',
    alternativa: 'Para psicose no Parkinson: quetiapina (menor afinidade D2) ou clozapina (com monitoramento de leucócitos). Para náusea: domperidona age perifericamente (não cruza BHE) — preferir a metoclopramida.',
  },

  /* ── Corticoides + Osteoporose ── */
  {
    termos: ['prednisona','prednisolona','dexametasona','betametasona','hidrocortisona','metilprednisolona','triamcinolona'],
    condicoes: ['osteoporose'],
    risco: 'moderado',
    motivo: 'Corticoides sistêmicos em uso crônico (≥ 3 meses, ≥ 5 mg/dia de prednisona) inibem a formação óssea pelos osteoblastos e aumentam a reabsorção pelos osteoclastos, agravando progressivamente a osteoporose e o risco de fratura.',
    alternativa: 'Associar profilaxia: cálcio (1.000–1.500 mg/dia), vitamina D (800–1.000 UI/dia) e bifosfonato (alendronato ou risedronato) desde o início do tratamento ≥ 3 meses. Monitorar densitometria óssea anualmente.',
  },

  /* ── Corticoides + Diabetes ── */
  {
    termos: ['prednisona','prednisolona','dexametasona','betametasona','hidrocortisona','metilprednisolona','triamcinolona'],
    condicoes: ['dm'],
    risco: 'moderado',
    motivo: 'Corticoides sistêmicos causam hiperglicemia dose-dependente por indução de resistência à insulina e estimulação da gliconeogênese hepática. Podem descompensar completamente um DM previamente controlado.',
    alternativa: 'Monitorar glicemia mais frequentemente. Ajustar antidiabéticos (intensificar insulina ou adicionar hipoglicemiante) durante o curso do corticoide. Para uso tópico ou inalatório: risco significativamente menor.',
  },

  /* ── Corticoides + Insuficiência Cardíaca ── */
  {
    termos: ['prednisona','prednisolona','dexametasona','betametasona','hidrocortisona','metilprednisolona'],
    condicoes: ['ic'],
    risco: 'moderado',
    motivo: 'Corticoides sistêmicos causam retenção de sódio e água (efeito mineralocorticoide), aumentando a volemia e podendo precipitar descompensação da IC. O risco é menor com dexametasona (menor efeito mineralocorticoide).',
    alternativa: 'Usar a menor dose necessária pelo menor tempo. Monitorar sinais de retenção hídrica (peso, edema, dispneia). Preferir via inalatória quando possível.',
  },

  /* ── Tiazídicos + Gota ── */
  {
    termos: ['hidroclorotiazida','clortalidona','indapamida','bendroflumetiazida'],
    condicoes: ['gota'],
    risco: 'moderado',
    motivo: 'Diuréticos tiazídicos competem com o ácido úrico na secreção tubular renal, reduzindo sua excreção e elevando a uricemia. Podem precipitar crises agudas de gota ou dificultar o controle com uricosúricos.',
    alternativa: 'Para HAS com gota: prefira losartana (tem efeito uricosúrico complementar) ou amlodipino. Se diurético for necessário, preferir furosemida em baixa dose monitorando ácido úrico.',
  },

  /* ── Diuréticos de Alça + Gota ── */
  {
    termos: ['furosemida','bumetanida','torasemida','acido etacrinico'],
    condicoes: ['gota'],
    risco: 'moderado',
    motivo: 'Diuréticos de alça elevam a uricemia por competição na secreção tubular, podendo precipitar crises de gota ou dificultaro controle farmacológico.',
    alternativa: 'Se diurético for necessário na IC/HAS: considerar losartana (uricosúrica) como anti-hipertensivo adjuvante. Iniciar alopurinol profilático se crises frequentes.',
  },

  /* ── Contraceptivos Orais Combinados + HAS ── */
  {
    termos: ['anticoncepcional','anticoncepcional oral','etinilestradiol','levonorgestrel combinado','noretisterona acetato combinado','gestodeno combinado','desogestrel combinado'],
    condicoes: ['has'],
    risco: 'moderado',
    motivo: 'ACOs combinados (com etinilestradiol) podem elevar a PA em 1–5 mmHg por ativação do sistema renina-angiotensina e aumentar o risco de AVC trombótico, especialmente em HAS não controlada ou em tabagistas acima de 35 anos.',
    alternativa: 'Prefira métodos sem estrogênio: DIU hormonal (levonorgestrel isolado), implante subdérmico de etonogestrel, mini-pílula (desogestrel 75 mcg) ou preservativo. Orientar sobre métodos de barreira.',
  },

];

/* ── Busca CIs para um medicamento específico ────────────── */
function buscarContraindicacoes(nomeMed, condicoesPaciente) {
  if (!nomeMed || !condicoesPaciente || !condicoesPaciente.length) return [];

  const n = nomeMed.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '');

  return _CI_TABLE.filter(ci =>
    ci.termos.some(t => n.includes(t)) &&
    ci.condicoes.some(c => condicoesPaciente.includes(c))
  );
}

/* ── Verifica todos os medicamentos de um paciente ────────── */
function verificarContraindicacoes(medicamentos, condicoesPaciente) {
  if (!condicoesPaciente || !condicoesPaciente.length) return [];

  const resultado = [];
  const vistos    = new Set();

  for (const med of medicamentos) {
    const cis = buscarContraindicacoes(med.nome, condicoesPaciente);
    for (const ci of cis) {
      const key = `${med.nome}|${ci.condicoes.join(',')}|${ci.risco}`;
      if (!vistos.has(key)) {
        vistos.add(key);
        resultado.push({ med: med.nome, ...ci });
      }
    }
  }

  const ordem = { grave: 0, moderado: 1 };
  return resultado.sort((a, b) => (ordem[a.risco] ?? 1) - (ordem[b.risco] ?? 1));
}
