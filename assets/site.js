(function () {
  // Product tabs
  var tabs = document.querySelectorAll('[data-tab]');
  var caption = document.getElementById('tab-caption');
  tabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-tab');
      tabs.forEach(function (b) {
        var on = b === btn;
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.style.background = on ? '#1C1C1E' : '#FFFFFF';
        b.style.color = on ? '#FFFFFF' : '#1C1C1E';
        b.style.borderColor = on ? '#1C1C1E' : '#D6D3CD';
      });
      document.querySelectorAll('[data-shot]').forEach(function (img) {
        img.style.display = img.getAttribute('data-shot') === key ? 'block' : 'none';
      });
      if (caption) caption.textContent = btn.getAttribute('data-caption');
    });
  });

  // Channel hub: scale to fit, drag nodes, curves follow
  var hub = document.getElementById('hub');
  var wrap = document.getElementById('hub-wrap');
  if (!hub || !wrap) return;
  var W = 1136, H = 760, scale = 1;
  var LEFT = ['wa', 'ig', 'ms', 'tg', 'ph', 'em', 'gm', 'bk', 'ab', 'ex', 'tr'];
  var RIGHT = ['pms', 'crm', 'ai', 'web', 'pay', 'rep', 'sms', 'sci', 'key'];
  function defaults() {
    var d = { wa: [48, 30], ig: [168, 85], ms: [48, 140], tg: [168, 195], ph: [48, 250], em: [168, 305], gm: [48, 360],
      bk: [48, 500], ab: [168, 500], ex: [48, 610], tr: [168, 610], cx: [300, 556], rm: [536, 266] };
    RIGHT.forEach(function (id, i) { d[id] = [960, 24 + 82 * i]; });
    return d;
  }
  var pos = defaults();
  var nodes = {}, paths = {};
  hub.querySelectorAll('[data-node]').forEach(function (el) { nodes[el.getAttribute('data-node')] = el; });
  hub.querySelectorAll('[data-path]').forEach(function (el) { paths[el.getAttribute('data-path')] = el; });

  function offset(id) { return LEFT.indexOf(id) >= 0 ? -22 : (id === 'rm' ? -36 : 0); }
  function curve(a, b) {
    var k = Math.max(40, Math.abs(b[0] - a[0]) * 0.5);
    return 'M' + a[0] + ' ' + a[1] + ' C' + (a[0] + k) + ' ' + a[1] + ' ' + (b[0] - k) + ' ' + b[1] + ' ' + b[0] + ' ' + b[1];
  }
  function draw() {
    Object.keys(nodes).forEach(function (id) {
      nodes[id].style.left = (pos[id][0] + offset(id)) + 'px';
      nodes[id].style.top = pos[id][1] + 'px';
    });
    var rm = pos.rm, cx = pos.cx;
    LEFT.forEach(function (id, i) {
      var a = [pos[id][0] + 56, pos[id][1] + 28];
      if (paths[id]) paths[id].setAttribute('d', i < 7 ? curve(a, [rm[0], rm[1] + 64]) : curve(a, [cx[0], cx[1] + 36]));
    });
    if (paths.cx) paths.cx.setAttribute('d', curve([cx[0] + 168, cx[1] + 36], [rm[0], rm[1] + 106]));
    RIGHT.forEach(function (id) {
      if (paths[id]) paths[id].setAttribute('d', curve([rm[0] + 128, rm[1] + 64], [pos[id][0], pos[id][1] + 28]));
    });
  }
  function fit() {
    scale = Math.min(1, wrap.clientWidth / W);
    hub.style.transform = 'scale(' + scale + ')';
    wrap.style.height = Math.round(H * scale) + 'px';
  }

  var drag = null;
  Object.keys(nodes).forEach(function (id) {
    nodes[id].addEventListener('pointerdown', function (e) {
      if (e.button > 0) return;
      e.preventDefault();
      drag = { id: id, sx: e.clientX, sy: e.clientY, ox: pos[id][0], oy: pos[id][1] };
      nodes[id].classList.add('dragging');
      nodes[id].setPointerCapture(e.pointerId);
    });
    nodes[id].addEventListener('pointermove', function (e) {
      if (!drag || drag.id !== id) return;
      var x = Math.round(drag.ox + (e.clientX - drag.sx) / scale);
      var y = Math.round(drag.oy + (e.clientY - drag.sy) / scale);
      pos[id] = [Math.max(-20, Math.min(1100, x)), Math.max(-10, Math.min(730, y))];
      draw();
    });
    function end() { if (drag && drag.id === id) { nodes[id].classList.remove('dragging'); drag = null; } }
    nodes[id].addEventListener('pointerup', end);
    nodes[id].addEventListener('pointercancel', end);
  });

  var reset = document.getElementById('hub-reset');
  if (reset) reset.addEventListener('click', function () { pos = defaults(); draw(); });

  fit();
  draw();
  if (window.ResizeObserver) new ResizeObserver(fit).observe(wrap);
  else window.addEventListener('resize', fit);
})();
