/* VitaDose — IndexedDB wrapper */
const DB_NAME    = 'vitadose';
const DB_VERSION = 4;
let _db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    if (_db) return resolve(_db);
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains('pacientes')) {
        d.createObjectStore('pacientes', { keyPath: 'id', autoIncrement: true });
      }
      if (!d.objectStoreNames.contains('medicamentos')) {
        const ms = d.createObjectStore('medicamentos', { keyPath: 'id', autoIncrement: true });
        ms.createIndex('pacienteId', 'pacienteId', { unique: false });
      }
      if (!d.objectStoreNames.contains('doses')) {
        const ds = d.createObjectStore('doses', { keyPath: 'id', autoIncrement: true });
        ds.createIndex('medData', ['medicamentoId', 'data'], { unique: false });
      }
      if (!d.objectStoreNames.contains('config')) {
        d.createObjectStore('config', { keyPath: 'key' });
      }
      if (!d.objectStoreNames.contains('diario')) {
        const di = d.createObjectStore('diario', { keyPath: 'id', autoIncrement: true });
        di.createIndex('data', 'data', { unique: false });
      }
      if (!d.objectStoreNames.contains('laboratorio')) {
        const lb = d.createObjectStore('laboratorio', { keyPath: 'id', autoIncrement: true });
        lb.createIndex('pacienteId', 'pacienteId', { unique: false });
        lb.createIndex('tipo',       'tipo',       { unique: false });
      }
    };

    req.onsuccess  = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror    = ()  => reject(req.error);
  });
}

async function dbGetConfig(key) {
  const d   = await openDB();
  return new Promise((resolve, reject) => {
    const req = d.transaction('config', 'readonly').objectStore('config').get(key);
    req.onsuccess = () => resolve(req.result ? req.result.value : null);
    req.onerror   = () => reject(req.error);
  });
}

async function dbSetConfig(key, value) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const req = d.transaction('config', 'readwrite').objectStore('config').put({ key, value });
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

async function dbGetAll(store) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const req = d.transaction(store, 'readonly').objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function dbGet(store, id) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const req = d.transaction(store, 'readonly').objectStore(store).get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function dbGetByIndex(store, idx, val) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const req = d.transaction(store, 'readonly').objectStore(store).index(idx).getAll(val);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function dbAdd(store, item) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const req = d.transaction(store, 'readwrite').objectStore(store).add(item);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function dbPut(store, item) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const req = d.transaction(store, 'readwrite').objectStore(store).put(item);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function dbDelete(store, id) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const req = d.transaction(store, 'readwrite').objectStore(store).delete(id);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

/* Export / import backup */
async function exportarBackup() {
  const [pacientes, medicamentos, doses, laboratorio, diario, config] = await Promise.all([
    dbGetAll('pacientes'), dbGetAll('medicamentos'), dbGetAll('doses'),
    dbGetAll('laboratorio'), dbGetAll('diario'), dbGetAll('config'),
  ]);
  const payload = {
    vitadose: true, v: 3, exportadoEm: new Date().toISOString(),
    pacientes, medicamentos, doses, laboratorio, diario, config,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `vitadose-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  localStorage.setItem('vd_last_backup', new Date().toISOString());
}

async function importarBackup(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  if (!data.vitadose) throw new Error('Arquivo de backup inválido.');
  const d = await openDB();
  // Restaura stores principais (limpa antes)
  await new Promise((resolve, reject) => {
    const stores = ['pacientes','medicamentos','doses','laboratorio','diario'];
    const tx = d.transaction(stores, 'readwrite');
    stores.forEach(s => tx.objectStore(s).clear());
    (data.pacientes    || []).forEach(p  => tx.objectStore('pacientes').add(p));
    (data.medicamentos || []).forEach(m  => tx.objectStore('medicamentos').add(m));
    (data.doses        || []).forEach(dv => tx.objectStore('doses').add(dv));
    (data.laboratorio  || []).forEach(l  => tx.objectStore('laboratorio').add(l));
    (data.diario       || []).forEach(di => tx.objectStore('diario').add(di));
    tx.oncomplete = resolve;
    tx.onerror    = () => reject(tx.error);
  });
  // Restaura config (put para não sobrescrever chaves inexistentes)
  if (data.config && data.config.length) {
    await new Promise((resolve, reject) => {
      const tx = d.transaction('config', 'readwrite');
      data.config.forEach(c => tx.objectStore('config').put(c));
      tx.oncomplete = resolve;
      tx.onerror    = () => reject(tx.error);
    });
  }
}

/* ── Diário Clínico ── */
async function dbGetDiario(data) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const req = d.transaction('diario', 'readonly').objectStore('diario').index('data').getAll(data);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function dbSalvarDiario(reg) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const store = d.transaction('diario', 'readwrite').objectStore('diario');
    const req   = reg.id ? store.put(reg) : store.add(reg);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function dbGetDiarioRange(inicio, fim) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const range = IDBKeyRange.bound(inicio, fim);
    const req   = d.transaction('diario', 'readonly').objectStore('diario').index('data').getAll(range);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function importarBackup(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  if (!data.vitadose) throw new Error('Arquivo de backup inválido.');
  const d  = await openDB();
  const tx = d.transaction(['pacientes','medicamentos','doses','laboratorio'], 'readwrite');
  tx.objectStore('pacientes').clear();
  tx.objectStore('medicamentos').clear();
  tx.objectStore('doses').clear();
  tx.objectStore('laboratorio').clear();
  (data.pacientes    || []).forEach(p  => tx.objectStore('pacientes').add(p));
  (data.medicamentos || []).forEach(m  => tx.objectStore('medicamentos').add(m));
  (data.doses        || []).forEach(dv => tx.objectStore('doses').add(dv));
  (data.laboratorio  || []).forEach(l  => tx.objectStore('laboratorio').add(l));
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror    = () => reject(tx.error);
  });
}
