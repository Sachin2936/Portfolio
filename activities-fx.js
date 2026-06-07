/* =========================================================================
   WALLET CARD PULL — ANIMATION ENGINE
   
   STATE MACHINE per cycle:
     IDLE        → wait for IntersectionObserver
     PULL_UP     → top card rises  (700ms)
     SETTLE      → card breathes   (2400ms)
     FADE_INFO   → info panel updates
     PULL_DOWN   → card returns    (550ms)
     NEXT        → next card becomes active (100ms gap)
   
   The info panel on the left fades out, updates content, fades back in
   each time a new card is pulled.
   ========================================================================= */

(function () {
  'use strict';

  const SKILLS = [
    {
      id: 0,
      color: '#FFD700', rgb: '255,215,0',
      stat: '90', suffix: '%',
      name: 'ALGORITHMS',
      desc: '750+ LeetCode problems solved with surgical precision. Graph theory, dynamic programming, and high-frequency algorithms.',
      tags: ['LeetCode', 'Graphs', 'DP', 'Greedy'],
      kvs: [['Problems','750+'], ['Years','3yr'], ['Rank','Top 5%']],
      ghost: '90'
    },
    {
      id: 1,
      color: '#00FFAA', rgb: '0,255,170',
      stat: '40', suffix: '+',
      name: 'OPEN SOURCE',
      desc: 'Active developer in modern open source projects. Author of robust server middleware, API gateways, and web frameworks.',
      tags: ['GitHub', 'Protocols', 'APIs', 'OSS'],
      kvs: [['Commits','40+'], ['Repos','12'], ['PRs','Merged']],
      ghost: '40+'
    },
    {
      id: 2,
      color: '#FF4D6D', rgb: '255,77,109',
      stat: '82', suffix: '%',
      name: 'SECURITY',
      desc: 'Cryptographic authentication protocols, proactive penetration testing, and zero-trust engineering architectures.',
      tags: ['Crypto', 'Pen Testing', 'Zero-Trust'],
      kvs: [['Audits','5+'], ['CVEs','Found'], ['Auth','JWT/OAuth']],
      ghost: '82'
    },
    {
      id: 3,
      color: '#A78BFA', rgb: '167,139,250',
      stat: '100', suffix: '%',
      name: 'CORPORATE LIFE & ENG',
      desc: 'Corporate engineering team lead. Led 2-week agile sprints, coordinated DevOps deploy runs, and steered active SRE incident operations.',
      tags: ['Corporate', 'Agile Sprints', 'DevOps Ops', 'SRE'],
      kvs: [['Sprints','Led 24+'], ['Mentored','10+'], ['Incidents','Resolved']],
      ghost: '100'
    },
  ];

  /* ─────────────── TIMING (ms) ─────────────── */
  const T_PULL_UP   = 700;
  const T_SETTLE    = 2500;
  const T_PULL_DOWN = 550;
  const T_GAP       = 180;

  /* ─────────────── STATE ─────────────── */
  let current   = 0;        // index of currently active skill
  let running   = false;
  let cards     = [];       // DOM refs ordered by skill index
  const TOTAL   = SKILLS.length;

  /* ─────────────── DOM REFS ─────────────── */
  const elIdx   = () => document.getElementById('wlt-info-idx');
  const elStat  = () => document.getElementById('wlt-info-stat');
  const elName  = () => document.getElementById('wlt-info-name');
  const elDesc  = () => document.getElementById('wlt-info-desc');
  const elTags  = () => document.getElementById('wlt-info-tags');
  const elKvs   = () => document.getElementById('wlt-info-kvs');
  const elInfo  = () => document.getElementById('wlt-info');
  const elDots  = () => document.querySelectorAll('.wlt-dot');

  /* ─────────────── HELPERS ─────────────── */
  const wait = ms => new Promise(r => setTimeout(r, ms));

  /* Set stack position classes on all cards relative to current */
  function updateStack(activeIdx) {
    cards.forEach((card, i) => {
      // distance behind the active card in cycle order
      const behind = ((i - activeIdx) + TOTAL) % TOTAL;
      card.removeAttribute('data-stack');
      if (behind > 0) card.setAttribute('data-stack', String(behind));

      // z-index: active card highest
      card.style.zIndex = String(TOTAL - behind);
    });
  }

  /* Set colour CSS variables on the info panel */
  function setInfoColor(sk) {
    const info = elInfo();
    if (!info) return;
    info.style.setProperty('--wlt-color', sk.color);
    info.style.setProperty('--wlt-rgb', sk.rgb);
  }

  /* Update dots */
  function updateDots(activeIdx) {
    elDots().forEach((dot, i) => {
      dot.classList.toggle('active', i === activeIdx);
      if (i === activeIdx) {
        dot.style.setProperty('--wlt-color', SKILLS[activeIdx].color);
      }
    });
  }

  /* ─────────────── INFO PANEL UPDATE ─────────────── */
  async function updateInfo(sk, idx) {
    const info = elInfo();
    if (!info) return;

    // Fade out
    info.classList.add('fading');
    await wait(280);

    // Swap content
    const si = elStat();
    const sn = elName();
    const sd = elDesc();
    const st = elTags();
    const sk2 = elKvs();
    const idx_el = elIdx();

    if (idx_el) idx_el.textContent = `0${idx+1} / 0${TOTAL}`;
    if (si) si.innerHTML = sk.stat + '<span>' + sk.suffix + '</span>';
    if (sn) sn.textContent = sk.name;
    if (sd) sd.textContent = sk.desc;
    if (st) {
      st.innerHTML = sk.tags.map(t => `<span>${t}</span>`).join('');
    }
    if (sk2) {
      sk2.innerHTML = sk.kvs.map(([k,v]) =>
        `<div class="wlt-kv"><span class="wlt-k">${k}</span><span class="wlt-v">${v}</span></div>`
      ).join('');
    }



    setInfoColor(sk);
    updateDots(idx);

    // Redraw line to trigger width animation
    const line = info.querySelector('.wlt-info-line');
    if (line) {
      info.classList.add('updating');
      await wait(10);
      info.classList.remove('updating');
    }

    // Fade back in
    info.classList.remove('fading');

    // Show info panel if first time
    if (!info.classList.contains('visible')) {
      info.classList.add('visible');
    }
  }

  /* ─────────────── MAIN CYCLE ─────────────── */
  async function cycle() {
    while (running) {
      const sk   = SKILLS[current];
      const card = cards[current];
      if (!card) { await wait(500); continue; }

      // 1. Update stack order
      updateStack(current);

      // 2. Update info panel (fades, swaps, fades back)
      updateInfo(sk, current);
      await wait(80); // brief before pull starts

      // 3. Pull card UP
      card.classList.remove('wlt-returning', 'wlt-shown');
      card.classList.add('wlt-pulling');

      await wait(T_PULL_UP);

      // 4. Settle (remove pull rotation, start breathe)
      card.classList.remove('wlt-pulling');
      card.classList.add('wlt-shown');

      await wait(T_SETTLE);

      // 5. Pull card back DOWN
      card.classList.remove('wlt-shown');
      card.classList.add('wlt-returning');

      await wait(T_PULL_DOWN);
      card.classList.remove('wlt-returning');

      // 6. Gap before next
      await wait(T_GAP);

      // 7. Advance
      current = (current + 1) % TOTAL;
    }
  }

  /* ─────────────── SETUP ─────────────── */
  function setup() {
    // Collect card DOM refs in skill order
    for (let i = 0; i < TOTAL; i++) {
      const el = document.getElementById(`wlt-card-${i}`);
      if (el) {
        // Set ghost data attr for ::before pseudo
        el.dataset.ghost = SKILLS[i].ghost;
        cards.push(el);
      }
    }

    if (!cards.length) return;

    // Initial stack positions
    updateStack(0);

    // Show first info immediately (no animation yet)
    const info = elInfo();
    if (info) {
      setInfoColor(SKILLS[0]);
      updateDots(0);
      const idx_el = elIdx();
      if (idx_el) idx_el.textContent = '01 / 04';
    }
  }

  /* ─────────────── INTERSECTION OBSERVER ─────────────── */
  function initObserver() {
    const section = document.getElementById('activities');
    if (!section) return;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !running) {
          running = true;
          cycle();
        }
      });
    }, { threshold: 0.25 });

    obs.observe(section);
  }

  /* ─────────────── BOOT ─────────────── */
  function init() {
    setup();
    initObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
