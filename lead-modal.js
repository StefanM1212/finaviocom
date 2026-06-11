/* Finavio Lead-Modal — On-Site Anfrage statt externem Funnel
 *
 * Jeder Button/Link mit dem Attribut [data-fv-lead] öffnet das Modal.
 * Optional kann [data-fv-topic="<wert>"] das Themen-Feld vorausfüllen
 * (geldanlage | altersvorsorge | bu | steuern — sonst Freitext).
 *
 * Die Lead-Daten werden als JSON per POST an WEBHOOK_URL geschickt.
 */
(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────
  //  WEBHOOK-URL (LeadConnector / GoHighLevel)
  var WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/TvhOZobmz14P5blnXFlK/webhook-trigger/24958858-a0b0-4ffc-bf6b-3436911c71e2';
  // ─────────────────────────────────────────────────────────────

  // Vorbelegung für die 3 Fallbeispiel-Buttons (Freitext-Feld wird vorausgefüllt)
  var TOPIC_PRESETS = {
    geldanlage: 'Geldanlage & Vermögensaufbau',
    altersvorsorge: 'Altersvorsorge & Rente',
    bu: 'Berufsunfähigkeitsversicherung',
    steuern: 'Steuern optimieren'
  };

  function injectStyles() {
    if (document.getElementById('fv-lead-styles')) return;
    var css = ''
      + '.fv-lead-overlay{position:fixed;inset:0;background:rgba(10,20,12,.55);-webkit-backdrop-filter:blur(7px);'
      + 'backdrop-filter:blur(7px);z-index:100001;display:flex;align-items:center;justify-content:center;padding:1.25rem;'
      + 'font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;animation:fv-lead-fade .22s ease-out;}'
      + '@keyframes fv-lead-fade{from{opacity:0}to{opacity:1}}'
      + '.fv-lead-card{background:#fff;border-radius:24px;max-width:430px;width:100%;max-height:92vh;overflow-y:auto;'
      + 'padding:2.1rem 2rem 1.7rem;box-shadow:0 30px 80px rgba(0,0,0,.35);position:relative;'
      + 'animation:fv-lead-up .32s cubic-bezier(.16,1,.3,1);color:#15201a;}'
      + '@keyframes fv-lead-up{from{transform:translateY(24px) scale(.97);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}'
      + '.fv-lead-close{position:absolute;top:1.05rem;right:1.15rem;width:32px;height:32px;border-radius:50%;background:#f1f3f1;'
      + 'border:none;font-size:1.25rem;line-height:1;cursor:pointer;color:#7a857d;display:flex;align-items:center;justify-content:center;'
      + 'transition:background .15s ease,color .15s ease;}'
      + '.fv-lead-close:hover{background:#e4e8e4;color:#222;}'
      + '.fv-lead-tag{display:inline-flex;align-items:center;gap:.4rem;font-size:.72rem;font-weight:600;letter-spacing:.03em;'
      + 'text-transform:uppercase;color:#0E4F12;background:#e7f3e8;border-radius:50px;padding:.34rem .85rem;margin-bottom:.85rem;}'
      + '.fv-lead-tag::before{content:"";width:7px;height:7px;border-radius:50%;background:#19a527;box-shadow:0 0 0 3px rgba(25,165,39,.2);}'
      + '.fv-lead-card h3{font-family:Sora,Inter,sans-serif;font-size:1.5rem;font-weight:800;margin:0 0 .4rem;line-height:1.18;letter-spacing:-.01em;}'
      + '.fv-lead-card>p.fv-lead-sub{font-size:.92rem;line-height:1.55;color:#5c6660;margin:0 0 1.45rem;}'
      + '.fv-lead-field{margin-bottom:.85rem;}'
      + '.fv-lead-field label{display:block;font-size:.82rem;font-weight:600;color:#2a332d;margin-bottom:.4rem;}'
      + '.fv-lead-field input{width:100%;padding:.85rem 1rem;border:1.5px solid transparent;border-radius:13px;'
      + 'font-size:.97rem;font-family:inherit;color:#15201a;background:#f4f6f4;transition:border-color .15s ease,background .15s ease,box-shadow .15s ease;box-sizing:border-box;}'
      + '.fv-lead-field input::placeholder{color:#9aa39c;}'
      + '.fv-lead-field input:focus{outline:none;background:#fff;border-color:#0E4F12;box-shadow:0 0 0 4px rgba(14,79,18,.12);}'
      + '.fv-lead-field input.fv-lead-err{border-color:#e0584f;background:#fdf3f2;}'
      + '.fv-lead-consent{display:flex;align-items:flex-start;gap:.6rem;margin:.55rem 0 1.2rem;}'
      + '.fv-lead-consent input{margin-top:.15rem;width:17px;height:17px;flex-shrink:0;accent-color:#0E4F12;cursor:pointer;}'
      + '.fv-lead-consent label{font-size:.79rem;line-height:1.5;color:#5c6660;font-weight:400;}'
      + '.fv-lead-consent a{color:#0E4F12;text-decoration:underline;}'
      + '.fv-lead-submit{width:100%;padding:1rem 1.25rem;border:none;border-radius:14px;'
      + 'background:linear-gradient(135deg,#15803d 0%,#0E4F12 100%);color:#fff;font-size:1.02rem;font-weight:700;'
      + 'font-family:Sora,Inter,sans-serif;cursor:pointer;transition:transform .15s ease,box-shadow .15s ease,opacity .15s ease;'
      + 'box-shadow:0 8px 22px rgba(14,79,18,.28);}'
      + '.fv-lead-submit:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(14,79,18,.34);}'
      + '.fv-lead-submit:active{transform:translateY(0);}'
      + '.fv-lead-submit:disabled{opacity:.65;cursor:not-allowed;transform:none;box-shadow:none;}'
      + '.fv-lead-note{font-size:.77rem;color:#94a09a;text-align:center;margin:.9rem 0 0;}'
      + '.fv-lead-msg{font-size:.84rem;border-radius:11px;padding:.7rem .95rem;margin-bottom:.95rem;display:none;line-height:1.45;}'
      + '.fv-lead-msg.err{display:block;background:#fdecec;color:#a12020;border:1px solid #f3c2c2;}'
      + '.fv-lead-success{text-align:center;padding:1.2rem 0 .5rem;}'
      + '.fv-lead-success .fv-lead-check{width:72px;height:72px;border-radius:50%;background:#e7f3e8;color:#0E4F12;'
      + 'display:flex;align-items:center;justify-content:center;font-size:2.2rem;margin:0 auto 1.1rem;'
      + 'animation:fv-lead-pop .4s cubic-bezier(.16,1,.3,1);}'
      + '@keyframes fv-lead-pop{from{transform:scale(.5);opacity:0}to{transform:scale(1);opacity:1}}'
      + '.fv-lead-success h3{margin:0 0 .5rem;}'
      + '.fv-lead-success p{font-size:.95rem;color:#5c6660;line-height:1.6;margin:0 0 1.4rem;}'
      + '@media (max-width:520px){.fv-lead-card{padding:1.7rem 1.35rem 1.4rem;border-radius:20px;}.fv-lead-card h3{font-size:1.3rem;}}';
    var style = document.createElement('style');
    style.id = 'fv-lead-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  var overlayEl = null;
  var lastFocus = null;

  function escAttr(v) {
    return String(v).replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  function openModal(presetTopicKey) {
    if (overlayEl) return;
    lastFocus = document.activeElement;
    injectStyles();

    var preset = TOPIC_PRESETS[presetTopicKey] || '';

    overlayEl = document.createElement('div');
    overlayEl.className = 'fv-lead-overlay';
    overlayEl.setAttribute('role', 'dialog');
    overlayEl.setAttribute('aria-modal', 'true');
    overlayEl.setAttribute('aria-label', 'Experten anfragen');
    overlayEl.innerHTML = ''
      + '<div class="fv-lead-card">'
      + '<button type="button" class="fv-lead-close" data-fv-lead-close aria-label="Schließen">&times;</button>'
      + '<span class="fv-lead-tag">Kostenlos & unverbindlich</span>'
      + '<h3>Jetzt Experten anfragen</h3>'
      + '<p class="fv-lead-sub">Trag dich kurz ein – wir melden uns zeitnah und bringen dich mit dem passenden, geprüften Experten zusammen.</p>'
      + '<div class="fv-lead-msg" data-fv-lead-msg></div>'
      + '<form data-fv-lead-form novalidate>'
      + '<div class="fv-lead-field"><label for="fv-lead-topic">Für was interessierst du dich?</label>'
      + '<input id="fv-lead-topic" name="topic" type="text" placeholder="z. B. Altersvorsorge, Geldanlage, BU …" value="' + escAttr(preset) + '" required></div>'
      + '<div class="fv-lead-field"><label for="fv-lead-name">Name</label>'
      + '<input id="fv-lead-name" name="name" type="text" autocomplete="name" placeholder="Vor- und Nachname" required></div>'
      + '<div class="fv-lead-field"><label for="fv-lead-email">E-Mail</label>'
      + '<input id="fv-lead-email" name="email" type="email" autocomplete="email" placeholder="name@beispiel.de" required></div>'
      + '<div class="fv-lead-field"><label for="fv-lead-phone">Telefonnummer</label>'
      + '<input id="fv-lead-phone" name="phone" type="tel" autocomplete="tel" placeholder="z. B. 0151 23456789" required></div>'
      + '<div class="fv-lead-consent">'
      + '<input id="fv-lead-consent" name="consent" type="checkbox" required>'
      + '<label for="fv-lead-consent">Ich willige ein, dass meine Daten zur Bearbeitung meiner Anfrage und Kontaktaufnahme gemäß der <a href="datenschutz.html" target="_blank">Datenschutzerklärung</a> verarbeitet werden.</label>'
      + '</div>'
      + '<button type="submit" class="fv-lead-submit">Jetzt anfragen →</button>'
      + '<p class="fv-lead-note">✓ 100 % kostenlos · ✓ unverbindlich · ✓ kein Risiko</p>'
      + '</form>'
      + '</div>';

    document.body.appendChild(overlayEl);
    document.body.style.overflow = 'hidden';

    overlayEl.addEventListener('click', function (e) {
      if (e.target === overlayEl || e.target.closest('[data-fv-lead-close]')) closeModal();
    });
    overlayEl.querySelector('[data-fv-lead-form]').addEventListener('submit', onSubmit);
    document.addEventListener('keydown', onKeydown);

    // Fokus auf erstes leeres Feld (bei Vorbelegung → Name)
    var focusEl = preset ? overlayEl.querySelector('#fv-lead-name') : overlayEl.querySelector('#fv-lead-topic');
    if (focusEl) focusEl.focus();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') closeModal();
  }

  function closeModal() {
    if (!overlayEl) return;
    document.removeEventListener('keydown', onKeydown);
    if (overlayEl.parentNode) overlayEl.parentNode.removeChild(overlayEl);
    overlayEl = null;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function showError(msg) {
    var box = overlayEl.querySelector('[data-fv-lead-msg]');
    box.textContent = msg;
    box.className = 'fv-lead-msg err';
  }

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function onSubmit(e) {
    e.preventDefault();
    var form = e.currentTarget;
    var f = {
      topic: form.topic.value.trim(),
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      consent: form.consent.checked
    };

    var firstBad = null;
    [['topic', f.topic.length >= 2], ['name', f.name.length >= 2], ['email', validEmail(f.email)], ['phone', f.phone.length >= 5]]
      .forEach(function (pair) {
        var field = form[pair[0]];
        if (!pair[1]) { field.classList.add('fv-lead-err'); if (!firstBad) firstBad = field; }
        else field.classList.remove('fv-lead-err');
      });
    if (!f.consent && !firstBad) firstBad = form.consent;
    if (firstBad) {
      showError(f.consent ? 'Bitte fülle alle Felder korrekt aus.' : 'Bitte stimme der Datenschutzerklärung zu.');
      firstBad.focus();
      return;
    }

    var payload = {
      topic: f.topic,
      name: f.name,
      email: f.email,
      phone: f.phone,
      consent: true,
      page_url: window.location.href,
      submitted_at: new Date().toISOString()
    };

    var btn = form.querySelector('.fv-lead-submit');
    btn.disabled = true;
    btn.textContent = 'Wird gesendet …';

    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        showSuccess();
      })
      .catch(function (err) {
        console.error('[Finavio Lead-Modal] Senden fehlgeschlagen:', err);
        showError('Da ist leider etwas schiefgelaufen. Bitte versuche es erneut oder schreib uns an info@finaviofinance.com.');
        btn.disabled = false;
        btn.textContent = 'Jetzt anfragen →';
      });
  }

  function showSuccess() {
    var card = overlayEl.querySelector('.fv-lead-card');
    card.innerHTML = ''
      + '<button type="button" class="fv-lead-close" data-fv-lead-close aria-label="Schließen">&times;</button>'
      + '<div class="fv-lead-success">'
      + '<div class="fv-lead-check">✓</div>'
      + '<h3>Vielen Dank!</h3>'
      + '<p>Deine Anfrage ist bei uns eingegangen. Wir melden uns zeitnah bei dir und bringen dich mit dem passenden Experten zusammen.</p>'
      + '<button type="button" class="fv-lead-submit" data-fv-lead-close>Schließen</button>'
      + '</div>';
    card.querySelectorAll('[data-fv-lead-close]').forEach(function (b) {
      b.addEventListener('click', closeModal);
    });
  }

  function init() {
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-fv-lead]');
      if (!trigger) return;
      e.preventDefault();
      openModal(trigger.getAttribute('data-fv-topic') || '');
    });
  }

  window.fvLead = { open: openModal };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
