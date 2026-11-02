(function () {
  var root = document.documentElement;

  // Theme toggle. Choice persists; storage can fail (private mode), page still works.
  var btn = document.querySelector('.theme');
  var label = btn.querySelector('.theme__label');
  function sync() {
    var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    label.textContent = next === 'dark' ? 'Dark' : 'Light';
    btn.setAttribute('aria-label', 'Switch to ' + next + ' theme');
  }
  sync();
  btn.addEventListener('click', function () {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    sync();
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

  // Highlight the nav link of the section in view.
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
