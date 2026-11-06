// Co Me Time 蠟燭版的兩個動作（2026-11-06，Claude）。沒有 JS 時：動畫停在第一格，蠟燭那一排不出現，內容不受影響。
(function () {
  var motion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function still() { return !!(motion && motion.matches); }

  /* ---------- 首屏動畫 ----------
     瀏覽器不准網頁一打開就出聲，所以先靜音自己動；按一下才從頭放、有聲音。
     片子頭尾接不起來（開頭還沒亮、結尾全亮），循環時先淡出再接回開頭。有聲音的那一次只放一輪。 */
  var film = document.getElementById('film');
  var frame = document.getElementById('film-frame');
  var soundBtn = document.getElementById('film-sound');
  var soundText = document.getElementById('film-sound-text');
  var FIRST = '按一下，點亮（有聲音）';
  var AGAIN = '再聽一次';
  var STOP = '關掉聲音';

  if (film && soundBtn) {
    var sounding = false;
    var inView = true;

    var tryPlay = function () {
      var p = film.play();
      if (p && p.catch) p.catch(function () {});
    };
    var ambient = function () {
      if (!still() && inView && !sounding) tryPlay();
    };
    var setSounding = function (on) {
      sounding = on;
      film.muted = !on;
      frame.classList.toggle('is-sounding', on);
    };

    film.addEventListener('timeupdate', function () {
      if (film.duration && film.duration - film.currentTime < 0.45) frame.classList.add('is-fading');
    });
    film.addEventListener('ended', function () {
      var wasSounding = sounding;
      setSounding(false);
      if (wasSounding) soundText.textContent = AGAIN;
      if (still()) { frame.classList.remove('is-fading'); return; }
      setTimeout(function () {
        film.currentTime = 0;
        frame.classList.remove('is-fading');
        ambient();
      }, 420);
    });

    soundBtn.addEventListener('click', function () {
      if (sounding) {
        setSounding(false);
        soundText.textContent = AGAIN;
        return;
      }
      setSounding(true);
      soundText.textContent = STOP;
      frame.classList.remove('is-fading');
      film.currentTime = 0;
      tryPlay();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) ambient();
        else if (!sounding) film.pause();
      }, { threshold: 0.25 }).observe(film);
    } else {
      ambient();
    }
    if (motion && motion.addEventListener) {
      motion.addEventListener('change', function () { if (still() && !sounding) film.pause(); else ambient(); });
    }
  }

  /* ---------- 把火傳下去 ----------
     一排蠟燭，第一根亮著。按一下，火花飛到下一根，叮一聲。第一根的火始終一樣大，這就是整個概念。
     聲音用瀏覽器現場合成，沒有音檔。 */
  var chain = document.getElementById('chain');
  var row = document.getElementById('chain-row');
  var say = document.getElementById('chain-say');
  var goBtn = document.getElementById('chain-go');
  var muteBtn = document.getElementById('chain-sound');
  if (!chain || !row) return;
  chain.hidden = false;

  var COUNT = 7;
  var NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66];
  var LOOKS = ['', 'rotate(-2 40 100)', 'rotate(1.5 40 100)', 'rotate(-1 40 100)', 'rotate(2 40 100)', 'rotate(-1.5 40 100)', 'rotate(1 40 100)'];

  function candle(i) {
    return '<svg viewBox="0 0 80 170" aria-hidden="true" focusable="false">' +
      '<g transform="' + LOOKS[i] + '">' +
      '<circle class="halo" cx="40" cy="36" r="30" fill="url(#cl-halo)"/>' +
      '<path class="flame" fill="url(#cl-flame)" d="M40 10c3 11 13 16 13 28 0 8-6 13-13 13s-13-5-13-13c0-7 4-11 7-15 1 3 3 5 5 5 2-6 1-12 1-18z"/>' +
      '<path class="wick" d="M40 62c0-3 1-5 0-9"/>' +
      '<rect class="wax" x="14" y="70" width="52" height="96" rx="20"/>' +
      '<path class="drip" d="M12 82c0-14 12-22 28-22s28 8 28 22c0 6-6 7-7 1-1-4-5-4-6 1-1 7-1 15-5 15s-4-8-5-14c-1-4-6-4-7 0-1 5 0 9-4 9s-4-6-5-11c-1-4-5-4-6 0-1 5-11 5-11-1z"/>' +
      '<g class="is-off"><circle class="face" cx="31" cy="112" r="3.2"/><circle class="face" cx="49" cy="112" r="3.2"/><path class="face-line" d="M37 125h6"/></g>' +
      '<g class="is-on"><path class="face-line" d="M26 113q5-6 10 0M44 113q5-6 10 0"/><path class="face" d="M33 121q7 3 14 0q-1 9-7 9t-7-9z"/></g>' +
      '</g></svg>';
  }

  // 漸層定義只放一份，每根蠟燭共用。
  var defs = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' +
    '<radialGradient id="cl-halo"><stop offset="0" stop-color="#ffcf70" stop-opacity=".62"/><stop offset="1" stop-color="#ffcf70" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="cl-flame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb33d"/><stop offset=".55" stop-color="#ffd76e"/><stop offset="1" stop-color="#fff6d8"/></linearGradient>' +
    '</defs></svg>';
  var html = defs;
  for (var c = 0; c < COUNT; c++) {
    html += '<button class="cl-candle" type="button" tabindex="-1" data-i="' + c + '">' + candle(c) + '</button>';
  }
  row.innerHTML = html;
  var candles = row.querySelectorAll('.cl-candle');
  candles[0].classList.add('lit');

  var lit = 1;
  var flying = false;
  var soundOn = true;
  var audio = null;

  function ctx() {
    if (!audio) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audio = new AC();
    }
    if (audio.state === 'suspended' && audio.resume) audio.resume();
    return audio;
  }

  function sparkSound() {
    var a = soundOn && ctx();
    if (!a) return;
    var size = Math.floor(a.sampleRate * 0.16);
    var buffer = a.createBuffer(1, size, a.sampleRate);
    var data = buffer.getChannelData(0);
    for (var n = 0; n < size; n++) data[n] = (Math.random() * 2 - 1) * Math.pow(1 - n / size, 2.4);
    var noise = a.createBufferSource();
    noise.buffer = buffer;
    var band = a.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 3200;
    band.Q.value = 0.8;
    var gain = a.createGain();
    gain.gain.value = 0.16;
    noise.connect(band);
    band.connect(gain);
    gain.connect(a.destination);
    noise.start();
  }

  function bell(i) {
    var a = soundOn && ctx();
    if (!a) return;
    var now = a.currentTime;
    [[1, 0.22], [2.01, 0.06]].forEach(function (part) {
      var osc = a.createOscillator();
      var gain = a.createGain();
      osc.type = 'sine';
      osc.frequency.value = NOTES[i % NOTES.length] * part[0];
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(part[1], now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);
      osc.connect(gain);
      gain.connect(a.destination);
      osc.start(now);
      osc.stop(now + 1.35);
    });
  }

  function flameSpot(el) {
    var rowBox = row.getBoundingClientRect();
    var box = el.getBoundingClientRect();
    return { x: box.left - rowBox.left + box.width / 2, y: box.top - rowBox.top + box.height * 0.16 };
  }

  function words() {
    if (lit >= COUNT) {
      say.textContent = '全部亮了。第一根的火，還是一樣大。';
      goBtn.textContent = '再來一次';
    } else if (lit === 1) {
      say.textContent = '第一根已經亮了。按一下，把火傳下去。';
      goBtn.textContent = '把火傳下去';
    } else {
      say.textContent = '亮了 ' + lit + ' 根。第一根的火，還是一樣大。';
      goBtn.textContent = '把火傳下去';
    }
  }

  function lightNext() {
    var target = candles[lit];
    var from = flameSpot(candles[lit - 1]);
    var to = flameSpot(target);
    var land = function () {
      target.classList.add('lit');
      bell(lit);
      lit += 1;
      flying = false;
      words();
    };
    flying = true;
    sparkSound();
    if (still() || !Element.prototype.animate) { land(); return; }
    var spark = document.createElement('span');
    spark.className = 'cl-spark';
    row.appendChild(spark);
    var midY = Math.min(from.y, to.y) - 26;
    var move = spark.animate([
      { transform: 'translate(' + from.x + 'px,' + from.y + 'px)' },
      { transform: 'translate(' + (from.x + to.x) / 2 + 'px,' + midY + 'px)', offset: 0.5 },
      { transform: 'translate(' + to.x + 'px,' + to.y + 'px)' },
    ], { duration: 420, easing: 'ease-in-out' });
    move.onfinish = function () { spark.remove(); land(); };
  }

  function reset() {
    for (var i = 1; i < COUNT; i++) candles[i].classList.remove('lit');
    lit = 1;
    words();
  }

  function act() {
    if (flying) return;
    if (lit >= COUNT) { reset(); return; }
    lightNext();
  }

  goBtn.addEventListener('click', act);
  row.addEventListener('click', function (ev) {
    if (ev.target.closest && ev.target.closest('.cl-candle')) act();
  });
  muteBtn.addEventListener('click', function () {
    soundOn = !soundOn;
    muteBtn.textContent = soundOn ? '聲音：開' : '聲音：關';
    muteBtn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
  });
})();
