/* VitaDose — Base de alertas clínicos (MVP: 20 fármacos) */

const ALERTAS_BASE = [
  {
    palavras: ['losartana','enalapril','captopril','ramipril','lisinopril'],
    tipo: 'alimentacao',
    titulo: 'IECA / ARA-II · Potássio',
    desc: 'Evitar banana, laranja, coco e sal light em excesso — podem elevar o potássio.',
  },
  {
    palavras: ['metformina'],
    tipo: 'alimentacao',
    titulo: 'Metformina · Alimentação',
    desc: 'Tomar junto ou imediatamente após a refeição para reduzir desconforto gástrico.',
  },
  {
    palavras: ['sinvastatina','atorvastatina','rosuvastatina','lovastatina'],
    tipo: 'alimentacao',
    titulo: 'Estatina · Toranja (Grapefruit)',
    desc: 'Evitar suco de toranja — inibe o metabolismo da estatina e aumenta risco de miopatia.',
  },
  {
    palavras: ['varfarina','warfarina'],
    tipo: 'interacao',
    titulo: 'Varfarina · Vitamina K',
    desc: 'Manter consumo estável de vegetais verdes (couve, brócolis, espinafre) — variações alteram o INR.',
  },
  {
    palavras: ['varfarina','warfarina'],
    tipo: 'interacao',
    titulo: 'Varfarina · AAS / Anti-inflamatórios',
    desc: 'Não usar aspirina, ibuprofeno ou diclofenaco sem orientação médica — risco de sangramento grave.',
  },
  {
    palavras: ['levotiroxina'],
    tipo: 'alimentacao',
    titulo: 'Levotiroxina · Intervalo Alimentar',
    desc: 'Tomar em jejum, 30–60 min antes do café. Evitar cálcio, ferro e soja próximos à dose.',
  },
  {
    palavras: ['ácido acetilsalicílico','aas','aspirina'],
    tipo: 'interacao',
    titulo: 'AAS · Anti-inflamatórios',
    desc: 'Não combinar com ibuprofeno ou naproxeno sem prescrição — risco de sangramento gastrointestinal.',
  },
  {
    palavras: ['furosemida','espironolactona'],
    tipo: 'alimentacao',
    titulo: 'Diurético · Hidratação',
    desc: 'Aumentar ingesta de água. Furosemida pode causar hipocalemia — monitorar fraqueza muscular.',
  },
  {
    palavras: ['clopidogrel'],
    tipo: 'interacao',
    titulo: 'Clopidogrel · Omeprazol',
    desc: 'Omeprazol reduz o efeito antiagregante. Prefira pantoprazol ou rabeprazol se necessário.',
  },
  {
    palavras: ['metformina','glibenclamida','glipizida','insulina'],
    tipo: 'alimentacao',
    titulo: 'Hipoglicemiante · Alimentação regular',
    desc: 'Não pular refeições. O risco de hipoglicemia aumenta com jejum prolongado.',
  },
  {
    palavras: ['donepezila','rivastigmina','galantamina'],
    tipo: 'alimentacao',
    titulo: 'Antidemencial · Horário',
    desc: 'Tomar à noite para reduzir efeitos colinérgicos (náusea, diarreia).',
  },
  {
    palavras: ['digoxina'],
    tipo: 'interacao',
    titulo: 'Digoxina · Janela Terapêutica Estreita',
    desc: 'Dose e horário fixos são essenciais. Nunca dobrar dose esquecida. Monitorar bradicardia.',
  },
  {
    palavras: ['amlodipino','nifedipino','verapamil'],
    tipo: 'alimentacao',
    titulo: 'Bloqueador de Canal · Toranja',
    desc: 'Evitar suco de toranja — pode potencializar o efeito hipotensor.',
  },
];

function gerarAlertas(medicamentos) {
  const nomes = medicamentos.map(m => m.nome.toLowerCase());
  const vistos = new Set();
  const resultado = [];

  for (const alerta of ALERTAS_BASE) {
    const match = alerta.palavras.some(p => nomes.some(n => n.includes(p)));
    if (match && !vistos.has(alerta.titulo)) {
      vistos.add(alerta.titulo);
      resultado.push(alerta);
    }
  }
  return resultado;
}
