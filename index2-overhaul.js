(function () {
  'use strict';

  var RED_NUMBERS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

  function element(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function enhanceIntro() {
    var welcome = document.getElementById('welcomeScreen');
    if (welcome && welcome.firstElementChild) {
      var card = welcome.firstElementChild;
      card.classList.add('tbr-welcome-card');

      if (!card.querySelector('.tbr-intro-kicker')) {
        var kicker = element('div', 'tbr-intro-kicker', '<span></span> AMERICAN DOUBLE ZERO');
        card.insertBefore(kicker, card.firstChild);
      }

      var enter = document.getElementById('enterGameBtn');
      if (enter) {
        enter.innerHTML = '<span>Enter the table</span><b aria-hidden="true">&#8594;</b>';
      }

      if (!card.querySelector('.tbr-intro-foot')) {
        card.appendChild(element('div', 'tbr-intro-foot', '<span>SIMULATION MODE</span><i></i><span>PLAY RESPONSIBLY</span>'));
      }
    }

    var splash = document.getElementById('splashScreen');
    if (splash && !splash.querySelector('.tbr-splash-copy')) {
      var splashCopy = element(
        'div',
        'tbr-splash-copy',
        '<div class="tbr-splash-mark"><span>TB</span><b>R</b></div>' +
        '<div class="tbr-splash-eyebrow">SOULMAN\'S SIGNATURE TABLE</div>' +
        '<h2>Test Bet<br><em>Roulette</em></h2>' +
        '<p>Place your chips. Test your system. Own the next spin.</p>'
      );
      splash.insertBefore(splashCopy, splash.querySelector('.startBtn'));
      var startButton = splash.querySelector('.startBtn');
      if (startButton) startButton.innerHTML = '<span>Take your seat</span><b aria-hidden="true">&#8594;</b>';
    }
  }

  function enhanceGameChrome() {
    if (document.querySelector('.tbr-topbar')) return;

    var topbar = element(
      'header',
      'tbr-topbar',
      '<div class="tbr-brand-lockup">' +
        '<div class="tbr-monogram" aria-hidden="true"><span>T</span><b>BR</b></div>' +
        '<div class="tbr-brand-copy"><small>SOULMAN\'S</small><strong>TEST BET ROULETTE</strong></div>' +
      '</div>' +
      '<div class="tbr-table-id"><span>AMERICAN ROULETTE</span><strong>THE SIGNATURE TABLE</strong><small>TABLE 00</small></div>' +
      '<div class="tbr-live"><i></i><span>TABLE LIVE</span></div>'
    );
    document.body.insertBefore(topbar, document.body.firstChild);

    var settingsButton = document.getElementById('settingsButton');
    if (settingsButton) {
      settingsButton.innerHTML = '<span class="tbr-button-icon" aria-hidden="true">&#9881;</span><span>Settings</span>';
      settingsButton.setAttribute('aria-label', 'Open settings');
      topbar.appendChild(settingsButton);
    }

    var autoButton = document.getElementById('autoRepeatBtn');
    if (autoButton) {
      autoButton.innerHTML = '<span class="tbr-button-icon" aria-hidden="true">&#9889;</span><span>Auto Play</span>';
      autoButton.setAttribute('aria-label', 'Open auto play');
      topbar.appendChild(autoButton);
    }

    var autoPauseButton = document.getElementById('autoTopPauseBtn');
    if (autoPauseButton) topbar.appendChild(autoPauseButton);

    var card = document.getElementById('card');
    if (card) {
      card.insertBefore(
        element(
          'div',
          'tbr-stage-heading',
          '<div><span>LIVE BETTING SURFACE</span><strong>American Double Zero</strong></div>' +
          '<p><i></i> Select a chip, then choose any position on the layout</p>'
        ),
        card.firstChild
      );

      card.appendChild(
        element(
          'div',
          'tbr-wheel-legend',
          '<span>SOULMAN\'S PRECISION WHEEL</span>' +
          '<strong>Click the wheel to spin</strong>' +
          '<small>ENTER KEY &nbsp;•&nbsp; AMERICAN 0 / 00</small>'
        )
      );
    }

    var feltWrap = document.getElementById('feltBlurWrap');
    if (feltWrap && feltWrap.parentElement) feltWrap.parentElement.classList.add('tbr-playfield');

    var tray = document.querySelector('.fixed-chips-container');
    if (tray && !tray.querySelector('.tbr-chip-label')) {
      tray.insertBefore(element('div', 'tbr-chip-label', '<span>SELECT CHIP</span><small>DENOMINATION</small>'), tray.firstChild);
    }

    var controls = document.querySelector('.fixed-controls-container');
    if (controls) controls.setAttribute('aria-label', 'Bet controls and favorites');

    var ratio = document.getElementById('ratioText');
    if (ratio) ratio.setAttribute('data-tbr-label', 'BET INSPECTOR');
  }

  function markNumberCells() {
    var felt = document.getElementById('felt');
    if (!felt) return;

    for (var n = 1; n <= 36; n += 1) {
      var cell = document.getElementById('slot-' + n);
      if (!cell) continue;
      cell.classList.add('tbr-number-cell');
      cell.classList.toggle('tbr-red-cell', RED_NUMBERS.has(n));
      cell.classList.toggle('tbr-black-cell', !RED_NUMBERS.has(n));
    }

    var zero = document.getElementById('slot-zero-bg');
    if (zero) zero.classList.add('tbr-zero-cell');
  }

  function watchFelt() {
    var felt = document.getElementById('felt');
    if (!felt) return;
    markNumberCells();
    if (typeof MutationObserver !== 'function') return;

    var queued = false;
    new MutationObserver(function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        markNumberCells();
      });
    }).observe(felt, { childList: true });
  }

  function syncGameState() {
    var body = document.body;
    if (!body) return;
    var welcome = document.getElementById('welcomeScreen');
    var splash = document.getElementById('splashScreen');
    var wrap = document.getElementById('wrap');

    function visible(node) {
      if (!node) return false;
      var cs = getComputedStyle(node);
      return cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity || 1) > 0.03;
    }

    var welcomeVisible = visible(welcome);
    var splashVisible = !welcomeVisible && visible(splash);
    var gameVisible = visible(wrap) && !welcomeVisible && !splashVisible;
    body.classList.toggle('tbr-welcome-visible', welcomeVisible);
    body.classList.toggle('tbr-splash-visible', splashVisible);
    body.classList.toggle('tbr-game-visible', gameVisible);

    var hand = document.getElementById('watchHandCursorFinal');
    if (hand) {
      if (welcomeVisible || splashVisible) {
        hand.style.setProperty('display', 'none', 'important');
        hand.style.setProperty('visibility', 'hidden', 'important');
        hand.style.setProperty('opacity', '0', 'important');
      } else {
        hand.style.removeProperty('display');
        hand.style.removeProperty('visibility');
        hand.style.removeProperty('opacity');
      }
    }
  }

  function watchGameState() {
    syncGameState();
    if (typeof MutationObserver !== 'function') return;
    var observer = new MutationObserver(syncGameState);
    ['welcomeScreen', 'splashScreen', 'wrap'].forEach(function (id) {
      var node = document.getElementById(id);
      if (node) observer.observe(node, { attributes: true, attributeFilter: ['class', 'style'] });
    });
    var hand = document.getElementById('watchHandCursorFinal');
    if (hand) observer.observe(hand, { attributes: true, attributeFilter: ['style'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  function init() {
    document.body.classList.add('tbr-overhaul');
    enhanceIntro();
    enhanceGameChrome();
    watchFelt();
    watchGameState();
    setTimeout(markNumberCells, 100);
    setTimeout(markNumberCells, 900);
    setTimeout(syncGameState, 1700);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
