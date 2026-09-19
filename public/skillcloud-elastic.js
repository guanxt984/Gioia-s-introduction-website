// Whole-cloud and individual label scroll lag, inspired by ElasticGridScroll.
// Preserve native scrolling and the existing cloud layout/hover transforms.
export function initSkillCloudElastic(skills) {
  const zones = [...skills.querySelectorAll('.skill-cloud-zone')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Match the actual overflow container used by the site's page transitions.
  const scroller = document.body.scrollHeight > document.documentElement.scrollHeight
    ? document.body : document.scrollingElement;
  const scrollTarget = scroller === document.body ? scroller : window;
  const scrollTop = () => scroller?.scrollTop ?? window.scrollY;
  const cloudLag = [0.24, 0.32, 0.38, 0.28];
  let labelIndex = 0;
  const motion = zones.flatMap((zone, i) => [
    { element: zone, lag: cloudLag[i % cloudLag.length], gain: 0.22 + i * 0.035, limit: 28 },
    ...[...zone.querySelectorAll('.skill-chip')].map(element => {
      // Stable per-label variation: no shared row/group motion or random rerenders.
      const variation = (++labelIndex * 0.61803398875) % 1;
      return {
        element,
        // Neighbouring labels alternate between quick settling and longer trailing.
        lag: 0.09 + variation * 0.66,
        gain: 0.04 + variation * 0.26,
        // Independent, subtle displacement relative to the intact parent cloud.
        limit: 4 + variation * 14,
      };
    }),
  ]);
  const positions = motion.map(() => 0);
  let previousScroll = scrollTop();
  let previousTime = 0;
  let frame = 0;
  let visible = false;

  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    previousScroll = scrollTop();
    positions.fill(0);
    motion.forEach(({ element: zone }) => {
      zone.style.removeProperty('translate');
      zone.style.removeProperty('will-change');
    });
  }

  function blocked() {
    return reduced.matches || document.hidden || !visible ||
      Boolean(document.querySelector('.skill-detail-dialog[open]'));
  }

  function paint(time) {
    frame = 0;
    if (blocked()) { reset(); return; }
    const dt = previousTime ? Math.min((time - previousTime) / 1000, 0.064) : 1 / 60;
    previousTime = time;
    let moving = false;
    motion.forEach(({ element: zone, lag }, i) => {
      // Exponential settling stays consistent across 60/120 Hz displays.
      positions[i] *= Math.exp(-dt / lag);
      if (Math.abs(positions[i]) < 0.1) positions[i] = 0;
      else moving = true;
      zone.style.translate = `0 ${positions[i].toFixed(2)}px`;
    });
    if (moving) frame = requestAnimationFrame(paint);
    else reset();
  }

  function onScroll() {
    const currentScroll = scrollTop();
    const delta = currentScroll - previousScroll;
    previousScroll = currentScroll;
    // Anchor jumps should land immediately, without throwing clouds off screen.
    if (blocked() || Math.abs(delta) > window.innerHeight * 0.6) { reset(); return; }
    motion.forEach(({ element: zone, gain, limit }, i) => {
      positions[i] = Math.max(-limit, Math.min(limit, positions[i] + delta * gain));
      zone.style.willChange = 'translate';
    });
    if (!frame) frame = requestAnimationFrame(paint);
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    reset();
  });
  observer.observe(skills);
  const dialog = document.querySelector('.skill-detail-dialog');
  const dialogObserver = new MutationObserver(reset);
  if (dialog) dialogObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] });
  scrollTarget.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', reset);
  document.addEventListener('visibilitychange', reset);
  reduced.addEventListener('change', reset);
  return () => {
    reset();
    observer.disconnect();
    dialogObserver.disconnect();
    scrollTarget.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', reset);
    document.removeEventListener('visibilitychange', reset);
    reduced.removeEventListener('change', reset);
  };
}
