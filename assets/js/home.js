// 首頁五根小蠟燭：捲到這裡才一根一根點亮。沒有 JS、或設定減少動態時，五根一直亮著。
(function () {
  var row = document.querySelector('.h-candles');
  if (!row || !('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var items = row.querySelectorAll('li');
  row.classList.add('is-waiting');
  var io = new IntersectionObserver(function (entries) {
    var seen = false;
    entries.forEach(function (e) { if (e.isIntersecting) seen = true; });
    if (!seen) return;
    io.disconnect();
    Array.prototype.forEach.call(items, function (li, i) {
      setTimeout(function () { li.classList.add('lit'); }, 300 + i * 420);
    });
  }, { threshold: 0.5 });
  io.observe(row);
})();
