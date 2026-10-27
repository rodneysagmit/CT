/* Review site only: show the option-switcher bar after the hero scrolls away. */
(function () {
  var bar = document.querySelector('.review-bar');
  if (!bar) return;
  var hero = document.querySelector('.hero');
  var update = function () {
    var limit = hero ? hero.offsetHeight * 0.6 : 200;
    bar.classList.toggle('is-shown', window.scrollY > limit || bar.contains(document.activeElement));
  };
  window.addEventListener('scroll', update, { passive: true });
  bar.addEventListener('focusin', update);
  update();
})();
