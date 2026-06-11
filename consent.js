/* Finavio Cookie-Consent — TTDSG §25 / DSGVO konform
 *
 * Anforderungen erfüllt:
 *  - Banner erscheint vor Setzen nicht notwendiger Cookies / Laden von Tracking-Tools
 *  - "Akzeptieren" und "Ablehnen" sind gleich prominent (BGH I ZR 7/16 + I ZR 186/17)
 *  - Granulare Einwilligung pro Kategorie
 *  - Keine vorab gesetzten Häkchen (außer "Notwendig")
 *  - Einwilligung jederzeit widerrufbar (Floating-Button + Link aus Datenschutz)
 *  - Speicherung: localStorage (kein Cookie nötig, kein Drittland-Transfer)
 *  - Tracking wird erst NACH Klick auf "Akzeptieren" geladen
 *
 * Einbindung in Tracking-Tools (Beispiel):
 *   window.addEventListener('fvConsentChanged', (e) => {
 *     if (e.detail.marketing) { // Meta-Pixel laden ... }
 *     if (e.detail.statistics) { // GA laden ... }
 *   });
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'fv_consent_v1';
  var CONSENT_VERSION = 1;

  function readConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data.version !== CONSENT_VERSION) return null;
      return data;
    } catch (e) { return null; }
  }

  function writeConsent(values) {
    var data = {
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      necessary: true,
      statistics: !!values.statistics,
      marketing: !!values.marketing
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
    dispatchConsent(data);
    return data;
  }

  function dispatchConsent(data) {
    try {
      window.dispatchEvent(new CustomEvent('fvConsentChanged', { detail: data }));
    } catch (e) {}
  }

  function injectStyles() {
    if (document.getElementById('fv-consent-styles')) return;
    var css = ''
      + '.fv-cc-banner,.fv-cc-modal{font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;color:#1a1a1a;}'
      + '.fv-cc-banner *,.fv-cc-modal *{box-sizing:border-box;}'
      + '.fv-cc-banner{position:fixed;left:16px;right:16px;bottom:16px;background:#fff;border:1px solid #e6e6e6;'
      + 'border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.12);padding:1.25rem 1.5rem;z-index:99999;'
      + 'max-width:980px;margin:0 auto;animation:fv-cc-up .4s ease-out;}'
      + '@keyframes fv-cc-up{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}'
      + '.fv-cc-banner h3{font-family:Sora,Inter,sans-serif;font-size:1.05rem;font-weight:700;margin:0 0 .35rem 0;}'
      + '.fv-cc-banner p{font-size:.9rem;line-height:1.55;margin:0 0 .9rem 0;color:#444;}'
      + '.fv-cc-banner a{color:#0E4F12;text-decoration:underline;font-weight:500;}'
      + '.fv-cc-actions{display:flex;flex-wrap:wrap;gap:.6rem;}'
      + '.fv-cc-btn{flex:1 1 auto;min-width:140px;padding:.75rem 1.25rem;border-radius:50px;font-size:.9rem;'
      + 'font-weight:600;cursor:pointer;border:1px solid #0E4F12;background:#fff;color:#0E4F12;'
      + 'transition:transform .15s ease,background .15s ease;font-family:inherit;}'
      + '.fv-cc-btn:hover{transform:translateY(-1px);}'
      + '.fv-cc-btn.fv-cc-primary{background:#0E4F12;color:#fff;}'
      + '.fv-cc-btn.fv-cc-primary:hover{background:#0a3d0e;}'
      + '.fv-cc-btn.fv-cc-link{border-color:transparent;background:transparent;color:#666;text-decoration:underline;flex:0 0 auto;min-width:0;padding:.75rem .5rem;}'
      + '.fv-cc-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:100000;display:flex;align-items:center;justify-content:center;padding:1rem;}'
      + '.fv-cc-modal{background:#fff;border-radius:16px;max-width:560px;width:100%;max-height:90vh;overflow-y:auto;padding:1.75rem;}'
      + '.fv-cc-modal h3{font-family:Sora,Inter,sans-serif;font-size:1.3rem;font-weight:800;margin:0 0 .5rem 0;}'
      + '.fv-cc-modal>p{font-size:.92rem;line-height:1.6;color:#444;margin:0 0 1.25rem 0;}'
      + '.fv-cc-cat{border:1px solid #eee;border-radius:12px;padding:1rem 1.1rem;margin-bottom:.75rem;background:#fafafa;}'
      + '.fv-cc-cat-head{display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-bottom:.4rem;}'
      + '.fv-cc-cat-head strong{font-size:.98rem;color:#000;}'
      + '.fv-cc-cat p{font-size:.85rem;line-height:1.55;color:#555;margin:0;}'
      + '.fv-cc-switch{position:relative;display:inline-block;width:42px;height:24px;flex-shrink:0;}'
      + '.fv-cc-switch input{opacity:0;width:0;height:0;}'
      + '.fv-cc-slider{position:absolute;cursor:pointer;inset:0;background:#ccc;border-radius:24px;transition:.2s;}'
      + '.fv-cc-slider:before{content:"";position:absolute;height:18px;width:18px;left:3px;top:3px;background:#fff;border-radius:50%;transition:.2s;}'
      + '.fv-cc-switch input:checked+.fv-cc-slider{background:#0E4F12;}'
      + '.fv-cc-switch input:checked+.fv-cc-slider:before{transform:translateX(18px);}'
      + '.fv-cc-switch input:disabled+.fv-cc-slider{background:#0E4F12;opacity:.55;cursor:not-allowed;}'
      + '.fv-cc-modal-actions{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:1.25rem;}'
      + '.fv-cc-fab{position:fixed;left:16px;bottom:16px;width:42px;height:42px;border-radius:50%;background:#fff;border:1px solid #ddd;'
      + 'box-shadow:0 4px 12px rgba(0,0,0,.1);cursor:pointer;z-index:9998;display:flex;align-items:center;justify-content:center;'
      + 'font-size:1.1rem;line-height:1;padding:0;color:#0E4F12;transition:transform .15s ease;}'
      + '.fv-cc-fab:hover{transform:scale(1.08);}'
      + '@media (max-width:640px){'
      + '.fv-cc-banner{left:8px;right:8px;bottom:8px;padding:1rem 1.1rem;}'
      + '.fv-cc-btn{flex:1 1 100%;}'
      + '.fv-cc-btn.fv-cc-link{flex:1 1 100%;}'
      + '.fv-cc-modal{padding:1.25rem;}'
      + '}';
    var style = document.createElement('style');
    style.id = 'fv-consent-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function buildBanner() {
    var banner = document.createElement('div');
    banner.className = 'fv-cc-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie-Einstellungen');
    banner.innerHTML = ''
      + '<h3>Cookies & Datenschutz</h3>'
      + '<p>Wir nutzen Cookies und vergleichbare Technologien, um unsere Website zu betreiben sowie – mit deiner Einwilligung – Statistik- und Marketing-Tools einzusetzen (z.&nbsp;B. Meta-Pixel, Google&nbsp;Analytics, TikTok&nbsp;Pixel). Dabei können Daten in Drittländer (z.&nbsp;B. USA) übertragen werden. Du kannst deine Einwilligung jederzeit in der <a href="datenschutz.html">Datenschutzerklärung</a> widerrufen. Weitere Infos im <a href="impressum.html">Impressum</a>.</p>'
      + '<div class="fv-cc-actions">'
      + '<button type="button" class="fv-cc-btn fv-cc-primary" data-fv-cc="accept">Alle akzeptieren</button>'
      + '<button type="button" class="fv-cc-btn" data-fv-cc="reject">Alle ablehnen</button>'
      + '<button type="button" class="fv-cc-btn fv-cc-link" data-fv-cc="settings">Einstellungen</button>'
      + '</div>';
    return banner;
  }

  function buildModal(current) {
    var statsChecked = current && current.statistics ? 'checked' : '';
    var mktChecked = current && current.marketing ? 'checked' : '';
    var overlay = document.createElement('div');
    overlay.className = 'fv-cc-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = ''
      + '<div class="fv-cc-modal">'
      + '<h3>Datenschutz-Einstellungen</h3>'
      + '<p>Bitte wähle, welche Kategorien du erlauben möchtest. Nicht notwendige Tools laden wir erst nach deiner Zustimmung. Details findest du in unserer <a href="datenschutz.html">Datenschutzerklärung</a>.</p>'

      + '<div class="fv-cc-cat">'
      + '<div class="fv-cc-cat-head"><strong>Notwendig</strong>'
      + '<label class="fv-cc-switch"><input type="checkbox" checked disabled><span class="fv-cc-slider"></span></label>'
      + '</div>'
      + '<p>Diese Cookies sind technisch erforderlich, damit die Website grundlegend funktioniert (z.&nbsp;B. Speicherung deiner Cookie-Auswahl). Sie können nicht deaktiviert werden. Rechtsgrundlage: § 25 Abs. 2 TTDSG.</p>'
      + '</div>'

      + '<div class="fv-cc-cat">'
      + '<div class="fv-cc-cat-head"><strong>Statistik</strong>'
      + '<label class="fv-cc-switch"><input type="checkbox" data-fv-cat="statistics" ' + statsChecked + '><span class="fv-cc-slider"></span></label>'
      + '</div>'
      + '<p>Anonymisierte Reichweitenmessung mit Google&nbsp;Analytics zur Verbesserung der Inhalte. Daten können in die USA übertragen werden. Rechtsgrundlage: Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;a DSGVO.</p>'
      + '</div>'

      + '<div class="fv-cc-cat">'
      + '<div class="fv-cc-cat-head"><strong>Marketing</strong>'
      + '<label class="fv-cc-switch"><input type="checkbox" data-fv-cat="marketing" ' + mktChecked + '><span class="fv-cc-slider"></span></label>'
      + '</div>'
      + '<p>Werbe- und Retargeting-Tools (Meta-Pixel, Google&nbsp;Ads, TikTok-Pixel, YouTube&nbsp;Ads). Diese messen den Erfolg von Werbeanzeigen und bilden Zielgruppen. Daten werden teilweise in die USA übertragen. Rechtsgrundlage: Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;a DSGVO.</p>'
      + '</div>'

      + '<div class="fv-cc-modal-actions">'
      + '<button type="button" class="fv-cc-btn fv-cc-primary" data-fv-cc="save">Auswahl speichern</button>'
      + '<button type="button" class="fv-cc-btn" data-fv-cc="accept">Alle akzeptieren</button>'
      + '<button type="button" class="fv-cc-btn" data-fv-cc="reject">Alle ablehnen</button>'
      + '</div>'

      + '</div>';
    return overlay;
  }

  function buildFab() {
    var fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'fv-cc-fab';
    fab.setAttribute('aria-label', 'Cookie-Einstellungen öffnen');
    fab.title = 'Cookie-Einstellungen';
    fab.textContent = '🍪';
    fab.addEventListener('click', openSettings);
    return fab;
  }

  var bannerEl = null;
  var modalEl = null;
  var fabEl = null;

  function removeBanner() {
    if (bannerEl && bannerEl.parentNode) bannerEl.parentNode.removeChild(bannerEl);
    bannerEl = null;
  }
  function removeModal() {
    if (modalEl && modalEl.parentNode) modalEl.parentNode.removeChild(modalEl);
    modalEl = null;
  }

  function showBanner() {
    if (bannerEl) return;
    bannerEl = buildBanner();
    document.body.appendChild(bannerEl);
    bannerEl.addEventListener('click', function (e) {
      var t = e.target.closest('[data-fv-cc]');
      if (!t) return;
      var action = t.getAttribute('data-fv-cc');
      if (action === 'accept') { writeConsent({ statistics: true, marketing: true }); removeBanner(); ensureFab(); }
      else if (action === 'reject') { writeConsent({ statistics: false, marketing: false }); removeBanner(); ensureFab(); }
      else if (action === 'settings') { openSettings(); }
    });
  }

  function openSettings() {
    if (modalEl) return;
    var current = readConsent();
    modalEl = buildModal(current);
    document.body.appendChild(modalEl);
    modalEl.addEventListener('click', function (e) {
      if (e.target === modalEl) { removeModal(); return; }
      var t = e.target.closest('[data-fv-cc]');
      if (!t) return;
      var action = t.getAttribute('data-fv-cc');
      if (action === 'accept') {
        writeConsent({ statistics: true, marketing: true });
        removeModal(); removeBanner(); ensureFab();
      } else if (action === 'reject') {
        writeConsent({ statistics: false, marketing: false });
        removeModal(); removeBanner(); ensureFab();
      } else if (action === 'save') {
        var stats = modalEl.querySelector('[data-fv-cat="statistics"]').checked;
        var mkt = modalEl.querySelector('[data-fv-cat="marketing"]').checked;
        writeConsent({ statistics: stats, marketing: mkt });
        removeModal(); removeBanner(); ensureFab();
      }
    });
  }

  function ensureFab() {
    if (fabEl) return;
    fabEl = buildFab();
    document.body.appendChild(fabEl);
  }

  function init() {
    injectStyles();
    var existing = readConsent();
    if (existing) {
      dispatchConsent(existing);
      ensureFab();
    } else {
      showBanner();
    }

    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-fv-consent-open]');
      if (t) { e.preventDefault(); openSettings(); }
    });
  }

  window.fvConsent = {
    get: function (cat) {
      var c = readConsent();
      if (!c) return false;
      if (cat === 'necessary') return true;
      return !!c[cat];
    },
    open: openSettings,
    reset: function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      if (fabEl && fabEl.parentNode) { fabEl.parentNode.removeChild(fabEl); fabEl = null; }
      showBanner();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
