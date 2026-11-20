/* Progressive fragment focus only. Links, paging and native commerce work without JS. */
(() => {
  const root = document.querySelector('[data-rhino-g-catalog]');
  if (!root) return;
  const header = document.querySelector('.section-header');
  const offset = () => root.style.setProperty('--rhino-g-catalog-offset', `${Math.ceil(header?.getBoundingClientRect().height || 0) + 24}px`);
  offset();
  if (header && typeof ResizeObserver !== 'undefined') new ResizeObserver(offset).observe(header);
  root.addEventListener('focusin', event => {
    if (!event.target.matches('a[href]:focus-visible')) return;
    const top = Math.ceil(header?.getBoundingClientRect().height || 0) + 24;
    const rect = event.target.getBoundingClientRect();
    if (rect.top < top) window.scrollBy(0, rect.top - top);
  });
  const arrive = () => {
    const target = document.getElementById(location.hash.slice(1));
    if (!target || !root.contains(target) || !target.hasAttribute('tabindex')) return;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'start' });
  };
  root.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (link && link.hash === location.hash) requestAnimationFrame(arrive);
  });
  window.addEventListener('hashchange', arrive);
  if (location.hash) requestAnimationFrame(arrive);
})();
