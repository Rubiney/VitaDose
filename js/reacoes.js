/* VitaDose — Reações adversas mais comuns por genérico (mercado brasileiro) */

const _REACOES = {
  // Cardiovascular / Hipertensão
  'losartana':         ['Tontura', 'Hipotensão', 'Hipercalemia', 'Dispneia'],
  'valsartana':        ['Tontura', 'Hipotensão', 'Hipercalemia', 'Náusea'],
  'enalapril':         ['Tosse seca', 'Tontura', 'Hipotensão', 'Hipercalemia', 'Angioedema (raro)'],
  'lisinopril':        ['Tosse seca', 'Tontura', 'Hipotensão', 'Hipercalemia', 'Angioedema (raro)'],
  'ramipril':          ['Tosse seca', 'Tontura', 'Hipotensão', 'Hipercalemia', 'Angioedema (raro)'],
  'captopril':         ['Tosse seca', 'Tontura', 'Hipotensão', 'Hipercalemia', 'Rash cutâneo'],
  'amlodipina':        ['Edema de membros inferiores', 'Cefaleia', 'Rubor facial', 'Palpitações'],
  'anlodipino':        ['Edema de membros inferiores', 'Cefaleia', 'Rubor facial', 'Palpitações'],
  'nifedipino':        ['Edema', 'Cefaleia', 'Rubor facial', 'Taquicardia reflexa'],
  'metoprolol':        ['Bradicardia', 'Fadiga', 'Extremidades frias', 'Broncoespasmo (asmáticos)'],
  'atenolol':          ['Bradicardia', 'Fadiga', 'Extremidades frias', 'Broncoespasmo (asmáticos)'],
  'bisoprolol':        ['Bradicardia', 'Fadiga', 'Extremidades frias', 'Tontura'],
  'carvedilol':        ['Bradicardia', 'Hipotensão', 'Tontura', 'Fadiga', 'Edema'],
  'propranolol':       ['Bradicardia', 'Fadiga', 'Broncoespasmo', 'Extremidades frias', 'Pesadelos'],
  'nebivolol':         ['Bradicardia', 'Cefaleia', 'Fadiga', 'Tontura'],
  'espironolactona':   ['Hipercalemia', 'Ginecomastia', 'Poliúria', 'Irregularidade menstrual'],
  'furosemida':        ['Hipocalemia', 'Desidratação', 'Hipotensão', 'Cãibras', 'Ototoxicidade (doses altas)'],
  'hidroclorotiazida': ['Hipocalemia', 'Hiperglicemia', 'Hiperuricemia', 'Fotossensibilidade'],
  'indapamida':        ['Hipocalemia', 'Cefaleia', 'Tontura', 'Fotossensibilidade'],
  'digoxina':          ['Náusea', 'Vômito', 'Bradicardia', 'Visão amarelada/verde', 'Arritmias (intoxicação)'],
  'amiodarona':        ['Fotossensibilidade', 'Disfunção tireoidiana', 'Toxicidade pulmonar', 'Bradicardia', 'Disfunção hepática'],
  'varfarina':         ['Sangramento', 'Hematomas', 'Epistaxe', 'Interação com vitamina K (alimentos)'],
  'rivaroxabana':      ['Sangramento', 'Hematomas', 'Náusea', 'Anemia'],
  'apixabana':         ['Sangramento', 'Hematomas', 'Náusea', 'Anemia'],
  'dabigatrana':       ['Sangramento', 'Dispepsia', 'Náusea', 'Hematomas'],
  'clopidogrel':       ['Sangramento', 'Dispepsia', 'Hematomas', 'Rash cutâneo'],
  'isossorbida':       ['Cefaleia', 'Hipotensão', 'Rubor facial', 'Tontura'],
  // Colesterol
  'atorvastatina':     ['Mialgia', 'Cefaleia', 'Diarreia', 'Elevação de CPK', 'Hepatotoxicidade (raro)'],
  'sinvastatina':      ['Mialgia', 'Cefaleia', 'Diarreia', 'Elevação de CPK', 'Hepatotoxicidade (raro)'],
  'rosuvastatina':     ['Mialgia', 'Cefaleia', 'Diarreia', 'Elevação de CPK', 'Hepatotoxicidade (raro)'],
  'ezetimiba':         ['Diarreia', 'Dor abdominal', 'Cefaleia', 'Mialgia'],
  'fenofibrato':       ['Mialgia', 'Dispepsia', 'Elevação de transaminases', 'Fotossensibilidade'],
  // Diabetes
  'metformina':        ['Náusea', 'Diarreia', 'Dor abdominal', 'Gosto metálico', 'Deficiência de B12 (uso prolongado)'],
  'glibenclamida':     ['Hipoglicemia', 'Ganho de peso', 'Náusea', 'Rash cutâneo'],
  'gliclazida':        ['Hipoglicemia', 'Ganho de peso', 'Náusea', 'Cefaleia'],
  'glimepirida':       ['Hipoglicemia', 'Ganho de peso', 'Tontura', 'Náusea'],
  'sitagliptina':      ['Nasofaringite', 'Cefaleia', 'Diarreia', 'Pancreatite (raro)'],
  'vildagliptina':     ['Nasofaringite', 'Cefaleia', 'Tontura', 'Hepatotoxicidade (raro)'],
  'empagliflozina':    ['Infecção urinária', 'Candidíase genital', 'Poliúria', 'Hipotensão', 'Cetoacidose (raro)'],
  'dapagliflozina':    ['Infecção urinária', 'Candidíase genital', 'Poliúria', 'Hipotensão', 'Cetoacidose (raro)'],
  'liraglutida':       ['Náusea', 'Vômito', 'Diarreia', 'Pancreatite (raro)', 'Perda de peso'],
  'semaglutida':       ['Náusea', 'Vômito', 'Diarreia', 'Pancreatite (raro)', 'Perda de peso'],
  'insulina glargina': ['Hipoglicemia', 'Reação no local de aplicação', 'Ganho de peso', 'Lipodistrofia'],
  'insulina nph':      ['Hipoglicemia', 'Reação no local de aplicação', 'Ganho de peso', 'Lipodistrofia'],
  'insulina regular':  ['Hipoglicemia', 'Reação no local de aplicação', 'Ganho de peso', 'Edema'],
  // Tireoide
  'levotiroxina':      ['Taquicardia', 'Palpitações', 'Insônia', 'Tremor', 'Perda de peso (superdose)'],
  // Analgésico / Anti-inflamatório
  'dipirona':          ['Agranulocitose (raro)', 'Hipotensão (IV)', 'Reação alérgica', 'Náusea'],
  'paracetamol':       ['Hepatotoxicidade (superdose)', 'Reação alérgica (raro)', 'Náusea'],
  'ibuprofeno':        ['Dispepsia', 'Úlcera gástrica', 'Retenção hídrica', 'Nefrotoxicidade', 'Hipertensão'],
  'naproxeno':         ['Dispepsia', 'Úlcera gástrica', 'Cefaleia', 'Retenção hídrica', 'Nefrotoxicidade'],
  'diclofenaco':       ['Dispepsia', 'Úlcera gástrica', 'Elevação de transaminases', 'Retenção hídrica'],
  'celecoxibe':        ['Dispepsia', 'Cefaleia', 'Risco cardiovascular aumentado', 'Edema'],
  'meloxicam':         ['Dispepsia', 'Cefaleia', 'Edema', 'Nefrotoxicidade'],
  'tramadol':          ['Náusea', 'Vômito', 'Tontura', 'Constipação', 'Sonolência', 'Risco de dependência'],
  'morfina':           ['Náusea', 'Constipação', 'Sonolência', 'Depressão respiratória', 'Risco de dependência'],
  'codeina':           ['Náusea', 'Constipação', 'Sonolência', 'Tontura', 'Risco de dependência'],
  'acido acetilsalicilico': ['Dispepsia', 'Sangramento gástrico', 'Broncoespasmo (asmáticos)', 'Zumbido (altas doses)'],
  // Gastrointestinal
  'omeprazol':         ['Cefaleia', 'Diarreia', 'Deficiência de Mg e B12 (uso prolongado)', 'Infecção por C. difficile (raro)'],
  'pantoprazol':       ['Cefaleia', 'Diarreia', 'Deficiência de Mg e B12 (uso prolongado)', 'Náusea'],
  'esomeprazol':       ['Cefaleia', 'Diarreia', 'Deficiência de Mg e B12 (uso prolongado)', 'Náusea'],
  'lansoprazol':       ['Cefaleia', 'Diarreia', 'Deficiência de Mg e B12 (uso prolongado)', 'Náusea'],
  'domperidona':       ['Galactorreia', 'Prolongamento QT (raro)', 'Cefaleia', 'Boca seca'],
  'metoclopramida':    ['Sonolência', 'Discinesia tardia (uso prolongado)', 'Galactorreia', 'Inquietação'],
  'ondansetrona':      ['Cefaleia', 'Constipação', 'Prolongamento QT', 'Tontura'],
  'loperamida':        ['Constipação', 'Dor abdominal', 'Náusea', 'Tontura'],
  // Antibióticos
  'amoxicilina':       ['Rash cutâneo', 'Diarreia', 'Náusea', 'Candidíase oral/vaginal', 'Reação alérgica'],
  'amoxicilina clavulanato': ['Diarreia', 'Náusea', 'Rash cutâneo', 'Candidíase', 'Hepatotoxicidade (raro)'],
  'azitromicina':      ['Diarreia', 'Náusea', 'Dor abdominal', 'Prolongamento QT', 'Candidíase'],
  'claritromicina':    ['Gosto metálico', 'Diarreia', 'Náusea', 'Prolongamento QT', 'Hepatotoxicidade (raro)'],
  'ciprofloxacino':    ['Tendinite/ruptura de tendão (raro)', 'Fotossensibilidade', 'Náusea', 'Convulsões (raro)', 'Diarreia'],
  'levofloxacino':     ['Tendinite/ruptura de tendão (raro)', 'Fotossensibilidade', 'Náusea', 'Prolongamento QT', 'Tontura'],
  'metronidazol':      ['Gosto metálico', 'Náusea', 'Efeito Antabuse com álcool', 'Neurotoxicidade (altas doses)'],
  'nitrofurantoina':   ['Náusea', 'Coloração amarela da urina', 'Pneumonite (uso prolongado)', 'Neuropatia (raro)'],
  'doxiciclina':       ['Fotossensibilidade', 'Dispepsia', 'Candidíase', 'Descoloração dentária (crianças)'],
  'cefalexina':        ['Diarreia', 'Náusea', 'Rash cutâneo', 'Candidíase', 'Reação alérgica cruzada (penicilina)'],
  'fluconazol':        ['Náusea', 'Cefaleia', 'Hepatotoxicidade (uso prolongado)', 'Rash', 'Prolongamento QT'],
  'ivermectina':       ['Tontura', 'Náusea', 'Prurido', 'Reação de Mazzotti (em parasitoses)', 'Cefaleia'],
  // Respiratório
  'salbutamol':        ['Taquicardia', 'Tremor', 'Hipocalemia (doses altas)', 'Cefaleia', 'Inquietação'],
  'formoterol':        ['Taquicardia', 'Tremor', 'Cãibras', 'Cefaleia'],
  'salmeterol':        ['Taquicardia', 'Tremor', 'Cefaleia', 'Cãibras'],
  'budesonida':        ['Candidíase oral', 'Rouquidão', 'Irritação faríngea', 'Supressão adrenal (doses altas)'],
  'beclometasona':     ['Candidíase oral', 'Rouquidão', 'Irritação faríngea', 'Supressão adrenal (doses altas)'],
  'fluticasona':       ['Candidíase oral', 'Rouquidão', 'Irritação faríngea', 'Supressão adrenal (doses altas)'],
  'montelucaste':      ['Cefaleia', 'Distúrbios do sono', 'Alterações de comportamento (raro)', 'Rinite'],
  'ipratropio':        ['Boca seca', 'Retenção urinária', 'Constipação', 'Visão turva (contato olhos)'],
  'tiotropio':         ['Boca seca', 'Retenção urinária', 'Constipação', 'Taquicardia'],
  // Corticoides
  'prednisona':        ['Hiperglicemia', 'Osteoporose (uso prolongado)', 'Imunossupressão', 'Ganho de peso', 'Insônia'],
  'prednisolona':      ['Hiperglicemia', 'Osteoporose (uso prolongado)', 'Imunossupressão', 'Ganho de peso', 'Insônia'],
  'dexametasona':      ['Hiperglicemia', 'Osteoporose (uso prolongado)', 'Imunossupressão', 'Retenção hídrica', 'Insônia'],
  'metilprednisolona': ['Hiperglicemia', 'Osteoporose (uso prolongado)', 'Imunossupressão', 'Ganho de peso', 'Insônia'],
  // Psiquiátrico / Neurológico
  'fluoxetina':        ['Náusea', 'Insônia', 'Disfunção sexual', 'Cefaleia', 'Síndrome de descontinuação'],
  'sertralina':        ['Náusea', 'Insônia', 'Disfunção sexual', 'Diarreia', 'Síndrome de descontinuação'],
  'escitalopram':      ['Náusea', 'Insônia', 'Disfunção sexual', 'Cefaleia', 'Síndrome de descontinuação'],
  'citalopram':        ['Náusea', 'Insônia', 'Disfunção sexual', 'Prolongamento QT', 'Síndrome de descontinuação'],
  'paroxetina':        ['Náusea', 'Sonolência', 'Disfunção sexual', 'Ganho de peso', 'Síndrome de descontinuação grave'],
  'venlafaxina':       ['Náusea', 'Sudorese', 'Hipertensão', 'Disfunção sexual', 'Síndrome de descontinuação grave'],
  'duloxetina':        ['Náusea', 'Boca seca', 'Sudorese', 'Insônia', 'Disfunção sexual'],
  'bupropiona':        ['Insônia', 'Boca seca', 'Cefaleia', 'Convulsões (risco aumentado)', 'Aumento de pressão'],
  'mirtazapina':       ['Sonolência', 'Ganho de peso', 'Aumento do apetite', 'Boca seca', 'Tontura'],
  'trazodona':         ['Sonolência', 'Tontura', 'Boca seca', 'Hipotensão ortostática', 'Priapismo (raro)'],
  'amitriptilina':     ['Boca seca', 'Constipação', 'Retenção urinária', 'Sonolência', 'Arritmias (superdose)'],
  'nortriptilina':     ['Boca seca', 'Constipação', 'Sonolência', 'Hipotensão ortostática', 'Arritmias (superdose)'],
  'clonazepam':        ['Sonolência', 'Dependência', 'Amnésia', 'Ataxia', 'Depressão respiratória (superdose)'],
  'alprazolam':        ['Sonolência', 'Dependência', 'Amnésia', 'Tontura', 'Depressão respiratória (superdose)'],
  'diazepam':          ['Sonolência', 'Dependência', 'Amnésia', 'Ataxia', 'Depressão respiratória (superdose)'],
  'lorazepam':         ['Sonolência', 'Dependência', 'Amnésia', 'Tontura', 'Depressão respiratória (superdose)'],
  'zolpidem':          ['Sonolência residual', 'Dependência', 'Amnésia', 'Comportamentos complexos do sono', 'Tontura'],
  'quetiapina':        ['Sonolência', 'Ganho de peso', 'Hiperglicemia', 'Hipotensão ortostática', 'Prolongamento QT'],
  'olanzapina':        ['Ganho de peso', 'Hiperglicemia', 'Sonolência', 'Hipotensão', 'Dislipidemia'],
  'risperidona':       ['Efeitos extrapiramidais', 'Hiperprolactinemia', 'Ganho de peso', 'Insônia', 'Prolongamento QT'],
  'aripiprazol':       ['Acatisia', 'Cefaleia', 'Insônia', 'Náusea', 'Tontura'],
  'haloperidol':       ['Efeitos extrapiramidais', 'Discinesia tardia', 'Sonolência', 'Prolongamento QT', 'Galactorreia'],
  'lamotrigina':       ['Rash cutâneo (Stevens-Johnson raro)', 'Tontura', 'Cefaleia', 'Diplopia', 'Náusea'],
  'topiramato':        ['Tontura', 'Lentidão cognitiva', 'Perda de peso', 'Parestesias', 'Nefrolitíase'],
  'carbamazepina':     ['Tontura', 'Diplopia', 'Hiponatremia', 'Rash (Stevens-Johnson raro)', 'Agranulocitose (raro)'],
  'acido valproico':   ['Ganho de peso', 'Tremor', 'Queda de cabelo', 'Hepatotoxicidade', 'Teratogenicidade'],
  'valproato':         ['Ganho de peso', 'Tremor', 'Queda de cabelo', 'Hepatotoxicidade', 'Teratogenicidade'],
  'gabapentina':       ['Tontura', 'Sonolência', 'Edema', 'Ganho de peso', 'Ataxia'],
  'pregabalina':       ['Tontura', 'Sonolência', 'Edema', 'Ganho de peso', 'Risco de dependência'],
  'levetiracetam':     ['Irritabilidade', 'Sonolência', 'Cefaleia', 'Tontura', 'Alterações de humor'],
  'fenitoina':         ['Hiperplasia gengival', 'Ataxia', 'Nistagmo', 'Rash (Stevens-Johnson raro)', 'Hepatotoxicidade'],
  'donepezila':        ['Náusea', 'Diarreia', 'Insônia', 'Cãibras musculares', 'Bradicardia'],
  'memantina':         ['Tontura', 'Cefaleia', 'Constipação', 'Confusão (início)', 'Sonolência'],
  'levodopa':          ['Náusea', 'Discinesias', 'Hipotensão ortostática', 'Psicose (uso prolongado)', 'Flutuações motoras'],
  'pramipexol':        ['Sonolência', 'Náusea', 'Hipotensão ortostática', 'Ataques de sono', 'Comportamentos compulsivos'],
  // Outros
  'alopurinol':        ['Rash cutâneo (Stevens-Johnson raro)', 'Síndrome de hipersensibilidade', 'Náusea', 'Elevação de transaminases'],
  'colchicina':        ['Diarreia', 'Náusea', 'Mialgia', 'Supressão medular (superdose)', 'Neuropatia (uso prolongado)'],
  'sildenafila':       ['Cefaleia', 'Rubor facial', 'Visão azulada', 'Hipotensão', 'Priapismo (raro)'],
  'tadalafila':        ['Cefaleia', 'Dor lombar', 'Dispepsia', 'Hipotensão', 'Mialgia'],
  'finasterida':       ['Disfunção erétil', 'Diminuição da libido', 'Ginecomastia', 'Depressão (raro)'],
  'ferro sulfato':     ['Constipação', 'Náusea', 'Escurecimento das fezes', 'Dor abdominal', 'Irritação gástrica'],
  'vitamina d':        ['Hipercalcemia (superdose)', 'Náusea (superdose)', 'Hipercalciúria (superdose)'],
};

function buscarReacoes(nomeGenerico) {
  if (!nomeGenerico) return null;

  const norm = nomeGenerico
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\b\d+([.,]\d+)?\s*(mg|mcg|ml|g|ui|iu|%)(\s*\/\s*\S+)?\b/gi, '')
    .replace(/\b(potassica|sodica|cloridrato|maleato|fumarato|tartarato|base|anidro|tri-hidratada|di-hidratada|generico|retard|xr|er|sr|lp)\b/gi, '')
    .replace(/[^a-z0-9\s+]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (_REACOES[norm]) return _REACOES[norm];

  for (const [key, reacoes] of Object.entries(_REACOES)) {
    if (norm === key || norm.startsWith(key + ' ') || key.startsWith(norm + ' ')) {
      return reacoes;
    }
  }

  const primeira = norm.split(' ')[0];
  if (primeira.length >= 5 && _REACOES[primeira]) return _REACOES[primeira];

  return null;
}
