/* VitaDose — Interações Medicamentosas e Alertas Clínicos (v2)
   Referências: Micromedex, Drugs.com Interactions, UpToDate, ANVISA
   nivel: 'grave' | 'moderado' | 'leve'
   tipo:  'interacao' (fármaco-fármaco) | 'alimentacao' (fármaco-alimento/timing)
   pares: [[palavras_med_A], [palavras_med_B]] — exige AMBOS presentes
   palavras: [...] — exige QUALQUER presente
*/

const ALERTAS_BASE = [

  /* ══════════════════════════════════════════════════
     INTERAÇÕES FÁRMACO-FÁRMACO — GRAVES
  ══════════════════════════════════════════════════ */

  {
    pares: [['varfarina','warfarina'], ['aspirina','aas','acido acetilsalicilico']],
    tipo: 'interacao', nivel: 'grave',
    titulo: 'Varfarina + AAS — Risco de Sangramento Grave',
    desc: 'A combinação aumenta drasticamente o risco de sangramento (GI, intracraniano). Evitar salvo indicação explícita (ex: FA + prótese valvar). Monitorar INR com frequência.',
  },
  {
    pares: [['varfarina','warfarina'], ['ibuprofeno','naproxeno','diclofenaco','cetoprofeno','meloxicam','piroxicam','celecoxibe','indometacina']],
    tipo: 'interacao', nivel: 'grave',
    titulo: 'Varfarina + AINE — Sangramento com Risco de Vida',
    desc: 'AINEs inibem plaquetas E potencializam o efeito anticoagulante da varfarina. Risco de hemorragia GI grave. Preferir paracetamol para analgesia.',
  },
  {
    pares: [['varfarina','warfarina'], ['ciprofloxacino','levofloxacino','norfloxacino']],
    tipo: 'interacao', nivel: 'grave',
    titulo: 'Varfarina + Fluoroquinolona — Potencialização do Anticoagulante',
    desc: 'Fluoroquinolonas inibem o metabolismo da varfarina (CYP1A2/2C9) e reduzem a flora intestinal produtora de vit. K. INR pode elevar 2-3×. Monitorar INR a cada 3-5 dias.',
  },
  {
    pares: [['varfarina','warfarina'], ['amiodarona']],
    tipo: 'interacao', nivel: 'grave',
    titulo: 'Varfarina + Amiodarona — Potencialização Intensa e Prolongada',
    desc: 'Amiodarona inibe CYP2C9 potentemente. Efeito persiste por semanas após suspensão (meia-vida da amiodarona: 40-55 dias). Reduzir dose de varfarina em 30-50% e monitorar INR semanalmente.',
  },
  {
    pares: [['varfarina','warfarina'], ['fluconazol','itraconazol','voriconazol']],
    tipo: 'interacao', nivel: 'grave',
    titulo: 'Varfarina + Antifúngico Azólico — INR Elevado',
    desc: 'Azóis inibem CYP2C9, principal via de metabolismo da varfarina. INR pode dobrar. Monitorar INR 3-5 dias após início/suspensão do antifúngico.',
  },
  {
    pares: [['varfarina','warfarina'], ['rifampicina','rifabutina']],
    tipo: 'interacao', nivel: 'grave',
    titulo: 'Varfarina + Rifampicina — Falha Anticoagulante',
    desc: 'Rifampicina é indutor potente de CYP2C9 e CYP3A4. Pode reduzir o efeito anticoagulante em até 90%. Risco de eventos tromboembólicos. Pode ser necessário dobrar a dose de varfarina.',
  },
  {
    pares: [['digoxina'], ['amiodarona']],
    tipo: 'interacao', nivel: 'grave',
    titulo: 'Digoxina + Amiodarona — Intoxicação Digitálica',
    desc: 'Amiodarona aumenta os níveis séricos de digoxina em até 70% (inibe P-gp e CYP3A4). Risco de bradicardia, bloqueio AV e arritmias graves. Reduzir dose de digoxina em 30-50%.',
  },
  {
    pares: [['digoxina'], ['verapamil','diltiazem']],
    tipo: 'interacao', nivel: 'grave',
    titulo: 'Digoxina + Verapamil/Diltiazem — Bradicardia e Bloqueio AV',
    desc: 'Verapamil e diltiazem aumentam os níveis de digoxina e têm efeito aditivo no nó AV. Risco de bradicardia grave, bloqueio cardíaco. Monitorar FC e nível sérico da digoxina.',
  },
  {
    pares: [['sildenafila','tadalafila','vardenafila'], ['isossorbida','nitroglicerina','mononitrato','nitrato']],
    tipo: 'interacao', nivel: 'grave',
    titulo: 'Inibidor da PDE-5 + Nitrato — Hipotensão Grave com Risco de Vida',
    desc: 'Combinação absolutamente contraindicada. Ambos vasodilatam por via do GMPc → hipotensão profunda, síncope e morte. Intervalo mínimo: 24h (sildenafila/vardenafila) ou 48h (tadalafila).',
  },
  {
    pares: [['tramadol'], ['fluoxetina','sertralina','paroxetina','escitalopram','citalopram','fluvoxamina','venlafaxina','duloxetina','desvenlafaxina']],
    tipo: 'interacao', nivel: 'grave',
    titulo: 'Tramadol + ISRS/IRSN — Síndrome Serotoninérgica',
    desc: 'Tramadol inibe recaptação de serotonina + atua em receptores μ. Combinação com ISRS/IRSN eleva risco de síndrome serotoninérgica: agitação, tremor, taquicardia, hipertermia, confusão.',
  },
  {
    pares: [['linezolida','moclobemida','selegilina','rasagilina'], ['fluoxetina','sertralina','paroxetina','escitalopram','venlafaxina','duloxetina','tramadol','amitriptilina','clomipramina']],
    tipo: 'interacao', nivel: 'grave',
    titulo: 'IMAO + Serotoninérgico — Síndrome Serotoninérgica Grave',
    desc: 'Combinação potencialmente fatal: hipertermia, rigidez muscular, crise hipertensiva, convulsões. Intervalo mínimo de 14 dias entre IMAO e serotoninérgicos (fluoxetina: 5 semanas).',
  },
  {
    pares: [['clopidogrel','ticagrelor','prasugrel'], ['omeprazol','esomeprazol']],
    tipo: 'interacao', nivel: 'grave',
    titulo: 'Clopidogrel + Omeprazol/Esomeprazol — Falha Antiagregante',
    desc: 'Omeprazol e esomeprazol inibem CYP2C19, enzima que ativa o clopidogrel. Reduz efeito antiagregante em até 50%. Preferir pantoprazol ou rabeprazol (menor inibição de CYP2C19).',
  },
  {
    pares: [['metotrexato'], ['ibuprofeno','naproxeno','diclofenaco','ketoprofeno','meloxicam','indometacina','celecoxibe','aspirina','aas']],
    tipo: 'interacao', nivel: 'grave',
    titulo: 'Metotrexato + AINE — Toxicidade Grave do Metotrexato',
    desc: 'AINEs inibem a excreção renal do metotrexato, elevando seus níveis até 3×. Risco de supressão medular, mucosite grave, hepatotoxicidade e óbito. Contraindicado em altas doses de MTX.',
  },
  {
    pares: [['enalapril','captopril','lisinopril','ramipril','perindopril'], ['losartana','valsartana','irbesartana','candesartana','telmisartana','olmesartana']],
    tipo: 'interacao', nivel: 'grave',
    titulo: 'IECA + BRA (Sartana) — Hipercalemia e Insuficiência Renal',
    desc: 'A dupla bloqueio do SRAA é contraindicada na maioria das situações. Risco de hipercalemia grave, hipotensão e piora aguda da função renal. Estudo ONTARGET confirmou malefício.',
  },
  {
    pares: [['enalapril','captopril','lisinopril','ramipril','losartana','valsartana'], ['espironolactona','amilorida','triantereno']],
    tipo: 'interacao', nivel: 'grave',
    titulo: 'IECA/BRA + Diurético Poupador de K⁺ — Hipercalemia',
    desc: 'Ambos elevam o potássio sérico. Combinação pode causar hipercalemia grave (K⁺ > 6,0 mEq/L) com risco de arritmia fatal. Monitorar K⁺ e função renal a cada 1-3 meses.',
  },
  {
    pares: [['morfina','oxicodona','fentanila','codeina','hidrocodona','buprenorfina'], ['diazepam','clonazepam','alprazolam','bromazepam','lorazepam','midazolam','zolpidem','zopiclona']],
    tipo: 'interacao', nivel: 'grave',
    titulo: 'Opioide + Benzodiazepínico/Hipnótico — Depressão Respiratória Fatal',
    desc: 'FDA alerta: combinação aumenta risco de depressão respiratória, sedação profunda e morte. Evitar sempre que possível. Se necessário: menor dose, menor duração, naloxona disponível.',
  },
  {
    pares: [['alopurinol'], ['azatioprina','mercaptopurina']],
    tipo: 'interacao', nivel: 'grave',
    titulo: 'Alopurinol + Azatioprina/6-Mercaptopurina — Toxicidade Grave',
    desc: 'Alopurinol inibe a xantina oxidase, impedindo a metabolização da azatioprina. Acúmulo com toxicidade hematológica grave (pancitopenia). Reduzir dose da azatioprina em 75% ou evitar combinação.',
  },
  {
    pares: [['carbamazepina','fenitoina','fenobarbital'], ['contraceptivo','anticoncepcional','etinilestradiol','levonorgestrel','desogestrel']],
    tipo: 'interacao', nivel: 'grave',
    titulo: 'Anticonvulsivante Indutor + Anticoncepcional Hormonal — Falha Contraceptiva',
    desc: 'Carbamazepina, fenitoína e fenobarbital são indutores potentes de CYP3A4. Reduzem os níveis dos hormônios contraceptivos em até 50%, podendo causar gravidez não planejada. Usar método de barreira adicional.',
  },
  {
    pares: [['rifampicina'], ['contraceptivo','anticoncepcional','etinilestradiol','levonorgestrel']],
    tipo: 'interacao', nivel: 'grave',
    titulo: 'Rifampicina + Anticoncepcional Hormonal — Falha Contraceptiva',
    desc: 'Rifampicina é o mais potente indutor enzimático conhecido. Reduz os níveis dos hormônios contraceptivos drasticamente. Usar método de barreira durante e até 1 mês após o término do tratamento.',
  },
  {
    pares: [['levofloxacino','ciprofloxacino','moxifloxacino'], ['teofilina']],
    tipo: 'interacao', nivel: 'grave',
    titulo: 'Fluoroquinolona + Teofilina — Toxicidade da Teofilina',
    desc: 'Ciprofloxacino e norfloxacino inibem CYP1A2, principal via de metabolismo da teofilina. Níveis séricos podem dobrar. Risco de convulsões e arritmias. Monitorar nível sérico da teofilina.',
  },
  {
    pares: [['lítio'], ['ibuprofeno','naproxeno','diclofenaco','indometacina','celecoxibe']],
    tipo: 'interacao', nivel: 'grave',
    titulo: 'Lítio + AINE — Toxicidade pelo Lítio',
    desc: 'AINEs inibem a excreção renal do lítio, elevando seus níveis séricos perigosamente. Risco de intoxicação: tremor grosseiro, confusão, ataxia, convulsões, coma. Monitorar lítio sérico.',
  },
  {
    pares: [['lítio'], ['enalapril','captopril','lisinopril','ramipril','losartana','valsartana']],
    tipo: 'interacao', nivel: 'grave',
    titulo: 'Lítio + IECA/BRA — Toxicidade pelo Lítio',
    desc: 'IECA e BRA reduzem a excreção renal do lítio, elevando seus níveis. Risco de intoxicação. Monitorar litemia frequentemente ao iniciar/ajustar IECA/BRA.',
  },
  {
    pares: [['eritromicina','claritromicina','azitromicina'], ['sinvastatina','lovastatina']],
    tipo: 'interacao', nivel: 'grave',
    titulo: 'Macrolídeo + Sinvastatina/Lovastatina — Miopatia Grave',
    desc: 'Eritromicina e claritromicina inibem CYP3A4, aumentando muito os níveis de sinvastatina/lovastatina. Risco de miosite grave e rabdomiólise. Suspender a estatina durante o tratamento com macrolídeo.',
  },
  {
    pares: [['metronidazol','tinidazol'], ['varfarina','warfarina']],
    tipo: 'interacao', nivel: 'grave',
    titulo: 'Metronidazol + Varfarina — Hemorragia por INR Elevado',
    desc: 'Metronidazol inibe intensamente CYP2C9 e CYP3A4. Pode elevar o INR 2-4×. Monitorar INR após 3-5 dias de uso do metronidazol e ajustar dose da varfarina.',
  },

  /* ══════════════════════════════════════════════════
     INTERAÇÕES FÁRMACO-FÁRMACO — MODERADAS
  ══════════════════════════════════════════════════ */

  {
    pares: [['atenolol','metoprolol','propranolol','carvedilol','bisoprolol','nebivolol'], ['verapamil','diltiazem']],
    tipo: 'interacao', nivel: 'moderado',
    titulo: 'Betabloqueador + Verapamil/Diltiazem — Bradicardia e Bloqueio AV',
    desc: 'Efeito aditivo no nó AV e sinusal. Risco de bradicardia grave, bloqueio AV completo e insuficiência cardíaca. Monitorar FC e PA. Evitar combinação IV; oral com cautela.',
  },
  {
    pares: [['aspirina','aas','acido acetilsalicilico'], ['enalapril','captopril','lisinopril','ramipril']],
    tipo: 'interacao', nivel: 'moderado',
    titulo: 'AAS + IECA — Redução do Efeito Cardioprotetor',
    desc: 'AAS em doses > 100 mg/dia pode atenuar o efeito vasodilatador dos IECA (via prostaglandinas). Em IC, monitorar se há piora. Doses ≤ 100 mg geralmente toleradas.',
  },
  {
    pares: [['fluoxetina','sertralina','paroxetina','escitalopram'], ['ibuprofeno','naproxeno','diclofenaco','aas','aspirina']],
    tipo: 'interacao', nivel: 'moderado',
    titulo: 'ISRS + AINE — Sangramento Gastrointestinal',
    desc: 'ISRS inibem a captação de serotonina plaquetária (reduzem agregação) e AINEs lesam a mucosa gástrica. Risco de sangramento GI duplicado. Associar protetor gástrico (IBP).',
  },
  {
    pares: [['fluconazol','itraconazol','cetoconazol'], ['sinvastatina','lovastatina','atorvastatina']],
    tipo: 'interacao', nivel: 'moderado',
    titulo: 'Antifúngico Azólico + Estatina — Risco de Miopatia',
    desc: 'Azóis inibem CYP3A4, aumentando os níveis de estatinas (especialmente sinvastatina e lovastatina). Risco de miopatia e rabdomiólise. Suspender estatina durante uso de azol, ou usar pravastatina (menos afetada).',
  },
  {
    pares: [['tramadol'], ['bupropiona']],
    tipo: 'interacao', nivel: 'moderado',
    titulo: 'Tramadol + Bupropiona — Risco de Convulsão',
    desc: 'Ambos reduzem o limiar convulsivo. A combinação aumenta significativamente o risco de crises convulsivas, especialmente em doses altas ou com fatores de risco.',
  },
  {
    pares: [['haloperidol','clorpromazina'], ['lítio']],
    tipo: 'interacao', nivel: 'moderado',
    titulo: 'Antipsicótico + Lítio — Neurotoxicidade',
    desc: 'Combinação pode causar neurotoxicidade mesmo com níveis séricos de lítio normais: confusão, tremor, febre, rigidez. Monitorar cuidadosamente.',
  },
  {
    pares: [['carbamazepina'], ['lítio']],
    tipo: 'interacao', nivel: 'moderado',
    titulo: 'Carbamazepina + Lítio — Neurotoxicidade',
    desc: 'Ambos têm efeito neurotóxico aditivo. Risco de encefalopatia mesmo com litemia dentro da faixa terapêutica. Monitorar sintomas neurológicos.',
  },
  {
    pares: [['omeprazol','esomeprazol','lansoprazol'], ['metotrexato']],
    tipo: 'interacao', nivel: 'moderado',
    titulo: 'IBP + Metotrexato — Redução da Excreção do Metotrexato',
    desc: 'IBP reduzem a excreção renal tubular do metotrexato, podendo elevar seus níveis. Relevante principalmente em altas doses de MTX. Monitorar toxicidade hematológica.',
  },
  {
    pares: [['levofloxacino','ciprofloxacino','moxifloxacino'], ['prednisona','prednisolona','dexametasona','betametasona']],
    tipo: 'interacao', nivel: 'moderado',
    titulo: 'Fluoroquinolona + Corticoide — Risco de Ruptura de Tendão',
    desc: 'A combinação aumenta o risco de tendinite e ruptura espontânea do tendão (especialmente Aquiles) em até 6×. Orientar o paciente para interromper o exercício físico intenso.',
  },
  {
    pares: [['lítio'], ['furosemida','hidroclorotiazida','clortalidona']],
    tipo: 'interacao', nivel: 'moderado',
    titulo: 'Lítio + Diurético — Retenção de Lítio e Toxicidade',
    desc: 'Diuréticos causam depleção de sódio, levando o rim a reter lítio em compensação. Pode elevar a litemia perigosamente. Monitorar lítio sérico ao iniciar/ajustar diurético.',
  },
  {
    pares: [['ciclosporina','tacrolimus'], ['sinvastatina','atorvastatina','rosuvastatina']],
    tipo: 'interacao', nivel: 'moderado',
    titulo: 'Imunossupressor + Estatina — Miopatia',
    desc: 'Ciclosporina e tacrolimus inibem CYP3A4 e P-gp, aumentando os níveis de estatinas. Risco de miopatia e rabdomiólise. Usar estatinas em dose muito baixa e com monitoramento.',
  },
  {
    pares: [['fenobarbital','fenitoina','carbamazepina'], ['varfarina','warfarina']],
    tipo: 'interacao', nivel: 'moderado',
    titulo: 'Anticonvulsivante Indutor + Varfarina — Falha Anticoagulante',
    desc: 'Esses anticonvulsivantes induzem CYP2C9 e CYP3A4, acelerando o metabolismo da varfarina. INR pode cair drasticamente. Monitorar INR ao iniciar/suspender e ajustar dose.',
  },
  {
    pares: [['furosemida','torasemida','bumetanida'], ['gentamicina','amicacina','tobramicina','vancomicina']],
    tipo: 'interacao', nivel: 'moderado',
    titulo: 'Diurético de Alça + Aminoglicosídeo/Vancomicina — Ototoxicidade',
    desc: 'Ambos são ototóxicos. A combinação aumenta o risco de perda auditiva permanente e nefrotoxicidade. Monitorar função renal e audição. Evitar uso concomitante quando possível.',
  },
  {
    pares: [['dapagliflozina','empagliflozina','canagliflozina'], ['furosemida','hidroclorotiazida']],
    tipo: 'interacao', nivel: 'moderado',
    titulo: 'iSGLT2 + Diurético — Risco de Desidratação e Hipotensão',
    desc: 'iSGLT2 têm efeito diurético osmótico. Combinação com diuréticos aumenta risco de desidratação, hipotensão ortostática e piora de função renal, especialmente em idosos.',
  },
  {
    pares: [['claritromicina','eritromicina'], ['amiodarona','sotalol','haloperidol','clorpromazina']],
    tipo: 'interacao', nivel: 'moderado',
    titulo: 'Macrolídeo + Fármaco Que Prolonga QT — Torsades de Pointes',
    desc: 'Múltiplos fármacos que prolongam o intervalo QT, quando combinados, aumentam exponencialmente o risco de taquicardia ventricular polimórfica (Torsades de Pointes). Evitar combinações.',
  },
  {
    pares: [['metformina'], ['corante iodado','contraste','iodo']],
    tipo: 'interacao', nivel: 'moderado',
    titulo: 'Metformina + Contraste Iodado — Risco de Acidose Lática',
    desc: 'Contraste iodado pode causar lesão renal aguda, impedindo a eliminação da metformina. Suspender a metformina 24-48h antes de exames com contraste e reintroduzir 48h após (se função renal normal).',
  },

  /* ══════════════════════════════════════════════════
     INTERAÇÕES FÁRMACO-FÁRMACO — LEVES / MONITORAR
  ══════════════════════════════════════════════════ */

  {
    pares: [['atorvastatina','sinvastatina','rosuvastatina'], ['diltiazem','verapamil','amiodarona']],
    tipo: 'interacao', nivel: 'leve',
    titulo: 'Estatina + Inibidor de CYP3A4 — Nível Sérico Elevado',
    desc: 'Diltiazem e verapamil inibem CYP3A4 e podem elevar os níveis de estatinas. Risco baixo de miopatia. Monitorar sintomas musculares (dor, fraqueza, urina escura).',
  },
  {
    pares: [['omeprazol','pantoprazol','lansoprazol'], ['clopidogrel']],
    tipo: 'interacao', nivel: 'leve',
    titulo: 'Pantoprazol + Clopidogrel — Interação Menor que Omeprazol',
    desc: 'Pantoprazol e rabeprazol têm menor inibição de CYP2C19 que omeprazol. Preferíveis como protetor gástrico em pacientes em uso de clopidogrel.',
  },
  {
    pares: [['digoxina'], ['furosemida','hidroclorotiazida','indapamida']],
    tipo: 'interacao', nivel: 'leve',
    titulo: 'Digoxina + Diurético — Hipocalemia Aumenta Toxicidade',
    desc: 'Diuréticos podem causar hipocalemia. Com K⁺ baixo, a digoxina tem maior afinidade pelo receptor → toxicidade digitálica mesmo em doses terapêuticas. Monitorar K⁺ sérico.',
  },
  {
    pares: [['levotiroxina'], ['metformina']],
    tipo: 'interacao', nivel: 'leve',
    titulo: 'Levotiroxina + Metformina — Redução Leve do T4',
    desc: 'Metformina pode reduzir discretamente os níveis de T4 livre. Relevante em hipotireoidismo. Monitorar TSH periodicamente.',
  },

  /* ══════════════════════════════════════════════════
     ALERTAS ALIMENTARES E DE HORÁRIO — GRAVES
  ══════════════════════════════════════════════════ */

  {
    palavras: ['sinvastatina','lovastatina','atorvastatina','rosuvastatina'],
    tipo: 'alimentacao', nivel: 'grave',
    titulo: 'Estatina + Suco de Toranja (Grapefruit)',
    desc: 'Suco de toranja inibe CYP3A4 no intestino, podendo elevar os níveis de estatinas em até 15×. Risco de miopatia e rabdomiólise. Evitar completamente durante o tratamento.',
  },
  {
    palavras: ['varfarina','warfarina'],
    tipo: 'alimentacao', nivel: 'grave',
    titulo: 'Varfarina + Vitamina K (Alimentos Verdes)',
    desc: 'Variações no consumo de couve, brócolis, espinafre e outros vegetais verdes alteram o INR de forma imprevisível. Manter consumo ESTÁVEL — não eliminar, não aumentar bruscamente.',
  },
  {
    palavras: ['varfarina','warfarina'],
    tipo: 'alimentacao', nivel: 'grave',
    titulo: 'Varfarina + Álcool — INR Imprevisível',
    desc: 'Álcool agudo inibe o metabolismo da varfarina (↑ INR). Álcool crônico induz enzimas (↓ INR). Qualquer padrão é perigoso. Evitar consumo de álcool durante anticoagulação.',
  },
  {
    palavras: ['metronidazol','tinidazol'],
    tipo: 'alimentacao', nivel: 'grave',
    titulo: 'Metronidazol/Tinidazol + Álcool — Reação Tipo Dissulfiram',
    desc: 'Qualquer quantidade de álcool causa: rubor facial intenso, náusea, vômito, taquicardia e hipotensão. Evitar álcool durante o tratamento e por 48h após a última dose.',
  },

  /* ══════════════════════════════════════════════════
     ALERTAS ALIMENTARES E DE HORÁRIO — MODERADOS
  ══════════════════════════════════════════════════ */

  {
    palavras: ['nifedipino','nifedipina','amlodipino','amlodipina','verapamil','felodipina'],
    tipo: 'alimentacao', nivel: 'moderado',
    titulo: 'Bloqueador de Canal de Cálcio + Toranja',
    desc: 'Toranja inibe CYP3A4, podendo elevar os níveis do BCC e causar hipotensão e taquicardia reflexa. Evitar suco de toranja durante o tratamento.',
  },
  {
    palavras: ['levotiroxina','tiroxina'],
    tipo: 'alimentacao', nivel: 'moderado',
    titulo: 'Levotiroxina — Tomar em Jejum',
    desc: 'Tomar 30–60 min antes do café da manhã. Cálcio, ferro, antiácidos, soja e café reduzem absorção em até 40%. Intervalo mínimo de 2h entre levotiroxina e esses alimentos/medicamentos.',
  },
  {
    palavras: ['captopril'],
    tipo: 'alimentacao', nivel: 'moderado',
    titulo: 'Captopril — Tomar em Jejum',
    desc: 'Alimentos reduzem absorção do captopril em até 40%. Tomar 1h antes das refeições para máxima eficácia. Única exceção entre os IECA — os demais podem ser tomados com alimentos.',
  },
  {
    palavras: ['metformina'],
    tipo: 'alimentacao', nivel: 'moderado',
    titulo: 'Metformina + Álcool — Risco de Acidose Lática',
    desc: 'Álcool potencializa o risco de acidose lática da metformina (inibe gliconeogênese hepática). Evitar consumo excessivo de álcool, especialmente em jejum prolongado.',
  },
  {
    palavras: ['enalapril','captopril','lisinopril','losartana','valsartana','ramipril'],
    tipo: 'alimentacao', nivel: 'moderado',
    titulo: 'IECA/BRA + Alimentos Ricos em Potássio',
    desc: 'IECA e BRA retêm potássio. Evitar excesso de banana, laranja, coco verde, abacate e sal substituto (KCl). Risco de hipercalemia, especialmente com IRC ou diuréticos poupadores de K⁺.',
  },
  {
    palavras: ['glibenclamida','glipizida','gliclazida','glimepirida','insulina'],
    tipo: 'alimentacao', nivel: 'moderado',
    titulo: 'Hipoglicemiante + Jejum / Álcool',
    desc: 'Não pular refeições. Álcool potencializa hipoglicemia (inibe gliconeogênese hepática). Em caso de hipoglicemia: 15g de glicose (3 balas/tabletes) e reavaliar em 15 min.',
  },
  {
    palavras: ['ciprofloxacino','levofloxacino','norfloxacino'],
    tipo: 'alimentacao', nivel: 'moderado',
    titulo: 'Fluoroquinolona + Laticínios / Antiácidos',
    desc: 'Cálcio (leite, iogurte), magnésio e alumínio (antiácidos) quelam as fluoroquinolonas, reduzindo absorção em até 50%. Tomar 2h antes ou 6h após esses produtos.',
  },
  {
    palavras: ['tetraciclina','doxiciclina','minociclina'],
    tipo: 'alimentacao', nivel: 'moderado',
    titulo: 'Tetraciclina + Laticínios / Fe / Ca',
    desc: 'Leite, queijo, suplementos de ferro e cálcio reduzem drasticamente a absorção das tetraciclinas. Tomar com água, 1h antes ou 2h após refeições e suplementos minerais.',
  },
  {
    palavras: ['furosemida','espironolactona','hidroclorotiazida'],
    tipo: 'alimentacao', nivel: 'moderado',
    titulo: 'Diurético — Hidratação e Eletrólitos',
    desc: 'Aumentar ingesta hídrica. Furosemida causa hipocalemia (sintomas: cãibras, fraqueza) — monitorar K⁺. Tomar pela manhã para evitar nictúria. Verificar pressão arterial regularmente.',
  },
  {
    palavras: ['bisfosfanato','alendronato','risedronato','ibandronato'],
    tipo: 'alimentacao', nivel: 'moderado',
    titulo: 'Bisfosfonato — Técnica de Administração Crítica',
    desc: 'Tomar em jejum com copo cheio de água (200 mL). Permanecer em pé por 30-60 min. Não deitar, não comer e não tomar outros medicamentos nesse período. Evita esofagite grave.',
  },

  /* ══════════════════════════════════════════════════
     ALERTAS ALIMENTARES E DE HORÁRIO — LEVES
  ══════════════════════════════════════════════════ */

  {
    palavras: ['metformina','metformina xr'],
    tipo: 'alimentacao', nivel: 'leve',
    titulo: 'Metformina — Tomar com Alimentos',
    desc: 'Tomar junto ou imediatamente após a refeição para reduzir desconforto gastrointestinal (náusea, diarreia). A formulação XR (liberação prolongada) é melhor tolerada.',
  },
  {
    palavras: ['donepezila','rivastigmina','galantamina'],
    tipo: 'alimentacao', nivel: 'leve',
    titulo: 'Antidemencial Colinérgico — Tomar à Noite',
    desc: 'Tomar à noite para reduzir efeitos colinérgicos diurnos (náusea, diarreia, cólicas). Rivastigmina em adesivo tem melhor tolerabilidade que comprimido.',
  },
  {
    palavras: ['digoxina'],
    tipo: 'alimentacao', nivel: 'leve',
    titulo: 'Digoxina — Dose e Horário Fixos',
    desc: 'Tomar sempre no mesmo horário. Nunca dobrar dose esquecida. Monitorar frequência cardíaca — sinais de toxicidade: bradicardia, náusea, visão amarelada. Alimentos ricos em fibras podem reduzir absorção.',
  },
  {
    palavras: ['losartana','valsartana','enalapril','lisinopril','ramipril'],
    tipo: 'alimentacao', nivel: 'leve',
    titulo: 'IECA/BRA — Pode Tomar com Alimentos',
    desc: 'A maioria dos IECA e BRA (exceto captopril) pode ser tomada com ou sem alimentos, sem impacto significativo na absorção. Manter horário fixo para melhor adesão.',
  },
  {
    palavras: ['amlodipina','nifedipina','anlodipino'],
    tipo: 'alimentacao', nivel: 'leve',
    titulo: 'Bloqueador de Canal de Cálcio — Monitorar Edema',
    desc: 'Edema em tornozelos é efeito comum (especialmente anlodipina). Não é sinal de piora cardíaca, mas de vasodilatação periférica. Elevar membros inferiores ajuda. Avisar médico se persistir.',
  },
];

/* ── Gerador de Alertas ─────────────────────────────────── */
function gerarAlertas(medicamentos) {
  const nomes  = medicamentos.map(m => m.nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''));
  const vistos = new Set();
  const resultado = [];

  for (const alerta of ALERTAS_BASE) {
    let match = false;

    if (alerta.pares) {
      const lado1 = alerta.pares[0].some(p => nomes.some(n => n.includes(p)));
      const lado2 = alerta.pares[1].some(p => nomes.some(n => n.includes(p)));
      match = lado1 && lado2;
    } else if (alerta.palavras) {
      match = alerta.palavras.some(p => nomes.some(n => n.includes(p)));
    }

    if (match && !vistos.has(alerta.titulo)) {
      vistos.add(alerta.titulo);
      resultado.push(alerta);
    }
  }

  // Ordenar: grave → moderado → leve
  const ordem = { grave: 0, moderado: 1, leve: 2 };
  return resultado.sort((a, b) => (ordem[a.nivel] ?? 2) - (ordem[b.nivel] ?? 2));
}
