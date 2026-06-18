/* VitaDose — Utilities */

// Aplicar preferências salvas (fonte + tema) em todas as páginas
(function() {
  const fontMap = { '-1': '14px', '0': '16px', '1': '18px' };
  const v = localStorage.getItem('vd_fonte') || '0';
  document.documentElement.style.fontSize = fontMap[v] || '16px';

  if (localStorage.getItem('vd_tema') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();

function hoje() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function agoraHHMM() {
  const d = new Date();
  return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
}

function minutosTotal(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function fmtDataLonga(iso) {
  const dias  = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
  const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const d = new Date(iso + 'T12:00:00');
  return `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

function iniciaisNome(nome) {
  if (!nome) return '?';
  const p = nome.trim().split(' ');
  if (p.length === 1) return p[0][0].toUpperCase();
  return (p[0][0] + p[p.length-1][0]).toUpperCase();
}

function getActivePacienteId() {
  return parseInt(localStorage.getItem('vd_active') || '0', 10);
}
function setActivePacienteId(id) {
  localStorage.setItem('vd_active', id);
}

function consentOk() {
  return localStorage.getItem('vd_consent') === '1';
}
function setConsent() {
  localStorage.setItem('vd_consent', '1');
}

let _toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

function getStockColor(med) {
  if (!med.qtdAtual || med.qtdAtual <= 0) return 'red';
  if (med.qtdAtual <= med.limiarAlerta)    return 'amber';
  return 'green';
}

function getStockPct(med) {
  if (!med.qtdCaixa) return 0;
  return Math.max(0, Math.min(100, Math.round((med.qtdAtual / med.qtdCaixa) * 100)));
}

function calcDataFim(dataInicio, duracaoDias) {
  const d = new Date(dataInicio + 'T12:00:00');
  d.setDate(d.getDate() + duracaoDias - 1); // último dia inclusivo
  return d.toISOString().slice(0, 10);
}

function diasRestantes(med) {
  const dosesPerDia = (med.horarios || []).length;
  if (!dosesPerDia || !med.qtdAtual) return 0;
  return Math.floor(med.qtdAtual / dosesPerDia);
}

/* ── Install Wall ── */
(function () {
  // Bypass em localhost (desenvolvimento)
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return;

  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    navigator.standalone === true ||
    document.referrer.startsWith('android-app://');

  const pg = location.pathname.split('/').pop() || '';
  if (standalone || ['qrcode.html', 'whatsapp-status.html'].includes(pg)) return;

  let _prompt = null;

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    _prompt = e;
    const btn = document.getElementById('vd-btn-nativo');
    if (btn) btn.style.display = 'flex';
  });

  window.addEventListener('appinstalled', () => {
    const w = document.getElementById('vd-wall');
    if (w) w.remove();
  });

  window._vdInstalar = async function () {
    if (!_prompt) return;
    _prompt.prompt();
    const { outcome } = await _prompt.userChoice;
    if (outcome === 'accepted') {
      const w = document.getElementById('vd-wall');
      if (w) w.remove();
    }
    _prompt = null;
  };

  window._vdTab = function (t) {
    ['android', 'ios'].forEach(id => {
      document.getElementById('vd-pnl-' + id).style.display = id === t ? 'block' : 'none';
      const btn = document.getElementById('vd-tab-' + id);
      btn.style.background = id === t ? '#C9A84C' : 'transparent';
      btn.style.color      = id === t ? '#0F3460' : 'rgba(240,234,214,.55)';
    });
  };

  function criarWall() {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

    const passo = (lista) => lista.map((s, i) =>
      `<div style="display:flex;gap:13px;align-items:flex-start;${i < lista.length - 1 ? 'margin-bottom:14px' : ''}">
        <div style="min-width:28px;height:28px;border-radius:50%;background:#C9A84C;color:#0F3460;font-size:.8rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px">${i + 1}</div>
        <p style="font-size:.93rem;color:#f0ead6;line-height:1.5;margin:0;padding-top:4px">${s}</p>
      </div>`
    ).join('');

    const stAndroid = [
      'Toque nos <strong>⋮</strong> (3 pontos) no canto superior direito do Chrome',
      'Toque em <strong>"Adicionar à tela inicial"</strong>',
      'Confirme tocando em <strong>"Adicionar"</strong>',
      'Pronto! Abra o VitaDose pela tela inicial do celular',
    ];
    const stIOS = [
      'Abra este link no <strong>Safari</strong> — não funciona no Chrome do iPhone',
      'Toque no ícone <strong>□↑</strong> (compartilhar) na barra inferior do Safari',
      'Role e toque em <strong>"Adicionar à Tela de Início"</strong>',
      'Pronto! Abra o VitaDose pela tela inicial do iPhone',
    ];

    const wall = document.createElement('div');
    wall.id = 'vd-wall';
    wall.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#0F3460;display:block;overflow-y:auto;-webkit-overflow-scrolling:touch;font-family:"DM Sans",sans-serif;-webkit-font-smoothing:antialiased';

    wall.innerHTML = `
      <div style="width:100%;max-width:440px;margin:0 auto;padding:44px 24px 64px;box-sizing:border-box">

        <!-- Logo -->
        <div style="text-align:center;margin-bottom:30px">
          <div style="font-size:2.6rem;margin-bottom:10px">💊</div>
          <div style="font-size:1.7rem;font-weight:800;letter-spacing:-.5px">
            <span style="color:#f0ead6">Vita</span><span style="color:#C9A84C">Dose</span>
          </div>
        </div>

        <!-- Headline emocional -->
        <div style="text-align:center;margin-bottom:22px">
          <h1 style="font-size:1.55rem;font-weight:800;color:#f0ead6;line-height:1.3;margin:0 0 12px">
            Cuide de quem você ama.<br>Sem complicação.
          </h1>
          <p style="font-size:.9rem;color:rgba(240,234,214,.7);line-height:1.6;margin:0">
            VitaDose é gratuito, sem cadastro e instala em 10 segundos — sem loja de apps.
          </p>
        </div>

        <!-- Trust bar -->
        <div style="display:flex;justify-content:center;gap:16px;background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.28);border-radius:12px;padding:13px 10px;margin-bottom:24px">
          <span style="font-size:.82rem;color:#f0ead6;font-weight:600">✅ Gratuito</span>
          <span style="font-size:.82rem;color:#f0ead6;font-weight:600">🔒 Privado</span>
          <span style="font-size:.82rem;color:#f0ead6;font-weight:600">📴 Offline</span>
        </div>

        <!-- Micro-benefícios -->
        <div style="margin-bottom:26px">
          <p style="font-size:.68rem;font-weight:700;color:rgba(240,234,214,.4);text-transform:uppercase;letter-spacing:1.2px;text-align:center;margin:0 0 12px">O que você vai ter</p>
          <div style="display:flex;flex-direction:column;gap:9px">
            <div style="display:flex;align-items:center;gap:13px;background:rgba(240,234,214,.06);border-radius:10px;padding:12px 14px">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/></svg>
              <div><p style="font-size:.88rem;color:#f0ead6;margin:0;font-weight:600">Alertas no horário certo</p><p style="font-size:.75rem;color:rgba(240,234,214,.55);margin:0">Nunca mais esqueça uma dose</p></div>
            </div>
            <div style="display:flex;align-items:center;gap:13px;background:rgba(240,234,214,.06);border-radius:10px;padding:12px 14px">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              <div><p style="font-size:.88rem;color:#f0ead6;margin:0;font-weight:600">Aviso quando o remédio acabar</p><p style="font-size:.75rem;color:rgba(240,234,214,.55);margin:0">Estoque monitorado em tempo real</p></div>
            </div>
            <div style="display:flex;align-items:center;gap:13px;background:rgba(240,234,214,.06);border-radius:10px;padding:12px 14px">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <div><p style="font-size:.88rem;color:#f0ead6;margin:0;font-weight:600">Alertas de alimentação</p><p style="font-size:.75rem;color:rgba(240,234,214,.55);margin:0">Saiba o que evitar com cada remédio</p></div>
            </div>
          </div>
        </div>

        <!-- Toggle Android / iPhone -->
        <div style="display:flex;background:rgba(240,234,214,.07);border:1px solid rgba(240,234,214,.12);border-radius:10px;padding:4px;margin-bottom:18px">
          <button id="vd-tab-android" onclick="_vdTab('android')"
            style="flex:1;border:none;padding:11px;border-radius:8px;font-size:.88rem;font-weight:700;cursor:pointer;font-family:inherit;background:${!isIOS ? '#C9A84C' : 'transparent'};color:${!isIOS ? '#0F3460' : 'rgba(240,234,214,.55)'}">
            Android
          </button>
          <button id="vd-tab-ios" onclick="_vdTab('ios')"
            style="flex:1;border:none;padding:11px;border-radius:8px;font-size:.88rem;font-weight:600;cursor:pointer;font-family:inherit;background:${isIOS ? '#C9A84C' : 'transparent'};color:${isIOS ? '#0F3460' : 'rgba(240,234,214,.55)'}">
            iPhone / iPad
          </button>
        </div>

        <!-- Painel Android -->
        <div id="vd-pnl-android" style="display:${!isIOS ? 'block' : 'none'};margin-bottom:16px">
          <button id="vd-btn-nativo" onclick="_vdInstalar()"
            style="display:none;width:100%;background:#C9A84C;color:#0F3460;border:none;padding:14px;border-radius:10px;font-size:.95rem;font-weight:700;cursor:pointer;font-family:inherit;align-items:center;justify-content:center;gap:8px;margin-bottom:14px">
            ✓ Instalar VitaDose agora
          </button>
          <div style="background:rgba(240,234,214,.06);border-radius:10px;padding:18px 16px">
            <p style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(201,168,76,.7);margin:0 0 16px">Passo a passo — Chrome</p>
            ${passo(stAndroid)}
          </div>
        </div>

        <!-- Painel iOS -->
        <div id="vd-pnl-ios" style="display:${isIOS ? 'block' : 'none'};margin-bottom:16px">
          <div style="background:rgba(240,234,214,.06);border-radius:10px;padding:18px 16px">
            <p style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(201,168,76,.7);margin:0 0 16px">Passo a passo — Safari</p>
            ${passo(stIOS)}
          </div>
        </div>

        <!-- CTA pós-instalação -->
        <button onclick="document.getElementById('vd-wall').remove()"
          style="width:100%;background:#C9A84C;color:#0F3460;border:none;padding:17px;border-radius:12px;font-size:1rem;font-weight:800;cursor:pointer;font-family:inherit;letter-spacing:.3px;box-shadow:0 4px 20px rgba(201,168,76,.3)">
          Já instalei — Abrir VitaDose →
        </button>

      </div>
    `;

    document.body.appendChild(wall);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', criarWall);
  } else {
    criarWall();
  }
})();

/* ── Trial / Paywall ── */
(function () {
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return;

  // Registrar primeira data de uso
  if (!localStorage.getItem('vd_first_use')) {
    localStorage.setItem('vd_first_use', new Date().toISOString().slice(0, 10));
  }

  const TRIAL_DIAS = 30;
  const firstUse = localStorage.getItem('vd_first_use');
  const diasUsados = Math.floor(
    (Date.now() - new Date(firstUse + 'T12:00:00').getTime()) / 86400000
  );
  const diasRestantes = Math.max(0, TRIAL_DIAS - diasUsados);

  // Licença já ativada → libera tudo
  if (localStorage.getItem('vd_licenca')) return;

  /* ── Ainda no trial: injetar banner de aviso ── */
  if (diasRestantes > 0) {
    const injetarBanner = () => {
      if (document.getElementById('vd-trial-banner')) return;
      const urgente = diasRestantes <= 5;
      const b = document.createElement('div');
      b.id = 'vd-trial-banner';
      b.style.cssText = [
        'position:fixed;bottom:68px;left:0;right:0;z-index:200',
        'max-width:430px;margin:0 auto',
        `background:${urgente ? '#DC3232' : '#C9A84C'}`,
        `color:${urgente ? '#fff' : '#0F3460'}`,
        'font-family:"DM Sans",sans-serif;font-size:.78rem;font-weight:600',
        'padding:7px 16px;display:flex;align-items:center;justify-content:space-between',
        '-webkit-font-smoothing:antialiased',
      ].join(';');
      const plural = diasRestantes !== 1;
      b.innerHTML = `
        <span>${urgente ? '⚠ ' : '⏳ '}Período gratuito: <strong>${diasRestantes} dia${plural ? 's' : ''} restante${plural ? 's' : ''}</strong></span>
        <button onclick="this.parentElement.remove()"
          style="background:none;border:none;color:inherit;font-size:1rem;cursor:pointer;padding:0 0 0 8px;line-height:1">×</button>
      `;
      document.body.appendChild(b);
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injetarBanner);
    } else {
      injetarBanner();
    }
    return;
  }

  /* ── Trial expirado: funções do paywall ── */
  // ── CONFIGURE AQUI ──────────────────────────────────────
  const VD_PIX_KEY   = 'rubineyram@gmail.com'; // sua chave PIX
  const VD_WPP_NUM   = '5596991373225';         // seu número com DDI+DDD, sem + nem espaços
  // ────────────────────────────────────────────────────────

  window._vdCopiarChavePix = function () {
    navigator.clipboard.writeText(VD_PIX_KEY);
    const btn = document.getElementById('vd-pw-btn-copiar-pix');
    btn.textContent = '✓ Copiado!';
    setTimeout(() => { btn.textContent = 'Copiar chave'; }, 2000);
  };

  window._vdAbrirWpp = function () {
    const tel   = (document.getElementById('vd-pw-tel').value || '').replace(/\D/g, '');
    const nome  = tel ? `Meu número: *${tel}*` : 'Quero ativar minha licença';
    const msg   = encodeURIComponent(`Olá! Acabei de pagar o VitaDose via PIX. ${nome}. Pode me enviar o código de ativação?`);
    window.open(`https://wa.me/${VD_WPP_NUM}?text=${msg}`, '_blank');
  };

  window._vdAtivarLicenca = async function () {
    const codigo = (document.getElementById('vd-pw-codigo').value || '').trim().toUpperCase();
    const status = document.getElementById('vd-pw-ativ-status');
    const btn    = document.getElementById('vd-pw-btn-ativar');
    if (codigo.replace(/-/g, '').length < 16) {
      status.style.color = '#DC3232';
      status.textContent = '⚠ Código incompleto — deve ter 16 caracteres';
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Verificando…';
    status.textContent = '';
    try {
      const res  = await fetch('/api/validar-licenca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo }),
      });
      if (!res.ok) throw new Error('server_error');
      const d = await res.json();
      if (d.valido) {
        localStorage.setItem('vd_licenca', codigo);
        status.style.color = '#2EB85C';
        status.textContent = '✓ Licença ativada! Redirecionando…';
        setTimeout(() => window.location.reload(), 1200);
      } else {
        status.style.color = '#DC3232';
        status.textContent = '⚠ Código inválido ou já utilizado. Verifique o e-mail.';
        btn.disabled = false;
        btn.textContent = 'Ativar Licença';
      }
    } catch {
      status.style.color = '#DC3232';
      status.textContent = '⚠ Sem conexão. Verifique a internet.';
      btn.disabled = false;
      btn.textContent = 'Ativar Licença';
    }
  };

  function criarPaywall() {
    const wall = document.createElement('div');
    wall.id = 'vd-paywall';
    wall.style.cssText = 'position:fixed;inset:0;z-index:9998;background:linear-gradient(160deg,#0F3460 0%,#0b1e3d 100%);display:flex;flex-direction:column;align-items:center;overflow-y:auto;font-family:"DM Sans",sans-serif;-webkit-font-smoothing:antialiased';

    const inp = 'width:100%;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);border-radius:8px;padding:10px 12px;color:#fff;font-size:.9rem;font-family:inherit;outline:none;margin-bottom:10px;-webkit-appearance:none;box-sizing:border-box';
    const card = 'width:calc(100% - 48px);max-width:320px;background:rgba(255,255,255,.07);border-radius:12px;padding:18px;margin-bottom:14px';
    const lbl  = 'font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin:0 0 12px';

    wall.innerHTML = `
      <div style="width:100%;background:rgba(0,0,0,.22);padding:15px 22px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0">
        <span style="font-size:1.2rem;font-weight:700;letter-spacing:-.3px">
          <span style="color:#C9A84C">Vita</span><span style="color:#fff">Dose</span>
        </span>
        <span style="font-size:.6rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(201,168,76,.6)">Período encerrado</span>
      </div>

      <div style="text-align:center;padding:26px 24px 14px;max-width:360px">
        <div style="font-size:2.4rem;margin-bottom:10px">🔒</div>
        <h1 style="font-size:1.15rem;font-weight:700;color:#fff;margin:0 0 8px;line-height:1.4">
          Seus 30 dias gratuitos<br>chegaram ao fim
        </h1>
        <p style="font-size:.84rem;color:rgba(255,255,255,.55);line-height:1.65;margin:0">
          Ative sua licença por <strong style="color:#C9A84C">R$&nbsp;5,99</strong> — pagamento único,<br>sem mensalidade, seus dados ficam no celular.
        </p>
      </div>

      <!-- Passo 1: PIX -->
      <div style="${card}">
        <p style="${lbl};color:rgba(201,168,76,.7)">Passo 1 · Pague R$ 5,99 via PIX</p>
        <p style="font-size:.78rem;color:rgba(255,255,255,.5);margin-bottom:10px">
          Copie a chave PIX abaixo e pague pelo app do seu banco:
        </p>
        <div style="display:flex;gap:8px;align-items:center;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:8px;padding:10px 14px;margin-bottom:10px">
          <span style="flex:1;font-family:'DM Mono',monospace;font-size:.88rem;color:#C9A84C;word-break:break-all">${VD_PIX_KEY}</span>
          <button id="vd-pw-btn-copiar-pix" onclick="_vdCopiarChavePix()"
            style="background:rgba(201,168,76,.2);color:#C9A84C;border:1px solid rgba(201,168,76,.3);border-radius:6px;padding:6px 12px;font-size:.76rem;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap;flex-shrink:0">
            Copiar chave
          </button>
        </div>
        <p style="font-size:.72rem;color:rgba(255,255,255,.3);text-align:center">
          Banco do Brasil · Bradesco · Nubank · Itaú · qualquer banco
        </p>
      </div>

      <!-- Passo 2: WhatsApp -->
      <div style="${card}">
        <p style="${lbl};color:rgba(201,168,76,.7)">Passo 2 · Avise pelo WhatsApp</p>
        <p style="font-size:.78rem;color:rgba(255,255,255,.5);margin-bottom:10px">
          Após pagar, informe seu telefone e clique no botão. Enviaremos seu código em minutos.
        </p>
        <label style="font-size:.76rem;color:rgba(255,255,255,.55);display:block;margin-bottom:5px">Seu telefone com DDD</label>
        <input id="vd-pw-tel" type="tel" placeholder="(11) 99999-9999" inputmode="tel" maxlength="15"
          style="${inp}" oninput="this.value=this.value.replace(/[^0-9()\s\-]/g,'')">
        <button onclick="_vdAbrirWpp()"
          style="width:100%;background:#25D366;color:#fff;border:none;padding:12px;border-radius:8px;font-size:.9rem;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Avisar pelo WhatsApp
        </button>
      </div>

      <!-- Passo 3: Ativar -->
      <div style="${card}">
        <p style="${lbl};color:rgba(255,255,255,.38)">Passo 3 · Digite o código que recebeu</p>
        <input id="vd-pw-codigo" type="text" placeholder="Ex: A3F8-B2C1-9D4E-7F02" maxlength="24"
          style="${inp};font-family:'DM Mono',monospace;letter-spacing:.06em;text-transform:uppercase"
          oninput="this.value=this.value.toUpperCase()">
        <button id="vd-pw-btn-ativar" onclick="_vdAtivarLicenca()"
          style="width:100%;background:rgba(255,255,255,.14);color:#fff;border:1px solid rgba(255,255,255,.2);padding:12px;border-radius:8px;font-size:.88rem;font-weight:700;cursor:pointer;font-family:inherit">
          Ativar Licença
        </button>
        <p id="vd-pw-ativ-status" style="font-size:.76rem;margin:8px 0 0;min-height:18px;text-align:center;color:rgba(255,255,255,.5)"></p>
      </div>

      <p style="margin:4px 0 40px;font-size:.66rem;color:rgba(255,255,255,.2);text-align:center;padding:0 24px">
        Pagamento único · Sem assinatura · Dados 100% no seu celular
      </p>
    `;

    document.body.appendChild(wall);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', criarPaywall);
  } else {
    criarPaywall();
  }
})();
