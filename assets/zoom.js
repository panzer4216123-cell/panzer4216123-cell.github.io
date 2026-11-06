/* 點圖放大：型錄、案例照片點一下全螢幕看，可再放大到 3 倍、拖動看細節（啟揚41，2026-11-06） */
(function () {
  var imgs = [].slice.call(document.querySelectorAll('main .crop img')).filter(function (im) {
    return !im.closest('a');
  });
  if (!imgs.length) return;

  var css = document.createElement('style');
  css.textContent =
    '.zm-hint{display:inline-block;margin-top:.5rem;font-size:1rem;color:var(--color-fg-muted,#666)}' +
    'main .crop img.zm-ok{cursor:zoom-in}' +
    '.zm{position:fixed;inset:0;z-index:9999;background:#0a0a0a;display:none;flex-direction:column}' +
    '.zm.on{display:flex}' +
    '.zm-stage{flex:1;overflow:auto;-webkit-overflow-scrolling:touch;display:flex;align-items:center;justify-content:center}' +
    '.zm-stage.big{display:block}' +
    '.zm-stage img{display:block;max-width:100%;max-height:100%;margin:auto;touch-action:pinch-zoom pan-x pan-y}' +
    '.zm-stage.big img{max-width:none;max-height:none}' +
    '.zm-bar{display:flex;gap:10px;justify-content:center;padding:12px 12px calc(12px + env(safe-area-inset-bottom));background:#111}' +
    '.zm-bar button{font:600 18px/1 system-ui,-apple-system,"PingFang TC","Noto Sans TC",sans-serif;color:#fff;background:#2a2a2a;border:1px solid #555;border-radius:10px;min-width:72px;min-height:48px;padding:0 14px}' +
    '.zm-bar button:active{background:#444}' +
    '.zm-cap{color:#ddd;text-align:center;font:16px/1.4 system-ui,-apple-system,"PingFang TC","Noto Sans TC",sans-serif;padding:12px 16px 0}';
  document.head.appendChild(css);

  var box = document.createElement('div');
  box.className = 'zm';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', '放大看圖');
  box.innerHTML =
    '<p class="zm-cap"></p><div class="zm-stage"><img alt=""></div>' +
    '<div class="zm-bar"><button type="button" data-z="-1" aria-label="縮小">－ 縮小</button>' +
    '<button type="button" data-z="1" aria-label="放大">＋ 放大</button>' +
    '<button type="button" data-z="0" aria-label="關閉">✕ 關閉</button></div>';
  document.body.appendChild(box);

  var stage = box.querySelector('.zm-stage');
  var big = stage.querySelector('img');
  var cap = box.querySelector('.zm-cap');
  var level = 1; // 1 = 符合螢幕，2、3 = 放大倍數
  var fromHistory = false;

  function apply(cx, cy) {
    if (level === 1) {
      stage.classList.remove('big');
      big.style.width = '';
      return;
    }
    var fit = Math.min(stage.clientWidth / big.naturalWidth, stage.clientHeight / big.naturalHeight, 1);
    var rx = cx == null ? 0.5 : cx, ry = cy == null ? 0.5 : cy;
    stage.classList.add('big');
    big.style.width = Math.round(big.naturalWidth * fit * level) + 'px';
    stage.scrollLeft = big.offsetWidth * rx - stage.clientWidth / 2;
    stage.scrollTop = big.offsetHeight * ry - stage.clientHeight / 2;
  }

  function open(im) {
    big.src = im.currentSrc || im.src;
    big.alt = im.alt || '';
    cap.textContent = (im.alt ? im.alt + '　' : '') + '點兩下或按「＋ 放大」看細節';
    level = 1;
    apply();
    box.classList.add('on');
    document.documentElement.style.overflow = 'hidden';
    try { history.pushState({ zm: 1 }, ''); } catch (e) {}
    box.querySelector('[data-z="1"]').focus();
  }

  function close() {
    if (!box.classList.contains('on')) return;
    box.classList.remove('on');
    document.documentElement.style.overflow = '';
    if (!fromHistory) { try { if (history.state && history.state.zm) history.back(); } catch (e) {} }
    fromHistory = false;
  }

  imgs.forEach(function (im) {
    im.classList.add('zm-ok');
    im.setAttribute('tabindex', '0');
    im.setAttribute('role', 'button');
    im.addEventListener('click', function () { open(im); });
    im.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(im); } });
  });

  box.querySelector('.zm-bar').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    var z = +b.getAttribute('data-z');
    if (z === 0) return close();
    level = Math.max(1, Math.min(3, level + z));
    apply();
  });

  big.addEventListener('dblclick', function (e) {
    var r = big.getBoundingClientRect();
    var cx = (e.clientX - r.left) / r.width, cy = (e.clientY - r.top) / r.height;
    level = level === 1 ? 2.5 : 1;
    apply(cx, cy);
  });

  stage.addEventListener('click', function (e) { if (e.target === stage && level === 1) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  window.addEventListener('popstate', function () { if (box.classList.contains('on')) { fromHistory = true; close(); } });

  // 型錄頁加一句提示
  var lead = document.querySelector('main section .shell p.text-fg-muted, main section p.text-fg-muted');
  if (lead && location.pathname.indexOf('/equipment') === 0) {
    var h = document.createElement('span');
    h.className = 'zm-hint';
    h.textContent = '字太小？點圖片就能放大看。';
    lead.parentNode.insertBefore(h, lead.nextSibling);
  }
})();
