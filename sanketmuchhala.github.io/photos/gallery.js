// Hex grid gallery uses pure CSS; keep minimal enhancements.
(function () {
  // Ensure external links open safely
  document.querySelectorAll('a[target="_blank"]').forEach((a) => {
    a.rel = 'noopener noreferrer';
  });
  // Make anchors focusable for keyboard users
  document.querySelectorAll('main a').forEach((a) => {
    if (!a.hasAttribute('tabindex')) a.setAttribute('tabindex', '0');
  });
})();