/* VitaDose — Tabela de nomes comerciais de genéricos (mercado brasileiro) */

const _MARCAS = {
  // Cardiovascular / Hipertensão
  'losartana':            ['Cozaar', 'Losartec', 'Aradois'],
  'valsartana':           ['Diovan', 'Valsacor', 'Tareg'],
  'enalapril':            ['Renitec', 'Eupressin', 'Naprix'],
  'lisinopril':           ['Prinivil', 'Zestril', 'Lisinopril'],
  'ramipril':             ['Altace', 'Tritace', 'Ramace'],
  'captopril':            ['Capoten', 'Capoton', 'Lopirin'],
  'amlodipina':           ['Norvasc', 'Pressat', 'Anloc'],
  'nifedipino':           ['Adalat', 'Afeditab', 'Oxcord'],
  'anlodipino':           ['Norvasc', 'Pressat', 'Anloc'],
  'metoprolol':           ['Seloken', 'Lopressor', 'Betaloc'],
  'atenolol':             ['Tenormin', 'Atenopress', 'Atenol'],
  'propranolol':          ['Inderal', 'Propranolol', 'Propral'],
  'carvedilol':           ['Coreg', 'Divelol', 'Cardilol'],
  'bisoprolol':           ['Concor', 'Bisobloc', 'Cardensiel'],
  'nebivolol':            ['Nebilet', 'Nebivolol', 'Nebivol'],
  'espironolactona':      ['Aldactone', 'Spirolona', 'Aldazine'],
  'furosemida':           ['Lasix', 'Frusenex', 'Nefrex'],
  'hidroclorotiazida':    ['Clorana', 'Diclorotiazida', 'Higroton'],
  'clortalidona':         ['Hygroton', 'Chlorthalidone', 'Thalidone'],
  'indapamida':           ['Natrilix', 'Indapen', 'Indapamida'],
  'digoxina':             ['Lanoxin', 'Digacin', 'Digosinon'],
  'amiodarona':           ['Ancoron', 'Cordarone', 'Miodaron'],
  'varfarina':            ['Marevan', 'Coumadin', 'Varfarina'],
  'rivaroxabana':         ['Xarelto', 'Xarelto', 'Rivaroxabana'],
  'apixabana':            ['Eliquis', 'Apixaban', 'Apixabana'],
  'dabigatrana':          ['Pradaxa', 'Dabigatran', 'Dabigatrana'],
  'clopidogrel':          ['Plavix', 'Clopivix', 'Plagrel'],
  'ticagrelor':           ['Brilinta', 'Brilique', 'Ticagrelor'],
  'isossorbida':          ['Isordil', 'Monocordil', 'Isossorbida'],
  'nitroglicerina':       ['Nitro-Dur', 'Minitran', 'Nitronal'],
  // Colesterol / Dislipidemia
  'atorvastatina':        ['Lipitor', 'Citalor', 'Torval'],
  'sinvastatina':         ['Zocor', 'Sinvalip', 'Sinvacor'],
  'rosuvastatina':        ['Crestor', 'Rosuvastatina', 'Rosuvacor'],
  'pravastatina':         ['Pravachol', 'Pravafenix', 'Pravastatina'],
  'ezetimiba':            ['Zetia', 'Ezetimiba', 'Ezetrol'],
  'fenofibrato':          ['Tricor', 'Lipless', 'Fenofibrax'],
  // Diabetes
  'metformina':           ['Glifage', 'Glucoformin', 'Dimefor'],
  'glibenclamida':        ['Daonil', 'Euglucon', 'Glibenclamida'],
  'gliclazida':           ['Diamicron', 'Gliclazida', 'Gliclaz'],
  'glimepirida':          ['Amaryl', 'Glimepirida', 'Glimep'],
  'glipizida':            ['Minidiab', 'Glucotrol', 'Glipizida'],
  'sitagliptina':         ['Januvia', 'Tesavel', 'Sitagliptina'],
  'vildagliptina':        ['Galvus', 'Jalra', 'Vildagliptina'],
  'saxagliptina':         ['Onglyza', 'Kombiglyze', 'Saxagliptina'],
  'empagliflozina':       ['Jardiance', 'Glyxambi', 'Synjardy'],
  'dapagliflozina':       ['Forxiga', 'Farxiga', 'Dapagliflozina'],
  'canagliflozina':       ['Invokana', 'Invokamet', 'Canagliflozina'],
  'liraglutida':          ['Victoza', 'Saxenda', 'Liraglutida'],
  'semaglutida':          ['Ozempic', 'Wegovy', 'Rybelsus'],
  'insulina glargina':    ['Lantus', 'Basaglar', 'Toujeo'],
  'insulina nph':         ['Humulin N', 'Novolin N', 'Insulatard'],
  'insulina regular':     ['Humulin R', 'Novolin R', 'Novorapid'],
  'insulina aspart':      ['NovoRapid', 'Fiasp', 'NovoLog'],
  'insulina lispro':      ['Humalog', 'Admelog', 'Lyumjev'],
  // Tireoide
  'levotiroxina':         ['Puran T4', 'Euthyrox', 'Levoid'],
  // Anti-inflamatório / Analgésico
  'dipirona':             ['Novalgina', 'Anador', 'Dôrico'],
  'paracetamol':          ['Tylenol', 'Termidor', 'Parador'],
  'ibuprofeno':           ['Advil', 'Motrin', 'Alivium'],
  'naproxeno':            ['Flanax', 'Naprosyn', 'Naprox'],
  'diclofenaco':          ['Voltaren', 'Cataflam', 'Cataflan'],
  'celecoxibe':           ['Celebra', 'Celecox', 'Flexidon'],
  'meloxicam':            ['Movatec', 'Mobic', 'Melox'],
  'piroxicam':            ['Feldene', 'Piroxicam', 'Inflammox'],
  'tramadol':             ['Tramal', 'Dorless', 'Sylador'],
  'codeina':              ['Codein', 'Longtussin', 'Tylenol C'],
  'morfina':              ['MST Continus', 'Dimorf', 'MS Contin'],
  'acido acetilsalicilico': ['Aspirina', 'AAS Protect', 'Melhoral'],
  'aspirina':             ['Aspirina', 'AAS', 'Buferin'],
  // Gastrointestinal
  'omeprazol':            ['Losec', 'Omeprazol', 'Prazolex'],
  'pantoprazol':          ['Pantozol', 'Acipan', 'Pantocal'],
  'esomeprazol':          ['Nexium', 'Esomeprazol', 'Esox'],
  'lansoprazol':          ['Lanzoprol', 'Prazol', 'Ogastro'],
  'rabeprazol':           ['Pariet', 'Rabeprazol', 'Rapraz'],
  'domperidona':          ['Motilium', 'Peridon', 'Domperidona'],
  'metoclopramida':       ['Plasil', 'Vomilene', 'Clopan'],
  'ondansetrona':         ['Zofran', 'Vonau', 'Odanox'],
  'bromoprida':           ['Digesan', 'Plamet', 'Bromoprida'],
  'loperamida':           ['Imosec', 'Diasec', 'Loperamida'],
  'lactulose':            ['Lactulona', 'Normase', 'Lactulose'],
  'bisacodil':            ['Dulcolax', 'Bisalax', 'Bisacodil'],
  // Antibióticos
  'amoxicilina':          ['Amoxil', 'Flemoxin', 'Binotal'],
  'amoxicilina clavulanato': ['Clavulin', 'Augmentin', 'Clavamox'],
  'azitromicina':         ['Zithromax', 'Astro', 'Azimed'],
  'claritromicina':       ['Klaricid', 'Bioclar', 'Clarityn'],
  'ciprofloxacino':       ['Cipro', 'Ciproflox', 'Floxacin'],
  'levofloxacino':        ['Levaquin', 'Cravit', 'Tavanic'],
  'metronidazol':         ['Flagyl', 'Flazol', 'Metronidazol'],
  'nitrofurantoina':      ['Macrodantina', 'Uromax', 'Nitrofurantoina'],
  'doxiciclina':          ['Vibramycin', 'Doxiciclina', 'Doxiterm'],
  'sulfametoxazol trimethoprim': ['Bactrim', 'Infectrin', 'Sulfametrim'],
  'cefalexina':           ['Keflex', 'Cefalexina', 'Bioclass'],
  'ceftriaxona':          ['Rocefin', 'Triaxin', 'Ceftriaxona'],
  'penicilina':           ['Benzetacil', 'Pen-Ve-Oral', 'Penicilina'],
  'fluconazol':           ['Zoltec', 'Diflucan', 'Fluconal'],
  'itraconazol':          ['Sporanox', 'Itranax', 'Itraconazol'],
  'nistatina':            ['Micostatin', 'Nistatina', 'Nilstat'],
  'ivermectina':          ['Revectina', 'Stromectol', 'Ivermec'],
  // Respiratório
  'salbutamol':           ['Aerolin', 'Ventolin', 'Salbutamol'],
  'fenoterol':            ['Berotec', 'Fenoterol', 'Berotec N'],
  'formoterol':           ['Foradil', 'Fordex', 'Oxis'],
  'salmeterol':           ['Serevent', 'Salmeterol', 'Aerodur'],
  'budesonida':           ['Pulmicort', 'Busonid', 'Rhinocort'],
  'beclometasona':        ['Clenil', 'Beclasona', 'Qvar'],
  'fluticasona':          ['Flixotide', 'Fluticasona', 'Flixonase'],
  'montelucaste':         ['Singulair', 'Brondilat', 'Montelair'],
  'ipratropio':           ['Atrovent', 'Ipravent', 'Ipratropio'],
  'tiotropio':            ['Spiriva', 'Spirolut', 'Tiotropio'],
  'brometo de ipratropio': ['Atrovent', 'Ipravent', 'Combivent'],
  // Corticoides
  'prednisona':           ['Meticorten', 'Predsim', 'Prelone'],
  'prednisolona':         ['Predsim', 'Prednol', 'Millipred'],
  'dexametasona':         ['Decadron', 'Cortidex', 'Dexacort'],
  'metilprednisolona':    ['Medrol', 'Solu-Medrol', 'Depo-Medrol'],
  'hidrocortisona':       ['Solu-Cortef', 'Hidrocortisona', 'Cortef'],
  // Psiquiátrico / Neurológico
  'fluoxetina':           ['Prozac', 'Verotina', 'Eufor'],
  'sertralina':           ['Zoloft', 'Tolrest', 'Sertran'],
  'escitalopram':         ['Lexapro', 'Reconter', 'Lex'],
  'citalopram':           ['Cipramil', 'Citalopram', 'Pramil'],
  'paroxetina':           ['Aropax', 'Cebrilin', 'Pondera'],
  'venlafaxina':          ['Effexor', 'Efexor', 'Venlif'],
  'desvenlafaxina':       ['Pristiq', 'Ellefore', 'Desvenlafaxina'],
  'duloxetina':           ['Cymbalta', 'Duloren', 'Duloxetina'],
  'bupropiona':           ['Wellbutrin', 'Zyban', 'Bup'],
  'mirtazapina':          ['Remeron', 'Mirtazapina', 'Mirtaz'],
  'trazodona':            ['Donaren', 'Trazodona', 'Desyrel'],
  'amitriptilina':        ['Tryptanol', 'Amitril', 'Amitriptilina'],
  'nortriptilina':        ['Pamelor', 'Nortril', 'Nortriptilina'],
  'clonazepam':           ['Rivotril', 'Clonotril', 'Clonazepam'],
  'alprazolam':           ['Frontal', 'Altrox', 'Aprazolam'],
  'diazepam':             ['Valium', 'Dienpax', 'Diazepam'],
  'lorazepam':            ['Lorax', 'Ativan', 'Lorazepam'],
  'bromazepam':           ['Lexotan', 'Bromazepam', 'Nervium'],
  'zolpidem':             ['Stilnox', 'Hypnol', 'Zolpidem'],
  'quetiapina':           ['Seroquel', 'Queropax', 'Quetros'],
  'olanzapina':           ['Zyprexa', 'Olanzapin', 'Olpax'],
  'risperidona':          ['Risperdal', 'Risperidona', 'Zargus'],
  'aripiprazol':          ['Abilify', 'Aristada', 'Aripiprazol'],
  'haloperidol':          ['Haldol', 'Haloperidol', 'Halidol'],
  'clozapina':            ['Leponex', 'Clozapin', 'Clozapina'],
  'ziprasidona':          ['Geodon', 'Ziprasidona', 'Zeldox'],
  'lamotrigina':          ['Lamictal', 'Lamitor', 'Lamotrigina'],
  'topiramato':           ['Topamax', 'Topirax', 'Topiramato'],
  'carbamazepina':        ['Tegretol', 'Epitol', 'Carbamazepina'],
  'acido valproico':      ['Depakote', 'Depakine', 'Valpakine'],
  'valproato':            ['Depakote', 'Depakine', 'Valpakine'],
  'gabapentina':          ['Neurontin', 'Gralise', 'Gabapentina'],
  'pregabalina':          ['Lyrica', 'Pregazan', 'Pregabalina'],
  'fenitoina':            ['Epelin', 'Hidantal', 'Fenitoína'],
  'levetiracetam':        ['Keppra', 'Levetiracetam', 'Neurotam'],
  'donepezila':           ['Aricept', 'Donepezila', 'Alzena'],
  'memantina':            ['Namenda', 'Ebixa', 'Memantina'],
  'rivastigmina':         ['Exelon', 'Rivastigmina', 'Prometax'],
  'levodopa':             ['Sinemet', 'Prolopa', 'Stalevo'],
  'pramipexol':           ['Mirapex', 'Sifrol', 'Pramipexol'],
  'melatonina':           ['Circadin', 'Melatol', 'Melatonina'],
  // Outros comuns
  'colchicina':           ['Colchicina', 'Colchicum', 'Reumacide'],
  'alopurinol':           ['Zyloric', 'Alopurinol', 'Allosig'],
  'sildenafila':          ['Viagra', 'Revatio', 'Sildenafila'],
  'tadalafila':           ['Cialis', 'Adcirca', 'Tadalafila'],
  'finasterida':          ['Proscar', 'Propecia', 'Finasterida'],
  'tamsulosina':          ['Secotex', 'Uroflow', 'Tamsulosina'],
  'doxazosina':           ['Carduran', 'Doxazosina', 'Cardura'],
  'dutasterida':          ['Avodart', 'Dutasterida', 'Avidart'],
  'ferro sulfato':        ['Sulfato Ferroso', 'Noripurum', 'Ferinject'],
  'acido folico':         ['Ácido Fólico', 'Folin', 'Folacin'],
  'vitamina d':           ['Addera D3', 'Depura', 'Vitamina D3'],
  'calcio carbonato':     ['Calcichew', 'Caltrate', 'Calcitriol'],
  'vitamina b12':         ['Cianocobalamina', 'Rubranova', 'Neuroforte'],
  'acido ascorbico':      ['Vitamina C', 'Redoxon', 'Cebion'],
};

function buscarMarcas(nomeGenerico) {
  if (!nomeGenerico) return null;

  const norm = nomeGenerico
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\b\d+([.,]\d+)?\s*(mg|mcg|ml|g|ui|iu|%)(\s*\/\s*\S+)?\b/gi, '')
    .replace(/\b(potassica|sodica|cloridrato|maleato|fumarato|tartarato|base|anidro|tri-hidratada|di-hidratada|generico|retard|xr|er|sr|lp)\b/gi, '')
    .replace(/[^a-z0-9\s+]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (_MARCAS[norm]) return _MARCAS[norm];

  for (const [key, marcas] of Object.entries(_MARCAS)) {
    if (norm === key || norm.startsWith(key + ' ') || key.startsWith(norm + ' ')) {
      return marcas;
    }
  }

  const primeira = norm.split(' ')[0];
  if (primeira.length >= 5 && _MARCAS[primeira]) return _MARCAS[primeira];

  return null;
}
