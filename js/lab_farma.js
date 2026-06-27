/* VitaDose — Interação Fármaco-Laboratório
   Detecta padrões clínicos relevantes cruzando exames alterados com medicamentos em uso.
   Requer: statusLab() de js/laboratorio.js carregado antes deste arquivo.
*/

/*
  Estrutura de cada regra:
    exame     — ID do exame (conforme EXAMES em laboratorio.js)
    status    — 'alto' | 'baixo' | 'qualquer'
    valorMin  — (opcional) valor mínimo para disparar (valor >= valorMin)
    valorMax  — (opcional) valor máximo para disparar (valor <= valorMax)
    termos    — fragmentos do nome genérico (lowercase, sem acentos)
    risco     — 'grave' | 'moderado'
    titulo    — título curto do alerta
    desc      — explicação clínica
    conduta   — conduta recomendada
*/
const _LAB_FARMA = [

  /* ════════════════ CK (Creatina Quinase) ════════════════ */
  {
    exame:'ck', status:'alto', valorMin:400,
    termos:['sinvastatina','atorvastatina','rosuvastatina','lovastatina','pravastatina','pitavastatina','fluvastatina'],
    risco:'grave',
    titulo:'CK elevada + Estatina — Suspeita de Miopatia',
    desc:'CK ≥ 400 U/L (≥ 2× LSN) em uso de estatina pode indicar miopatia induzida. Fatores de risco: dose alta, IRC, hipotireoidismo, associação com fibratos, macrolídeos ou azólicos (inibidores de CYP3A4).',
    conduta:'Suspender a estatina temporariamente. Dosar CK seriada a cada 1–2 semanas. Se CK > 10× LSN ou sintomas musculares intensos: suspender definitivamente. Após resolução: considerar estatina hidrofílica (rosuvastatina, pravastatina) em dose menor.',
  },
  {
    exame:'ck', status:'alto', valorMin:2000,
    termos:['sinvastatina','atorvastatina','rosuvastatina','lovastatina','pravastatina','pitavastatina','fluvastatina'],
    risco:'grave',
    titulo:'CK > 2000 U/L + Estatina — Risco de Rabdomiólise',
    desc:'CK > 10× LSN em uso de estatina preenche critério de rabdomiólise. Pode evoluir para insuficiência renal aguda por mioglobinúria.',
    conduta:'Suspender estatina IMEDIATAMENTE. Hospitalização + hidratação EV intensa (meta diurese ≥ 200 mL/h). Monitorar creatinina, mioglobina urinária, eletrólitos e ECG. Contraindicada a reintrodução da estatina causadora.',
  },
  {
    exame:'ck', status:'alto', valorMin:500,
    termos:['haloperidol','clorpromazina','risperidona','clozapina','olanzapina','quetiapina','aripiprazol','ziprasidona'],
    risco:'grave',
    titulo:'CK muito elevada + Antipsicótico — Síndrome Neuroléptica Maligna',
    desc:'CK muito elevada em uso de antipsicótico pode sinalizar Síndrome Neuroléptica Maligna (SNM): rigidez muscular em "cano de chumbo", hipertermia, instabilidade autonômica e alteração de consciência. Mortalidade de 10–20% sem tratamento.',
    conduta:'Suspender antipsicótico IMEDIATAMENTE. Encaminhar ao pronto-socorro — emergência médica. Tratamento: bromocriptina 2,5 mg 3×/dia, dantrolene EV em casos graves, suporte intensivo. Não reintroduzir o mesmo agente.',
  },
  {
    exame:'ck', status:'alto', valorMin:300,
    termos:['gemfibrozila','fenofibrato','bezafibrato','ciprofibrato'],
    risco:'moderado',
    titulo:'CK elevada + Fibrato — Risco de Miopatia',
    desc:'Fibratos causam miopatia por mecanismo direto e potencializam o risco em associação com estatinas (inibição de OATP1B1/CYP3A4). CK elevada requer avaliação clínica.',
    conduta:'Avaliar sintomas musculares (dor, fraqueza, câimbras). Se CK > 5× LSN: suspender fibrato. Evitar associação fibrato + estatina quando possível; se necessária, preferir fenofibrato (menor interação com estatinas).',
  },

  /* ════════════════ ALT / AST (Transaminases) ════════════════ */
  {
    exame:'alt', status:'alto', valorMin:120,
    termos:['sinvastatina','atorvastatina','rosuvastatina','lovastatina','pravastatina','pitavastatina','fluvastatina'],
    risco:'grave',
    titulo:'ALT > 3× LSN + Estatina — Hepatotoxicidade',
    desc:'ALT > 120 U/L (> 3× LSN) em uso de estatina indica hepatotoxicidade clinicamente significativa. Risco maior com dose alta, hepatopatia prévia, álcool ou associação com outros hepatotóxicos.',
    conduta:'Suspender a estatina. Dosar ALT + AST seriada. Afastar outras causas (álcool, vírus hepatite, outros fármacos). Após normalização por ≥ 3 meses: pode tentar reintrodução com estatina diferente em dose baixa, com monitoramento hepático.',
  },
  {
    exame:'ast', status:'alto', valorMin:120,
    termos:['sinvastatina','atorvastatina','rosuvastatina','lovastatina','pravastatina','pitavastatina','fluvastatina'],
    risco:'grave',
    titulo:'AST > 3× LSN + Estatina — Hepatotoxicidade',
    desc:'AST > 120 U/L em uso de estatina sugere hepatotoxicidade. Razão AST/ALT > 2 pode indicar hepatopatia alcoólica concomitante.',
    conduta:'Suspender a estatina. Avaliar função hepática completa (bilirrubinas, TAP/INR, gama-GT). Afastar hepatite alcoólica e viral.',
  },
  {
    exame:'alt', status:'alto', valorMin:120,
    termos:['metotrexato','methotrexate'],
    risco:'grave',
    titulo:'ALT elevada + Metotrexato — Hepatotoxicidade',
    desc:'Metotrexato causa fibrose hepática cumulativa e pode causar hepatotoxicidade aguda. ALT > 3× LSN requer reavaliação imediata da dose. Risco aumentado por álcool, obesidade, DM e IRC.',
    conduta:'Suspender metotrexato temporariamente. Avaliar dose acumulada total. Suplementar ácido fólico. Após dose acumulada > 1,5 g: considerar biópsia hepática para estadiamento da fibrose.',
  },
  {
    exame:'alt', status:'alto', valorMin:120,
    termos:['nitrofurantoina'],
    risco:'grave',
    titulo:'ALT elevada + Nitrofurantoína — Hepatite Crônica',
    desc:'Nitrofurantoína em uso prolongado (≥ 6 meses, geralmente para profilaxia de ITU) pode causar hepatite crônica autoimune com fibrose progressiva.',
    conduta:'Suspender nitrofurantoína. Investigar outras causas de hepatite crônica. Para profilaxia de ITU a longo prazo: considerar troca por fosfomicina trometamol, trimetoprima ou D-manose.',
  },
  {
    exame:'alt', status:'alto', valorMin:120,
    termos:['amiodarona'],
    risco:'moderado',
    titulo:'ALT elevada + Amiodarona — Hepatotoxicidade',
    desc:'Amiodarona causa lesão hepática por acúmulo fosfolipídico no fígado. Elevação leve (< 3× LSN) é frequente e não impõe suspensão obrigatória, mas ALT > 3× LSN com sintomas requer avaliação.',
    conduta:'Se ALT > 3× LSN: reduzir dose ou suspender amiodarona (decisão cardiológica). Monitorar função hepática a cada 6 meses em uso crônico. Meia-vida da amiodarona de 40–55 dias — os efeitos persistem semanas após a suspensão.',
  },
  {
    exame:'alt', status:'alto', valorMin:200,
    termos:['paracetamol','acetaminofeno'],
    risco:'grave',
    titulo:'ALT muito elevada + Paracetamol — Hepatotoxicidade',
    desc:'ALT > 200 U/L em uso de paracetamol sugere hepatotoxicidade por superdose (> 4 g/dia) ou potencialização por álcool, jejum prolongado ou indutores do CYP2E1 (isoniazida, fenitoína). Pode evoluir para falência hepática aguda.',
    conduta:'Avaliar dose diária total incluindo combinações. Se intoxicação aguda: N-acetilcisteína EV é o antídoto (eficaz nas primeiras 8–10 horas). Suspender paracetamol e encaminhar ao PS imediatamente se sintomático.',
  },

  /* ════════════════ Potássio ════════════════ */
  {
    exame:'potassio', status:'qualquer', valorMin:5.5,
    termos:['enalapril','lisinopril','ramipril','captopril','perindopril','quinapril','benazepril','fosinopril','trandolapril'],
    risco:'grave',
    titulo:'Hipercalemia + IECA — Risco de Arritmia',
    desc:'IECAs reduzem a excreção renal de K⁺ ao inibir a aldosterona. K⁺ > 5,5 mEq/L em uso de IECA representa risco de arritmia cardíaca grave (fibrilação ventricular). Risco maior em IRC, DM e associação com poupadores de K⁺.',
    conduta:'Revisar dose do IECA. Restringir K⁺ na dieta (evitar banana, laranja, batata). K⁺ > 6,0: considerar suspensão temporária + tratamento (gluconato de cálcio, insulina + SG50%, resinas de troca catiônica).',
  },
  {
    exame:'potassio', status:'qualquer', valorMin:5.5,
    termos:['losartana','valsartana','irbesartana','candesartana','olmesartana','telmisartana','azilsartana'],
    risco:'grave',
    titulo:'Hipercalemia + BRA/Sartana — Risco de Arritmia',
    desc:'BRA/sartanas bloqueiam o receptor AT1 da angiotensina, reduzindo a aldosterona e a excreção renal de K⁺. K⁺ > 5,5 mEq/L requer avaliação urgente, especialmente em IRC.',
    conduta:'Revisar dose da sartana. Restringir K⁺ na dieta. Avaliar associação com outros hipercalemiantes (AINEs, poupadores K⁺). K⁺ > 6,0: considerar suspensão temporária + tratar hipercalemia.',
  },
  {
    exame:'potassio', status:'qualquer', valorMin:5.5,
    termos:['espironolactona','eplerenona','amilorida','triantereno'],
    risco:'grave',
    titulo:'Hipercalemia + Poupador de K⁺ — Risco de Arritmia',
    desc:'Diuréticos poupadores de potássio (antagonistas da aldosterona e inibidores dos canais de Na⁺) retêm K⁺ diretamente. Em associação com IECA/BRA, IRC ou dieta hipercalêmica, o risco de hipercalemia grave é substancial.',
    conduta:'Suspender ou reduzir dose do poupador de K⁺. Checar associação com IECA/BRA (risco aditivo). K⁺ > 6,0: emergência — gluconato de cálcio 10% EV + insulina/glicose + resinas de troca. Monitorar ECG.',
  },
  {
    exame:'potassio', status:'baixo',
    termos:['digoxina','digitoxina'],
    risco:'grave',
    titulo:'Hipocalemia + Digoxina — Toxicidade Digitálica Aumentada',
    desc:'A hipocalemia potencializa drasticamente a toxicidade da digoxina ao aumentar sua afinidade pela Na⁺/K⁺-ATPase cardíaca. K⁺ < 3,5 mEq/L + digoxina = risco elevado de intoxicação mesmo com nível sérico "normal".',
    conduta:'Repor K⁺ imediatamente (oral se K⁺ > 3,0; EV se K⁺ < 3,0). Monitorar ECG (extrassístoles, BAV, TV bidirecional). Dosar nível sérico de digoxina. Corrigir também magnésio (hipomagnesemia agrava o quadro).',
  },
  {
    exame:'potassio', status:'baixo',
    termos:['furosemida','bumetanida','torasemida'],
    risco:'moderado',
    titulo:'Hipocalemia + Diurético de Alça — Depleção de K⁺',
    desc:'Diuréticos de alça causam perda renal de K⁺ e Mg²⁺ dependente de dose. Risco aumentado com uso crônico, doses altas, diarreia e hiperaldosteronismo secundário.',
    conduta:'Repor K⁺ oral (cloreto de potássio). Suplementar também magnésio (hipomagnesemia causa resistência à reposição de K⁺). Considerar associação com espironolactona se não houver IRC. Monitorar K⁺ a cada 2–4 semanas.',
  },
  {
    exame:'potassio', status:'baixo',
    termos:['hidroclorotiazida','clortalidona','indapamida'],
    risco:'moderado',
    titulo:'Hipocalemia + Tiazídico — Depleção de K⁺',
    desc:'Tiazídicos causam perda tubular de K⁺ e Na⁺. Hipocalemia é mais frequente com clortalidona (meia-vida longa) que com hidroclorotiazida. Risco maior em doses altas.',
    conduta:'Repor K⁺ oral. Reduzir dose do tiazídico ou associar poupador de K⁺. Em HAS com gota: considerar troca por losartana (uricosúrica) ou amlodipino. Monitorar K⁺ periodicamente.',
  },
  {
    exame:'potassio', status:'baixo',
    termos:['prednisona','prednisolona','dexametasona','hidrocortisona','betametasona','metilprednisolona'],
    risco:'moderado',
    titulo:'Hipocalemia + Corticoide — Efeito Mineralocorticoide',
    desc:'Corticoides sistêmicos promovem retenção de Na⁺ e excreção de K⁺ (efeito mineralocorticoide). Hipocalemia é frequente com doses altas ou uso prolongado, especialmente com hidrocortisona e cortisona.',
    conduta:'Suplementar K⁺ oral durante o tratamento. Monitorar K⁺ a cada 2–4 semanas em uso crônico. Dexametasona tem menor efeito mineralocorticoide — considerar troca se hipocalemia persistente.',
  },

  /* ════════════════ Sódio ════════════════ */
  {
    exame:'sodio', status:'baixo',
    termos:['hidroclorotiazida','clortalidona','indapamida'],
    risco:'moderado',
    titulo:'Hiponatremia + Tiazídico — SIADH-like',
    desc:'Tiazídicos reduzem a capacidade dilucional urinária e aumentam a ADH, causando hiponatremia dilucional. Mais frequente em idosas, baixo IMC e com polifarmácia. Na⁺ < 125 mEq/L pode causar convulsões e coma.',
    conduta:'Suspender tiazídico. Restringir água livre. Na⁺ < 125 com sintomas neurológicos: emergência — NaCl hipertônico 3% EV (100–150 mL em 30 min). Para HAS: considerar amlodipino ou IECA como alternativa.',
  },
  {
    exame:'sodio', status:'baixo',
    termos:['sertralina','fluoxetina','paroxetina','escitalopram','citalopram','fluvoxamina','venlafaxina','duloxetina'],
    risco:'moderado',
    titulo:'Hiponatremia + ISRS/IRSN — Síndrome SIADH',
    desc:'ISRSs e IRSNs estimulam a liberação de ADH (vasopressina), causando retenção de água livre e hiponatremia dilucional. Risco maior em idosos, com diuréticos concomitantes, baixo peso e IRC.',
    conduta:'Suspender ou trocar o antidepressivo. Restringir água livre. Na⁺ < 125 com sintomas: emergência. Alternativas com menor risco de SIADH: mirtazapina, agomelatina ou bupropiona.',
  },
  {
    exame:'sodio', status:'baixo',
    termos:['carbamazepina','oxcarbazepina'],
    risco:'moderado',
    titulo:'Hiponatremia + Carbamazepina — SIADH',
    desc:'Carbamazepina e oxcarbazepina são causas frequentes de SIADH farmacológico, especialmente em idosos. Oxcarbazepina tem risco ainda maior que carbamazepina.',
    conduta:'Reduzir dose ou substituir por antiepiléptico alternativo (levetiracetam, lacosamida). Restringir água livre. Monitorar Na⁺ nas primeiras semanas de uso e após ajustes de dose.',
  },

  /* ════════════════ Glicemia / HbA1c ════════════════ */
  {
    exame:'glicemia', status:'alto', valorMin:200,
    termos:['prednisona','prednisolona','dexametasona','hidrocortisona','betametasona','metilprednisolona','triamcinolona'],
    risco:'moderado',
    titulo:'Hiperglicemia + Corticoide — Descontrole Glicêmico',
    desc:'Corticoides sistêmicos causam resistência periférica à insulina e estimulam a gliconeogênese. Hiperglicemia tipicamente pós-prandial (pico após dose matinal). Pode descompensar DM prévio ou revelar DM oculto.',
    conduta:'Monitorar glicemia capilar com mais frequência (2–4×/dia). Ajustar antidiabéticos: aumentar insulina prandial ou adicionar glipizida/glibenclamida às refeições principais. Insulina NPH matinal cobre bem o pico hiperglicêmico dos corticoides.',
  },
  {
    exame:'hba1c', status:'alto', valorMin:8.0,
    termos:['prednisona','prednisolona','dexametasona','hidrocortisona','metilprednisolona'],
    risco:'moderado',
    titulo:'HbA1c elevada + Corticoide Crônico — DM Descompensado',
    desc:'Uso crônico de corticoides sistêmicos pode causar descontrole persistente do DM, refletido em HbA1c > 8%. A hiperglicemia pós-prandial é mais acentuada do que a de jejum.',
    conduta:'Revisar esquema antidiabético em conjunto com endocrinologista. Avaliar redução da dose de corticoide ou troca para via inalatória/tópica quando possível. Insulina basal + prandial frequentemente necessária.',
  },

  /* ════════════════ Creatinina / TFG ════════════════ */
  {
    exame:'creatinina', status:'alto',
    termos:['ibuprofeno','naproxeno','diclofenaco','cetoprofeno','indometacina','piroxicam','meloxicam','celecoxibe','nimesulida','etoricoxibe'],
    risco:'grave',
    titulo:'Creatinina elevada + AINE — Nefrotoxicidade',
    desc:'AINEs inibem as prostaglandinas renais (PGE2, PGI2) que mantêm a perfusão glomerular em estados de baixo fluxo (ICC, hipovolemia, IRC, idosos). Podem precipitar IRA oligúrica.',
    conduta:'Suspender AINE imediatamente. Avaliar estado volêmico e causa da IR. Hidratação. Monitorar creatinina e diurese. Para dor em paciente com IR: paracetamol com monitoramento hepático.',
  },
  {
    exame:'creatinina', status:'alto',
    termos:['vancomicina','amicacina','gentamicina','tobramicina','netilmicina'],
    risco:'grave',
    titulo:'Creatinina elevada + Aminoglicosídeo/Vancomicina — Nefrotoxicidade',
    desc:'Aminoglicosídeos acumulam no córtex renal e causam necrose tubular aguda. Vancomicina em doses altas ou com TDM inadequado também é nefrotóxica. Risco sinérgico se usados em associação.',
    conduta:'Dosar nível sérico do antibiótico (vale/pico). Ajustar dose e/ou intervalo com base no TDM e na função renal atual. Hidratar adequadamente. Avaliar troca por antibiótico de menor nefrotoxicidade se clinicamente possível.',
  },

  /* ════════════════ TSH ════════════════ */
  {
    exame:'tsh', status:'alto',
    termos:['amiodarona'],
    risco:'moderado',
    titulo:'TSH elevado + Amiodarona — Hipotireoidismo Induzido',
    desc:'Amiodarona (37% de iodo por peso) inibe a conversão periférica de T4→T3 e pode causar hipotireoidismo em 10–20% dos pacientes. Mais frequente em regiões com iodo suficiente.',
    conduta:'Iniciar ou ajustar levotiroxina. Monitorar TSH a cada 6 meses em uso de amiodarona. A amiodarona geralmente não é suspensa — o hipotireoidismo é tratado com reposição hormonal.',
  },
  {
    exame:'tsh', status:'baixo',
    termos:['amiodarona'],
    risco:'moderado',
    titulo:'TSH suprimido + Amiodarona — Hipertireoidismo Induzido',
    desc:'Amiodarona pode causar tireotoxicose: Tipo 1 (iodo-induzida em bócio subjacente) ou Tipo 2 (tiroidite destrutiva). Ambas apresentam TSH suprimido com T3/T4 elevados.',
    conduta:'Solicitar T3L, T4L e anticorpos anti-TG para diferenciar os tipos. Tipo 1: tionamidas (metimazol). Tipo 2: prednisona. A suspensão da amiodarona é decisão cardiológica complexa (meia-vida de 40–55 dias).',
  },
  {
    exame:'tsh', status:'alto',
    termos:['litio','carbonato de litio','lítio'],
    risco:'moderado',
    titulo:'TSH elevado + Lítio — Hipotireoidismo',
    desc:'Lítio inibe síntese e liberação dos hormônios tireoidianos. Hipotireoidismo ocorre em 20–42% dos pacientes em uso crônico, mais frequente em mulheres e com anticorpos anti-TPO positivos.',
    conduta:'Iniciar levotiroxina. Monitorar TSH a cada 6–12 meses em uso de lítio. Pesquisar anticorpos anti-TPO se não realizado. Se bócio presente: avaliar USG de tireoide.',
  },

  /* ════════════════ INR ════════════════ */
  {
    exame:'inr', status:'qualquer', valorMin:3.0,
    termos:['varfarina','warfarina'],
    risco:'moderado',
    titulo:'INR > 3,0 + Varfarina — Anticoagulação Excessiva',
    desc:'INR acima do alvo terapêutico (geralmente 2,0–3,0) aumenta o risco de sangramento. Causas frequentes: variação na ingestão de vitamina K, interações (antibióticos, AINEs, antifúngicos), doença hepática ou alteração na adesão.',
    conduta:'Omitir 1–2 doses de varfarina. Se INR > 5: vitamina K oral 1–2,5 mg. Se sangramento ativo: vitamina K EV + CCP (concentrado de complexo protrombínico). Investigar e corrigir a causa. Monitorar INR em 24–48h.',
  },
  {
    exame:'inr', status:'qualquer', valorMax:1.8,
    termos:['varfarina','warfarina'],
    risco:'moderado',
    titulo:'INR < 1,8 + Varfarina — Anticoagulação Insuficiente',
    desc:'INR abaixo do alvo em paciente anticoagulado indica risco tromboembólico: AVC em FA, trombose em válvula mecânica ou recorrência de TVP/TEP. Causas: não adesão, dieta rica em vitamina K, indutores enzimáticos (rifampicina, carbamazepina, fenitoína).',
    conduta:'Verificar adesão e dieta. Afastar indutores de CYP2C9 (rifampicina, barbitúricos). Aumentar dose de varfarina 10–20% e repetir INR em 1 semana. Em FA de alto risco (CHADS₂-VASc ≥ 2): considerar ponte com HBPM.',
  },

  /* ════════════════ Hemoglobina ════════════════ */
  {
    exame:'hemoglobina', status:'baixo',
    termos:['ibuprofeno','naproxeno','diclofenaco','cetoprofeno','piroxicam','meloxicam','indometacina','celecoxibe','nimesulida'],
    risco:'moderado',
    titulo:'Anemia + AINE — Suspeita de Sangramento GI Crônico',
    desc:'AINEs em uso crônico causam ulceração gastroduodenal e sangramento GI oculto progressivo, levando à anemia ferropriva. O sangramento pode ocorrer sem sintomas digestivos aparentes (sangue oculto positivo).',
    conduta:'Pesquisar sangramento GI: sangue oculto nas fezes, endoscopia se indicado. Suspender AINE ou associar IBP. Tratar anemia ferropriva com sulfato ferroso oral se confirmada. Monitorar Hb após 4–8 semanas.',
  },
  {
    exame:'hemoglobina', status:'baixo',
    termos:['metotrexato'],
    risco:'grave',
    titulo:'Anemia + Metotrexato — Toxicidade Medular',
    desc:'Metotrexato inibe a di-hidrofolato redutase, podendo causar supressão da medula óssea (anemia, leucopenia, plaquetopenia). Risco aumentado com IRC, hipoalbuminemia e falta de suplementação de folato.',
    conduta:'Verificar hemograma completo com leucócitos e plaquetas. Suplementar ácido fólico 5 mg/semana (no dia após o MTX). Se pancitopenia: suspender MTX e administrar leucovorina (ácido folínico) 15 mg/6h. Monitorar hemograma mensalmente.',
  },

  /* ════════════════ LDL ════════════════ */
  {
    exame:'ldl', status:'alto', valorMin:130,
    termos:['sinvastatina','atorvastatina','rosuvastatina','lovastatina','pravastatina','pitavastatina'],
    risco:'moderado',
    titulo:'LDL elevado + Estatina — Resposta Inadequada ao Tratamento',
    desc:'LDL persistentemente acima do alvo em uso de estatina pode indicar: dose inadequada, baixa adesão, interação reduzindo eficácia (fibratos, eritromicina), hipercolesterolemia familiar ou necessidade de associação terapêutica.',
    conduta:'Verificar adesão terapêutica (checar registro de doses no app). Avaliar titulação da dose (sinvastatina 40 mg → atorvastatina 40–80 mg → rosuvastatina 20–40 mg). Considerar adição de ezetimiba (reduz LDL em 15–25% adicional).',
  },

  /* ════════════════ PCR ════════════════ */
  {
    exame:'pcr', status:'alto',
    termos:['metotrexato','leflunomida','ciclosporina','tacrolimus','azatioprina','micofenolato'],
    risco:'grave',
    titulo:'PCR elevada + Imunossupressor — Suspeita de Infecção',
    desc:'PCR elevada em paciente imunossuprimido pode representar infecção grave (bacteriana, fúngica ou oportunista). Imunossupressores mascaram os sinais clássicos de infecção (febre, leucocitose), tornando o diagnóstico mais desafiador.',
    conduta:'Avaliar clinicamente: temperatura, foco infeccioso, hemocultura, radiografia de tórax. Considerar suspensão temporária do imunossupressor em infecção grave. Iniciar antibioticoterapia empírica precoce se indicado. Encaminhar ao infectologista se quadro incerto.',
  },

];

