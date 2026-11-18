(function () {
  var root = document.documentElement;

  // Theme toggle. The override lives in <meta name="color-scheme"> (CSS reads it); no stored value
  // follows the system. Storage can fail (private mode), page still works.
  var meta = document.querySelector('meta[name="color-scheme"]');
  var dark = matchMedia('(prefers-color-scheme: dark)');
  var btn = document.querySelector('.theme');
  var label = btn.querySelector('.theme__label');
  function rendered() { return meta.content === 'light dark' ? (dark.matches ? 'dark' : 'light') : meta.content; }
  function sync() {
    var next = rendered() === 'dark' ? 'light' : 'dark';
    label.textContent = next === 'dark' ? 'Dark' : 'Light';
    btn.setAttribute('aria-label', 'Switch to ' + next + ' theme');
  }
  function apply(t) { meta.content = t || 'light dark'; sync(); }
  sync();
  dark.addEventListener('change', sync);
  btn.addEventListener('click', function () {
    var target = rendered() === 'dark' ? 'light' : 'dark';
    // Store only a real override; undoing back to the system value clears it.
    var override = target === (dark.matches ? 'dark' : 'light') ? null : target;
    try { override ? localStorage.setItem('theme', override) : localStorage.removeItem('theme'); } catch (e) {}
    apply(override);
  });
  window.addEventListener('storage', function (e) {
    if (e.key === 'theme') apply(e.newValue === 'light' || e.newValue === 'dark' ? e.newValue : null);
  });

  // Mobile menu: close after picking a section, on Escape, or on outside click.
  var menu = document.querySelector('.menu');
  var mq = matchMedia('(min-width: 900px)');
  function fitMenu() { menu.open = mq.matches; }
  fitMenu();
  mq.addEventListener('change', fitMenu);
  menu.addEventListener('click', function (e) { if (e.target.closest('a') && !mq.matches) menu.open = false; });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.open && !mq.matches) { menu.open = false; menu.querySelector('summary').focus(); }
  });
  document.addEventListener('click', function (e) { if (!mq.matches && menu.open && !menu.contains(e.target)) menu.open = false; });

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
    return;
  }

  // Reveal on scroll (CSS disables the effect under reduced motion).
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  // Highlight the nav link of the section in view: CSS :target-current styles it, JS mirrors aria-current.
  if (CSS.supports('scroll-target-group: auto')) {
    var syncAria = function () {
      var cur = document.querySelector('.menu a:target-current');
      document.querySelectorAll('.menu a').forEach(function (a) { a.setAttribute('aria-current', a === cur ? 'true' : 'false'); });
    };
    syncAria();
    // :target-current updates a frame after scrollend
    document.addEventListener('scrollend', function () { requestAnimationFrame(syncAria); });
    return;
  }
  var links = {};
  document.querySelectorAll('.menu a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      var a = links[en.target.id];
      if (!a) return;
      if (en.isIntersecting) {
        Object.keys(links).forEach(function (k) { links[k].removeAttribute('aria-current'); });
        a.setAttribute('aria-current', 'true');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach(function (s) { spy.observe(s); });
})();
