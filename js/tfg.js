/* VitaDose — Fórmulas TFG
   Referências:
   - CKD-EPI 2021 (race-free): Inker LA et al. NEJM 2021; NKF/ASN Task Force 2021.
   - Cockcroft-Gault: padrão para cálculo de dose de medicamentos (UpToDate, Micromedex).
   - Estágios KDIGO 2022.
*/

/**
 * CKD-EPI 2021 (race-free) — recomendada pela ASN/NKF desde novembro 2021.
 * Estima TFG normalizada por superfície corporal (mL/min/1,73 m²).
 * Não usa peso — apenas creatinina + idade + sexo.
 * @param {number} creatMgDl — creatinina sérica (mg/dL)
 * @param {number} idade     — idade (anos)
 * @param {string} sexo      — 'F' | 'M'
 * @returns {number|null}
 */
function calcularCKDEPI2021(creatMgDl, idade, sexo) {
  if (!creatMgDl || creatMgDl <= 0 || !idade || idade <= 0) return null;
  const kappa  = sexo === 'F' ? 0.7  : 0.9;
  const alpha  = sexo === 'F' ? -0.241 : -0.302;
  const sexFat = sexo === 'F' ? 1.012 : 1.0;
  const ratio  = creatMgDl / kappa;
  const gfr    = 142
    * Math.pow(Math.min(ratio, 1), alpha)
    * Math.pow(Math.max(ratio, 1), -1.200)
    * Math.pow(0.9938, idade)
    * sexFat;
  return Math.round(gfr);
}

/**
 * Cockcroft-Gault — mede clearance de creatinina (mL/min, não normalizado por SC).
 * Padrão para bula e ajuste de dose de medicamentos.
 * @param {number} creatMgDl — creatinina sérica (mg/dL)
 * @param {number} idade     — idade (anos)
 * @param {string} sexo      — 'F' | 'M'
 * @param {number} pesoKg    — peso (kg)
 * @returns {number|null}
 */
function calcularCG(creatMgDl, idade, sexo, pesoKg) {
  if (!creatMgDl || creatMgDl <= 0 || !idade || idade <= 0 || !pesoKg || pesoKg <= 0) return null;
  const fator = sexo === 'F' ? 0.85 : 1.0;
  return Math.round(((140 - idade) * pesoKg * fator) / (72 * creatMgDl));
}

/**
 * Retorna ambas as estimativas de TFG.
 * @returns {{ ckdepi: number|null, cg: number|null }}
 */
function compararFormulas(creatMgDl, idade, sexo, pesoKg) {
  return {
    ckdepi: calcularCKDEPI2021(creatMgDl, idade, sexo),
    cg:     calcularCG(creatMgDl, idade, sexo, pesoKg),
  };
}