/* ══ Verifica cruzamentos fármaco-laboratório ══════════════ */
/**
 * @param {Object} ultimosLab  — { tipo: { valor, data } } — último valor por tipo de exame
 * @param {Array}  medicamentos — lista de medicamentos ativos
 * @returns {Array}             — alertas ordenados por gravidade (grave primeiro)
 */
function verificarLabFarma(ultimosLab, medicamentos) {
  if (!ultimosLab || !Object.keys(ultimosLab).length || !medicamentos || !medicamentos.length) return [];

  const resultado = [];
  const vistos    = new Set();

  for (const regra of _LAB_FARMA) {
    const lab = ultimosLab[regra.exame];
    if (!lab) continue;

    // Filtro de status (alto/baixo/qualquer)
    if (regra.status !== 'qualquer') {
      if (typeof statusLab !== 'function') continue;
      if (statusLab(regra.exame, lab.valor) !== regra.status) continue;
    }

    // Filtros de threshold
    if (regra.valorMin != null && lab.valor < regra.valorMin) continue;
    if (regra.valorMax != null && lab.valor > regra.valorMax) continue;

    // Verifica medicamentos
    const medsEncontrados = medicamentos.filter(m => {
      const n = m.nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      return regra.termos.some(t => n.includes(t));
    });
    if (!medsEncontrados.length) continue;

    const key = `${regra.exame}|${regra.titulo}`;
    if (vistos.has(key)) continue;
    vistos.add(key);

    resultado.push({
      ...regra,
      labValor:    lab.valor,
      labData:     lab.data,
      medsTrigger: medsEncontrados.map(m => m.nome),
    });
  }

  const ordem = { grave: 0, moderado: 1 };
  return resultado.sort((a, b) => (ordem[a.risco] ?? 1) - (ordem[b.risco] ?? 1));
}
