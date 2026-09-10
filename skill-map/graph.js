/* ═══════════════════════════════════════════════════════════════════
   Engineering Knowledge Graph — D3 v7

   Capability-first radial layout:
     centre ring  capabilities  (what he can build)
     middle ring  projects      (what proves it)
     outer ring   technologies / domains / experience (how and where)

   Interaction model: OVERVIEW -> FOCUS -> EXPAND -> TRACE.
   Views: Core (default) / Full ecosystem / Technical (adds repositories).
   Relationships carry typed evidence, never a numeric confidence.
═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Palette, keyed by cluster key (see clusterKey) ──────────── */
  const COLORS = {
    capability:     '#2dd4bf',
    project:        '#818cf8',
    experience:     '#fb923c',
    domain:         '#fb7185',
    repository:     '#94a3b8',
    language:       '#fbbf24',
    'ai-framework':   '#f472b6',
    'model-provider': '#f0abfc',
    framework:      '#34d399',
    database:       '#22d3ee',
    cloud:          '#38bdf8',
    infrastructure: '#a78bfa',
    visualization:  '#e879f9',
    'dev-tooling':    '#c084fc',
  };

  const GROUP_LABELS = {
    capability: 'Capability', project: 'Project', experience: 'Experience',
    domain: 'Domain', repository: 'Repository', language: 'Language',
    'ai-framework': 'AI Framework', 'model-provider': 'Model Provider',
    framework: 'Framework', database: 'Database', cloud: 'Cloud',
    infrastructure: 'Infrastructure', visualization: 'Visualization',
    'dev-tooling': 'Dev Tooling',
  };

  const EDGE_LABELS = {
    IMPLEMENTS: 'implements', USES: 'uses', DEPLOYED_ON: 'deployed on',
    TARGETS_DOMAIN: 'applied in', HAS_REPOSITORY: 'source', USED: 'used',
    DEMONSTRATES: 'demonstrates', IMPLEMENTED_WITH: 'implemented with',
    EVOLVED_INTO: 'evolved into', DERIVED_FROM: 'derived from',
    INSPIRED_BY: 'inspired by', SHARES_PATTERN_WITH: 'shares pattern with',
    RELATED_TO: 'related to',
  };

  const NARRATIVE = new Set(['EVOLVED_INTO', 'DERIVED_FROM', 'INSPIRED_BY',
                              'SHARES_PATTERN_WITH', 'RELATED_TO']);

  const VIEWS = {
    core:      new Set(['core']),
    full:      new Set(['core', 'extended']),
    technical: new Set(['core', 'extended', 'deep']),
  };

  function clusterKey(n) { return n.type === 'technology' ? (n.category || 'framework') : n.type; }

  /* ── Logos, with a monogram fallback so nothing renders bare ─── */
  const ICONS = {
    'next.js': 'si:nextdotjs/FFFFFF', 'node.js': 'dv:nodejs', 'vue.js': 'dv:vuejs',
    'd3.js': 'dv:d3js', 'tailwind css': 'si:tailwindcss/06B6D4',
    'apache airflow': 'si:apacheairflow/017CEE', 'google gemini': 'si:googlegemini/FFFFFF',
    'claude / anthropic': 'si:anthropic/FFFFFF', 'scikit-learn': 'dv:scikitlearn',
    'sentence transformers': 'si:huggingface/FFD21E',
    'model context protocol': 'si:anthropic/FFFFFF',
    'r shiny': 'dv:r', 'leaflet.js': 'si:leaflet/199900',
    python: 'dv:python', typescript: 'dv:typescript', javascript: 'dv:javascript',
    swiftui: 'dv:swift', swift: 'dv:swift', php: 'dv:php', html: 'dv:html5', css: 'dv:css3',
    shell: 'si:gnubash/4EAA25', sql: 'dv:postgresql',
    tensorflow: 'dv:tensorflow', pytorch: 'dv:pytorch', spacy: 'si:spacy/09A3D5',
    transformers: 'si:huggingface/FFD21E', langchain: 'si:langchain/1C3C3C',
    openai: 'si:openai/FFFFFF', deepseek: 'si:deepseek/4D6BFE', ollama: 'si:ollama/FFFFFF',
    claude: 'si:anthropic/FFFFFF', pandas: 'dv:pandas', numpy: 'dv:numpy',
    matplotlib: 'dv:matplotlib', mlflow: 'dv:mlflow',
    aws: 'si:amazonaws/FF9900', azure: 'dv:azure', docker: 'dv:docker',
    supabase: 'dv:supabase', vercel: 'si:vercel/FFFFFF', postgresql: 'dv:postgresql',
    firebase: 'dv:firebase', railway: 'si:railway/FFFFFF',
    react: 'dv:react', fastapi: 'dv:fastapi', flask: 'si:flask/FFFFFF',
    streamlit: 'si:streamlit/FF4B4B', vite: 'dv:vitejs', wordpress: 'dv:wordpress',
    zod: 'si:zod/3E67B1', vitest: 'si:vitest/6E9F18', playwright: 'si:playwright/2EAD33',
    ibm: 'si:ibm/052FAD',
  };
  const ICON_KEYS = Object.keys(ICONS).sort((a, b) => b.length - a.length);
  function iconFor(name) {
    const key = (name || '').toLowerCase();
    for (const k of ICON_KEYS) if (key.includes(k)) return ICONS[k];
    return null;
  }
  function iconUrl(icon) {
    if (!icon) return null;
    if (icon.startsWith('dv:')) {
      const n = icon.slice(3);
      return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${n}/${n}-original.svg`;
    }
    if (icon.startsWith('si:')) {
      const p = icon.slice(3).split('/');
      return `https://cdn.simpleicons.org/${p[0]}/${p[1] || 'FFFFFF'}`;
    }
    return icon;
  }
  function initials(name) {
    const clean = (name || '').replace(/\.(js|py)$/i, '').trim();
    if (/^[A-Z0-9]{2,5}$/.test(clean)) return clean.slice(0, 3);
    const words = clean.split(/[\s/\-]+/).filter(Boolean);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  const FILTERS = {
    all:        () => true,
    capability: n => n.type === 'capability',
    project:    n => n.type === 'project',
    domain:     n => n.type === 'domain',
    experience: n => n.type === 'experience',
    language:   n => n.type === 'technology' && n.category === 'language',
    ai:         n => n.type === 'technology' && (n.category === 'ai-framework' || n.category === 'model-provider'),
    data:       n => n.type === 'technology' && (n.category === 'framework' || n.category === 'database'),
    cloud:      n => n.type === 'technology' && (n.category === 'cloud' || n.category === 'infrastructure'),
    tool:       n => n.type === 'technology' && (n.category === 'dev-tooling' || n.category === 'visualization'),
  };

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ms = v => (reduceMotion ? 0 : v);

  const wrapper     = document.getElementById('graph-wrapper');
  const tooltipEl   = document.getElementById('graph-tooltip');
  const infoPanelEl = document.getElementById('info-panel');

  const dataUrl = window.ECOSYSTEM_DATA_URL || '/skill-map/data.generated.json';
  const embedded = document.getElementById('graph-data');
  if (embedded) {
    try { start(JSON.parse(embedded.textContent)); } catch (err) { failed('load', err); }
  } else {
    fetch(dataUrl)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(raw => start(raw))
      .catch(err => failed('load', err));
  }

  /* Keep loading and rendering failures distinct. Lumping them together
     means a rendering bug reports itself as "could not load data", which
     sends you debugging the network instead of the code. */
  function start(raw) {
    if (!raw || !Array.isArray(raw.nodes) || !Array.isArray(raw.edges)) {
      failed('schema', new Error(
        `expected {nodes:[], edges:[]}, got keys: ${raw ? Object.keys(raw).join(', ') : typeof raw}`));
      return;
    }
    try {
      initGraph(raw);
    } catch (err) {
      failed('render', err);
    }
  }

  function failed(stage, err) {
    const message = {
      load:   'Could not load the graph data.',
      schema: 'The graph data is in an unexpected format. If you have visited before, a cached script may be out of date — a hard refresh should fix it.',
      render: 'The graph data loaded, but rendering failed.',
    }[stage];
    console.error(`Knowledge graph: ${stage} failed —`, err);
    if (wrapper) {
      wrapper.innerHTML =
        '<p style="color:rgba(255,255,255,0.3);text-align:center;padding:5rem 2rem;' +
        'font-family:system-ui;line-height:1.6;max-width:32rem;margin:0 auto">' +
        message.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])) +
        '</p>';
    }
  }

  /* ══════════════════════════════════════════════════════════════ */
  function initGraph(raw) {
    const params = new URLSearchParams(location.search);
    let activeView   = VIEWS[params.get('view')] ? params.get('view') : 'core';
    let activeFilter = 'all';

    const nodes = raw.nodes.map(d => ({
      ...d,
      icon: (d.type === 'technology' || d.type === 'experience') ? iconFor(d.name) : null,
    }));
    const links = raw.edges.map(d => ({ ...d }));
    const storyModes = raw.story_modes || [];
    const nodeMap = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });

    const deg = {};
    nodes.forEach(n => { deg[n.id] = 0; });
    links.forEach(l => {
      deg[l.source] = (deg[l.source] || 0) + 1;
      deg[l.target] = (deg[l.target] || 0) + 1;
    });

    /* Capabilities and projects carry the story, so they carry the
       visual weight; technologies are context and stay small. */
    function r(d) {
      const k = deg[d.id] || 0;
      switch (d.type) {
        case 'capability': return Math.min(34, 22 + Math.max(0, k - 2) * 0.7);
        case 'project':    return Math.min(28, 18 + Math.max(0, k - 2) * 0.55);
        case 'experience': return Math.min(30, 22 + Math.max(0, k - 3) * 0.6);
        case 'domain':     return Math.min(22, 14 + Math.max(0, k - 1) * 0.7);
        case 'repository': return 10;
        default:           return Math.min(17, 10 + Math.max(0, k - 1) * 0.8);
      }
    }

    const neighborsOf = {};
    nodes.forEach(n => { neighborsOf[n.id] = new Set(); });
    links.forEach(l => {
      neighborsOf[l.source]?.add(l.target);
      neighborsOf[l.target]?.add(l.source);
    });

    /* ── Radial layout targets ─────────────────────────────────── */
    let W = wrapper.clientWidth;
    let H = wrapper.clientHeight;
    const OUTER_ORDER = ['language', 'ai-framework', 'model-provider', 'framework',
                          'database', 'cloud', 'infrastructure', 'visualization',
                          'dev-tooling', 'domain', 'experience', 'repository'];

    function computeTargets() {
      const cx = 0.5, cy = 0.47;
      const ring = (list, rx, ry, phase = 0) => {
        list.forEach((n, i) => {
          const theta = phase + (i / Math.max(1, list.length)) * Math.PI * 2;
          n.tx = (cx + rx * Math.cos(theta)) * W;
          n.ty = (cy + ry * Math.sin(theta)) * H;
        });
      };
      const byRank = (a, b) => (a.rank ?? 999) - (b.rank ?? 999) || a.id.localeCompare(b.id);

      ring(nodes.filter(n => n.type === 'capability').sort((a, b) => a.name.localeCompare(b.name)),
           0.17, 0.21, -Math.PI / 2);
      ring(nodes.filter(n => n.type === 'project').sort(byRank), 0.33, 0.36, -Math.PI / 2);

      // Outer rim, grouped so each category occupies its own arc.
      const outer = nodes.filter(n => !['capability', 'project'].includes(n.type));
      outer.sort((a, b) => {
        const ka = OUTER_ORDER.indexOf(clusterKey(a)), kb = OUTER_ORDER.indexOf(clusterKey(b));
        return ka - kb || a.name.localeCompare(b.name);
      });
      ring(outer, 0.475, 0.475, -Math.PI / 2);
    }
    computeTargets();
    nodes.forEach(n => {
      n.x = n.tx + (Math.random() - 0.5) * 40;
      n.y = n.ty + (Math.random() - 0.5) * 40;
    });

    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id)
        .distance(d => (d.type === 'IMPLEMENTS' ? 110 : 150))
        .strength(d => (d.type === 'IMPLEMENTS' ? 0.16 : 0.05)))
      .force('charge', d3.forceManyBody()
        .strength(d => ({ capability: -900, project: -700, experience: -700 }[d.type] || -260)))
      .force('collision', d3.forceCollide().radius(d => r(d) + 26).strength(0.92))
      .force('radial', alpha => {
        nodes.forEach(n => {
          if (n.tx == null) return;
          const k = (n.type === 'capability' || n.type === 'project') ? 0.14 : 0.2;
          n.vx += (n.tx - n.x) * alpha * k;
          n.vy += (n.ty - n.y) * alpha * k;
        });
      })
      .velocityDecay(0.45)
      .stop();

    for (let i = 0; i < 180; i++) sim.tick();

    /* ── SVG scaffolding ───────────────────────────────────────── */
    const svg = d3.select('#skill-graph').attr('width', W).attr('height', H)
      .style('touch-action', 'none');
    const defs = svg.append('defs');

    const sheen = defs.append('linearGradient').attr('id', 'node-sheen')
      .attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
    sheen.append('stop').attr('offset', '0%').attr('stop-color', '#fff').attr('stop-opacity', 0.12);
    sheen.append('stop').attr('offset', '55%').attr('stop-color', '#fff').attr('stop-opacity', 0.02);
    sheen.append('stop').attr('offset', '100%').attr('stop-color', '#000').attr('stop-opacity', 0.10);

    const lgf = defs.append('filter').attr('id', 'link-glow')
      .attr('x', '-15%').attr('y', '-400%').attr('width', '130%').attr('height', '900%');
    lgf.append('feGaussianBlur').attr('in', 'SourceGraphic').attr('stdDeviation', '2.5').attr('result', 'gb');
    const lgm = lgf.append('feMerge');
    lgm.append('feMergeNode').attr('in', 'gb');
    lgm.append('feMergeNode').attr('in', 'SourceGraphic');

    svg.append('rect').attr('width', '100%').attr('height', '100%').attr('fill', '#000');

    const g = svg.append('g').attr('class', 'zoom-g');
    const zoom = d3.zoom().scaleExtent([0.1, 8]).on('zoom', e => g.attr('transform', e.transform));
    svg.call(zoom);
    svg.on('click', e => {
      if (e.target === svg.node() || e.target.tagName === 'rect') { clearFocus(); hideInfoPanel(); }
    });

    /* ── Links ─────────────────────────────────────────────────── */
    function isSubject(t) { return t === 'project' || t === 'experience'; }
    function edgeColor(d) {
      const sn = nodeMap[d.source.id || d.source], tn = nodeMap[d.target.id || d.target];
      if (!sn || !tn) return '#888';
      if (d.type === 'IMPLEMENTS' || d.type === 'DEMONSTRATES') return COLORS.capability;
      if (NARRATIVE.has(d.type)) return COLORS.project;
      const subject = isSubject(sn.type) ? sn : (isSubject(tn.type) ? tn : null);
      const attr = subject ? (subject === sn ? tn : sn) : tn;
      return COLORS[clusterKey(attr)] || '#888';
    }
    function baseOpacity(d) {
      if (d.type === 'IMPLEMENTS' || d.type === 'DEMONSTRATES') return 0.5;
      if (NARRATIVE.has(d.type)) return 0.45;
      if (d.type === 'IMPLEMENTED_WITH') return 0.1;
      return 0.16;
    }
    function baseWidth(d) {
      if (d.type === 'IMPLEMENTS' || d.type === 'DEMONSTRATES') return 1.9;
      if (NARRATIVE.has(d.type)) return 1.5;
      return 1;
    }

    const linkG = g.append('g').attr('class', 'eco-links');
    const link = linkG.selectAll('line.eco-link').data(links).join('line')
      .attr('class', 'eco-link')
      .attr('stroke', edgeColor)
      .attr('stroke-opacity', baseOpacity)
      .attr('stroke-width', baseWidth)
      .attr('stroke-linecap', 'round')
      .attr('stroke-dasharray', d => (NARRATIVE.has(d.type) ? '1 5' : null))
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y);

    const linkHit = linkG.selectAll('line.eco-link-hit')
      .data(links.filter(l => l.context)).join('line')
      .attr('class', 'eco-link-hit').attr('stroke', 'transparent').attr('stroke-width', 12)
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y)
      .style('cursor', 'crosshair')
      .on('mouseenter', (e, d) => showLinkTooltip(e, d))
      .on('mousemove', e => moveTooltip(e))
      .on('mouseleave', hideTooltip);

    /* ── Nodes ─────────────────────────────────────────────────── */
    const nodeG = g.append('g').attr('class', 'eco-nodes');
    const node = nodeG.selectAll('g.eco-node').data(nodes).join('g')
      .attr('class', 'eco-node')
      .attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`)
      .style('cursor', 'pointer')
      .attr('tabindex', 0).attr('role', 'button')
      .attr('aria-label', d => `${d.name}, ${GROUP_LABELS[clusterKey(d)] || d.type}`)
      .call(drag(sim));

    node.append('circle').attr('class', 'n-sel').attr('r', 0).attr('fill', 'none')
      .attr('stroke', d => COLORS[clusterKey(d)])
      .attr('stroke-width', 1.4).attr('stroke-opacity', 0.85).attr('pointer-events', 'none');

    node.filter(d => ['capability', 'project', 'experience'].includes(d.type))
      .append('circle').attr('class', 'n-ring')
      .attr('r', d => r(d) + 6).attr('fill', 'none')
      .attr('stroke', d => COLORS[clusterKey(d)])
      .attr('stroke-width', d => (d.type === 'capability' ? 1 : 0.7))
      .attr('stroke-opacity', d => (d.type === 'capability' ? 0.42 : 0.24))
      .attr('stroke-dasharray', d => (d.type === 'capability' ? null : '2 4'));

    node.append('circle').attr('class', 'n-base').attr('r', 0)
      .attr('fill', d => COLORS[clusterKey(d)])
      .attr('fill-opacity', d => ({ capability: 0.2, project: 0.14, experience: 0.16 }[d.type] || 0.1))
      .attr('stroke', d => COLORS[clusterKey(d)])
      .attr('stroke-width', d => ({ capability: 2, project: 1.6, experience: 1.7 }[d.type] || 1.05))
      .attr('stroke-opacity', d => ({ capability: 0.85, project: 0.7, experience: 0.72 }[d.type] || 0.5));

    node.append('circle').attr('class', 'n-sheen').attr('r', 0)
      .attr('fill', 'url(#node-sheen)').attr('pointer-events', 'none');

    const entry = node.transition().delay((d, i) => ms(30 + i * 6))
      .duration(ms(500)).ease(d3.easeBackOut.overshoot(1.04));
    entry.select('.n-base').attr('r', d => r(d));
    entry.select('.n-sheen').attr('r', d => r(d));

    node.filter(d => d.type === 'technology' || d.type === 'experience').each(function (d) {
      const gN = d3.select(this);
      const size = r(d) * (d.type === 'experience' ? 0.8 : 1.05);
      const delay = ms(320 + nodes.indexOf(d) * 6), dur = ms(280);
      const mono = () => gN.append('text').attr('class', 'n-monogram')
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
        .attr('font-family', "'Bricolage Grotesque', system-ui, sans-serif")
        .attr('font-weight', '800').attr('font-size', `${Math.max(8, size * 0.45)}px`)
        .attr('fill', COLORS[clusterKey(d)]).attr('fill-opacity', 0)
        .attr('pointer-events', 'none').text(initials(d.name))
        .transition().delay(delay).duration(dur).attr('fill-opacity', 0.9);
      const url = iconUrl(d.icon);
      if (!url) { mono(); return; }
      const img = gN.append('image').attr('class', 'n-icon').attr('href', url)
        .attr('width', size).attr('height', size)
        .attr('x', -size / 2).attr('y', -size / 2)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('opacity', 0).attr('pointer-events', 'none');
      img.on('error', function () { d3.select(this).remove(); mono(); });
      img.transition().delay(delay).duration(dur).attr('opacity', 0.92);
    });

    node.append('text').attr('class', 'n-label')
      .attr('text-anchor', 'middle')
      .attr('font-family', "'Bricolage Grotesque', system-ui, sans-serif")
      .attr('font-size', d => ({ capability: '15px', project: '13px', experience: '14px', domain: '12.5px' }[d.type] || '11.5px'))
      .attr('font-weight', d => (d.type === 'capability' ? '700' : (isSubject(d.type) ? '600' : '500')))
      .attr('fill', d => ({
        capability: 'rgba(255,255,255,0.96)', project: 'rgba(255,255,255,0.9)',
        experience: 'rgba(255,255,255,0.92)', domain: 'rgba(255,255,255,0.82)',
      }[d.type] || 'rgba(255,255,255,0.6)'))
      .attr('pointer-events', 'none').attr('opacity', 0)
      .attr('dy', d => r(d) + 19)
      .text(d => d.name)
      .transition().delay((d, i) => ms(250 + i * 6)).duration(ms(340))
      .attr('opacity', d => labelOpacity(d));

    function labelOpacity(d) {
      return { capability: 1, project: 1, experience: 1, domain: 0.9 }[d.type] || 0.72;
    }

    sim.on('tick', () => {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      linkHit.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
             .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`);
      node.select('.n-label').attr('dy', d => r(d) + 19);
    });
    sim.alpha(reduceMotion ? 0 : 0.1).restart();

    /* ══════════════════════════════════════════════════════════
       VISIBILITY  (view tier + filter + manual expansion)
    ══════════════════════════════════════════════════════════ */
    const expanded = new Set();   // nodes revealed by "expand", overriding tier
    let visible = new Set();

    function computeVisible() {
      const tiers = VIEWS[activeView];
      const pred = FILTERS[activeFilter] || FILTERS.all;
      const set = new Set();
      nodes.forEach(n => {
        const inTier = tiers.has(n.tier) || expanded.has(n.id);
        if (inTier && pred(n)) set.add(n.id);
      });
      // A category filter would otherwise orphan its projects, so pull
      // in the project/experience nodes those matches attach to.
      if (activeFilter !== 'all' && activeFilter !== 'project' && activeFilter !== 'experience') {
        links.forEach(l => {
          const s = l.source.id ?? l.source, t = l.target.id ?? l.target;
          const sn = nodeMap[s], tn = nodeMap[t];
          const inTier = n => VIEWS[activeView].has(n.tier) || expanded.has(n.id);
          if (set.has(s) && tn && isSubject(tn.type) && inTier(tn)) set.add(t);
          if (set.has(t) && sn && isSubject(sn.type) && inTier(sn)) set.add(s);
        });
      }
      visible = set;
      return set;
    }

    function applyVisibility() {
      computeVisible();
      node.style('display', d => (visible.has(d.id) ? null : 'none'))
          .attr('opacity', d => (visible.has(d.id) ? 1 : 0))
          .attr('pointer-events', d => (visible.has(d.id) ? 'all' : 'none'));
      const edgeVisible = d => {
        const s = d.source.id ?? d.source, t = d.target.id ?? d.target;
        return visible.has(s) && visible.has(t);
      };
      link.style('display', d => (edgeVisible(d) ? null : 'none'));
      linkHit.style('display', d => (edgeVisible(d) ? null : 'none'))
             .attr('pointer-events', d => (edgeVisible(d) ? 'all' : 'none'));
      updateStats();
      sim.alpha(reduceMotion ? 0 : 0.12).restart();
    }

    function updateStats() {
      const count = type => [...visible].filter(id => nodeMap[id]?.type === type).length;
      const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
      set('stat-capabilities', count('capability'));
      set('stat-projects', count('project'));
      set('stat-tech', count('technology'));
      set('stat-exp', count('experience'));
    }

    /* ══════════════════════════════════════════════════════════
       FOCUS / TRACE
    ══════════════════════════════════════════════════════════ */
    let focusId = null, focusSet = new Set(), storyId = null;

    function focusNode(d, opts = {}) {
      if (focusId === d.id && !opts.force) { clearFocus(); hideInfoPanel(); return; }
      storyId = null;
      document.querySelectorAll('.eco-story-btn').forEach(b => b.classList.remove('active'));
      focusId = d.id;
      focusSet = new Set([d.id, ...[...neighborsOf[d.id]].filter(id => visible.has(id))]);
      applyFocus();
      showInfoPanel(d);
      zoomTo(focusSet);
      if (!opts.skipUrl) setUrl({ node: d.id, story: null });
    }

    function focusStory(story) {
      focusId = null;
      storyId = story.id;
      focusSet = new Set(story.node_ids.filter(id => nodeMap[id]));
      // Story nodes may live outside the current view — reveal them.
      story.node_ids.forEach(id => { if (nodeMap[id]) expanded.add(id); });
      applyVisibility();
      applyFocus();
      showStoryPanel(story);
      zoomTo(focusSet);
      setUrl({ story: story.id, node: null });
      document.querySelectorAll('.eco-story-btn')
        .forEach(b => b.classList.toggle('active', b.dataset.story === story.id));
    }

    function clearFocus(skipUrl) {
      focusId = null; storyId = null; focusSet = new Set();
      document.querySelectorAll('.eco-story-btn').forEach(b => b.classList.remove('active'));
      applyFocus();
      if (!skipUrl) setUrl({ node: null, story: null });
    }

    function applyFocus() {
      const on = focusId !== null || storyId !== null;
      const second = new Set();
      if (on) {
        links.forEach(l => {
          const s = l.source.id ?? l.source, t = l.target.id ?? l.target;
          if (focusSet.has(s) && !focusSet.has(t) && visible.has(t)) second.add(t);
          if (focusSet.has(t) && !focusSet.has(s) && visible.has(s)) second.add(s);
        });
      }
      const lit = d => !on || focusSet.has(d.id);

      node.select('.n-sel').transition().duration(ms(180))
        .attr('r', d => (on && d.id === focusId ? r(d) + 8 : 0));
      node.attr('opacity', d => {
        if (!visible.has(d.id)) return 0;
        if (!on) return 1;
        if (focusSet.has(d.id)) return 1;
        if (second.has(d.id)) return 0.34;
        return 0.07;
      });
      node.select('.n-base')
        .attr('fill-opacity', d => (lit(d) ? ({ capability: 0.2, project: 0.14, experience: 0.16 }[d.type] || 0.1) : 0.03))
        .attr('stroke-opacity', d => (lit(d) ? ({ capability: 0.85, project: 0.7, experience: 0.72 }[d.type] || 0.5) : 0.1));
      node.select('.n-ring').attr('stroke-opacity', d => (lit(d) ? (d.type === 'capability' ? 0.42 : 0.24) : 0.04));
      node.select('.n-icon').attr('opacity', d => (lit(d) ? 0.92 : 0.08));
      node.select('.n-monogram').attr('fill-opacity', d => (lit(d) ? 0.9 : 0.08));
      node.select('.n-label').attr('opacity', d => {
        if (!on) return labelOpacity(d);
        if (focusSet.has(d.id)) return 1;
        if (second.has(d.id)) return 0.25;
        return 0.05;
      });

      link
        .attr('stroke-opacity', d => {
          if (!on) return baseOpacity(d);
          const s = d.source.id ?? d.source, t = d.target.id ?? d.target;
          if (focusSet.has(s) && focusSet.has(t)) return 0.95;
          if ((focusSet.has(s) && second.has(t)) || (focusSet.has(t) && second.has(s))) return 0.13;
          return 0.03;
        })
        .attr('stroke-width', d => {
          if (!on) return baseWidth(d);
          const s = d.source.id ?? d.source, t = d.target.id ?? d.target;
          return focusSet.has(s) && focusSet.has(t) ? baseWidth(d) + 1.1 : baseWidth(d);
        })
        .attr('filter', d => {
          if (!on) return null;
          const s = d.source.id ?? d.source, t = d.target.id ?? d.target;
          return focusSet.has(s) && focusSet.has(t) ? 'url(#link-glow)' : null;
        });
    }

    function zoomTo(idSet) {
      const pts = [...idSet].map(id => nodeMap[id]).filter(n => n && n.x != null && visible.has(n.id));
      if (pts.length < 2) return;
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      pts.forEach(n => {
        const pad = r(n) + 46;
        x0 = Math.min(x0, n.x - pad); x1 = Math.max(x1, n.x + pad);
        y0 = Math.min(y0, n.y - pad); y1 = Math.max(y1, n.y + pad);
      });
      const scale = Math.min(W / (x1 - x0), H / (y1 - y0), 2.2) * 0.85;
      svg.transition().duration(ms(520)).ease(d3.easeQuadOut).call(
        zoom.transform,
        d3.zoomIdentity.translate((W - scale * (x0 + x1)) / 2, (H - scale * (y0 + y1)) / 2).scale(scale));
    }

    function fitAll() {
      const pts = nodes.filter(n => visible.has(n.id) && n.x != null);
      if (!pts.length) return;
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      pts.forEach(n => {
        const pad = r(n) + 34;
        x0 = Math.min(x0, n.x - pad); x1 = Math.max(x1, n.x + pad);
        y0 = Math.min(y0, n.y - pad); y1 = Math.max(y1, n.y + pad);
      });
      const scale = Math.min(W / (x1 - x0), H / (y1 - y0)) * 0.92;
      svg.transition().duration(ms(600)).ease(d3.easeCubicOut).call(
        zoom.transform,
        d3.zoomIdentity.translate((W - scale * (x0 + x1)) / 2, (H - scale * (y0 + y1)) / 2).scale(scale));
    }

    /* ══════════════════════════════════════════════════════════
       INTERACTION
    ══════════════════════════════════════════════════════════ */
    node
      .on('mouseenter', (e, d) => {
        if (!visible.has(d.id)) return;
        showNodeTooltip(e, d);
        const sel = d3.select(e.currentTarget), rad = r(d);
        sel.select('.n-base').transition().duration(110).attr('r', rad + 3);
        sel.select('.n-sheen').transition().duration(110).attr('r', rad + 3);
        sel.select('.n-ring').transition().duration(110).attr('r', rad + 9);
        sel.select('.n-label').attr('opacity', 1);
        sel.raise();
      })
      .on('mousemove', e => moveTooltip(e))
      .on('mouseleave', (e, d) => {
        hideTooltip();
        const sel = d3.select(e.currentTarget), rad = r(d);
        const dim = (focusId || storyId) && !focusSet.has(d.id);
        sel.select('.n-base').transition().duration(200).attr('r', rad);
        sel.select('.n-sheen').transition().duration(200).attr('r', rad);
        sel.select('.n-ring').transition().duration(200).attr('r', rad + 6);
        sel.select('.n-label').attr('opacity', dim ? 0.05 : labelOpacity(d));
      })
      .on('click', (e, d) => { e.stopPropagation(); focusNode(d); })
      .on('keydown', (e, d) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); focusNode(d); }
      });

    function drag(simulation) {
      return d3.drag()
        .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.2).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on('end', (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; });
    }

    /* ── Tooltips ──────────────────────────────────────────────── */
    function showNodeTooltip(e, d) {
      const label = GROUP_LABELS[clusterKey(d)] || d.type;
      const c = COLORS[clusterKey(d)];
      const conn = [...neighborsOf[d.id]].filter(id => visible.has(id)).length;
      let html = `<div class="tt-inner" style="border-left-color:${c}">` +
        `<div class="tt-name">${esc(d.name)}</div>` +
        `<span class="tt-badge" style="color:${c};border-color:${c}44;background:${c}1a">${label}</span>` +
        `<span class="tt-badge tt-badge-conn">${conn} shown</span>`;
      if (d.description) html += `<p class="tt-desc">${esc(d.description)}</p>`;
      html += '</div>';
      tooltipEl.innerHTML = html;
      tooltipEl.style.opacity = '1';
      moveTooltip(e);
    }

    function showLinkTooltip(e, d) {
      const sn = nodeMap[d.source.id || d.source], tn = nodeMap[d.target.id || d.target];
      const c = edgeColor(d);
      tooltipEl.innerHTML =
        `<div class="tt-inner" style="border-left-color:${c}">` +
        `<div class="tt-link-path"><span>${esc(sn?.name || '')}</span>` +
        `<span class="tt-link-arrow" style="color:${c}"> ${EDGE_LABELS[d.type] || d.type} → </span>` +
        `<span>${esc(tn?.name || '')}</span></div>` +
        (d.context ? `<p class="tt-context">${esc(d.context)}</p>` : '') +
        (d.evidenceLabel ? `<span class="tt-badge tt-badge-conn">${esc(d.evidenceLabel)}</span>` : '') +
        '</div>';
      tooltipEl.style.opacity = '1';
      moveTooltip(e);
    }

    function moveTooltip(e) {
      const rect = wrapper.getBoundingClientRect();
      tooltipEl.style.left = `${Math.min(e.clientX - rect.left + 16, rect.width - 300)}px`;
      tooltipEl.style.top = `${Math.max(e.clientY - rect.top - 10, 8)}px`;
    }
    function hideTooltip() { tooltipEl.style.opacity = '0'; }
    function esc(s) {
      return String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
    }

    /* ── Info panel ────────────────────────────────────────────── */
    function edgesFor(id) {
      return links.filter(l => (l.source.id ?? l.source) === id || (l.target.id ?? l.target) === id);
    }
    function otherEnd(l, id) {
      const s = l.source.id ?? l.source, t = l.target.id ?? l.target;
      return nodeMap[s === id ? t : s];
    }

    function showInfoPanel(d) {
      if (!infoPanelEl) return;
      const c = COLORS[clusterKey(d)];
      const label = GROUP_LABELS[clusterKey(d)] || d.type;
      const mine = edgesFor(d.id);
      const parts = [];

      parts.push(`<div class="ip-header">` +
        `<span class="ip-badge" style="color:${c};border-color:${c}44;background:${c}14">${label}</span>` +
        `<button class="ip-close" id="ip-close-btn" aria-label="Close">×</button></div>`);
      parts.push(`<h2 class="ip-name">${esc(d.name)}</h2>`);
      if (d.role || d.period) {
        parts.push(`<p class="ip-meta">${esc([d.role, d.period].filter(Boolean).join(' · '))}</p>`);
      }
      if (d.description) parts.push(`<p class="ip-desc">${esc(d.description)}</p>`);

      // Fork / upstream provenance — never imply authorship of upstream work.
      if (d.origin === 'fork' || d.upstream) {
        parts.push(`<div class="ip-provenance">` +
          `<span class="ip-prov-label">${d.origin === 'fork' ? 'Fork' : 'Builds on'}</span>` +
          `<span class="ip-prov-body">${esc(d.contributionNote || '')}` +
          (d.upstream ? ` <a href="https://github.com/${esc(d.upstream)}" target="_blank" rel="noopener noreferrer">Upstream: ${esc(d.upstream)}</a>` : '') +
          `</span></div>`);
      }
      if (d.evidenceNote) parts.push(`<p class="ip-evidence">${esc(d.evidenceNote)}</p>`);

      // Capabilities first — the primary layer.
      const caps = mine.filter(l => l.type === 'IMPLEMENTS' || l.type === 'DEMONSTRATES')
        .map(l => otherEnd(l, d.id)).filter(n => n && n.type === 'capability');
      const provenBy = d.type === 'capability'
        ? mine.filter(l => l.type === 'IMPLEMENTS' || l.type === 'DEMONSTRATES')
              .map(l => otherEnd(l, d.id)).filter(Boolean)
        : [];
      if (caps.length) parts.push(section('Capabilities demonstrated', caps));
      if (provenBy.length) parts.push(section('Proven by', provenBy));

      const techs = mine.filter(l => ['USES', 'DEPLOYED_ON', 'USED', 'IMPLEMENTED_WITH'].includes(l.type))
        .map(l => otherEnd(l, d.id)).filter(n => n && n.type === 'technology');
      if (techs.length) parts.push(section(d.type === 'capability' ? 'Implemented with' : 'Technologies', techs));

      const domains = mine.filter(l => l.type === 'TARGETS_DOMAIN')
        .map(l => otherEnd(l, d.id)).filter(n => n && n.type === 'domain');
      if (domains.length) parts.push(section('Domains', domains));

      const related = mine.filter(l => NARRATIVE.has(l.type));
      if (related.length) {
        parts.push('<div class="ip-ctx-list"><span class="ip-section-label">Connections</span>' +
          related.map(l => {
            const other = otherEnd(l, d.id);
            const dir = (l.source.id ?? l.source) === d.id ? EDGE_LABELS[l.type] : `${EDGE_LABELS[l.type]} ←`;
            return `<div class="ip-ctx-item">` +
              `<span class="ip-ctx-name" style="color:${COLORS.project}">${esc(dir)} ${esc(other?.name || '')}</span>` +
              `<span class="ip-ctx-text">${esc(l.context || '')}</span></div>`;
          }).join('') + '</div>');
      }

      // Evidence summary: strongest evidence across this node's edges.
      const labels = [...new Set(mine.map(l => l.evidenceLabel).filter(Boolean))];
      if (labels.length && d.type !== 'capability') {
        parts.push(`<p class="ip-evidence">Evidence: ${esc(labels[0].replace(' evidence', ''))}` +
          (labels.length > 1 ? ` and ${labels.length - 1} other kind${labels.length > 2 ? 's' : ''}` : '') +
          `</p>`);
      }

      // Repository links live here, not as graph clutter.
      const repos = mine.filter(l => l.type === 'HAS_REPOSITORY')
        .map(l => otherEnd(l, d.id)).filter(Boolean);
      repos.forEach(repo => {
        if (repo.url) parts.push(`<a class="ip-cta" href="${esc(repo.url)}" target="_blank" rel="noopener noreferrer">View repository <span>→</span></a>`);
        if (repo.homepage) parts.push(`<a class="ip-cta" href="${esc(repo.homepage)}" target="_blank" rel="noopener noreferrer">Live site <span>→</span></a>`);
      });

      // EXPAND — the third step of overview -> focus -> expand -> trace.
      const hidden = [...neighborsOf[d.id]].filter(id => !visible.has(id));
      if (hidden.length) {
        parts.push(`<button class="ip-expand" id="ip-expand-btn">Expand ${hidden.length} more connection${hidden.length > 1 ? 's' : ''}</button>`);
      }
      parts.push(`<button class="ip-share" id="ip-share-btn">Copy link</button>`);

      infoPanelEl.innerHTML = parts.join('');
      infoPanelEl.style.setProperty('--ip-accent', c);
      infoPanelEl.classList.add('visible');

      document.getElementById('ip-close-btn')?.addEventListener('click', ev => {
        ev.stopPropagation(); clearFocus(); hideInfoPanel();
      });
      document.getElementById('ip-expand-btn')?.addEventListener('click', ev => {
        ev.stopPropagation();
        hidden.forEach(id => expanded.add(id));
        applyVisibility();
        focusNode(d, { force: true, skipUrl: true });
      });
      const shareUrl = `${location.origin}${location.pathname}?node=${encodeURIComponent(d.id)}`;
      document.getElementById('ip-share-btn')?.addEventListener('click', ev => {
        ev.stopPropagation();
        navigator.clipboard?.writeText(shareUrl).then(() => {
          const b = ev.currentTarget, t = b.textContent;
          b.textContent = 'Copied'; setTimeout(() => { b.textContent = t; }, 1400);
        });
      });

      function section(title, list) {
        const uniq = [...new Map(list.map(n => [n.id, n])).values()];
        return `<div class="ip-tags"><span class="ip-section-label">${title}</span>` +
          uniq.map(n => {
            const col = COLORS[clusterKey(n)];
            return `<span class="ip-tag" style="color:${col};border-color:${col}44;background:${col}14">${esc(n.name)}</span>`;
          }).join('') + '</div>';
      }
    }

    function showStoryPanel(story) {
      if (!infoPanelEl) return;
      infoPanelEl.innerHTML =
        `<div class="ip-header"><span class="ip-badge" style="color:#fff;border-color:rgba(255,255,255,0.3);background:rgba(255,255,255,0.08)">Story</span>` +
        `<button class="ip-close" id="ip-close-btn" aria-label="Close">×</button></div>` +
        `<h2 class="ip-name">${esc(story.name)}</h2>` +
        `<p class="ip-desc">${esc(story.description)}</p>` +
        `<p class="ip-evidence">Click any node in the highlighted path to trace it further.</p>`;
      infoPanelEl.style.setProperty('--ip-accent', 'rgba(255,255,255,0.45)');
      infoPanelEl.classList.add('visible');
      document.getElementById('ip-close-btn')?.addEventListener('click', ev => {
        ev.stopPropagation(); clearFocus(); hideInfoPanel();
      });
    }

    function hideInfoPanel() { infoPanelEl?.classList.remove('visible'); }

    /* ── Controls ──────────────────────────────────────────────── */
    document.querySelectorAll('.eco-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.group;
        document.querySelectorAll('.eco-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        clearFocus(); hideInfoPanel(); clearSearch();
        applyVisibility(); applyFocus();
      });
    });

    document.querySelectorAll('.eco-view-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === activeView);
      btn.addEventListener('click', () => {
        activeView = btn.dataset.view;
        expanded.clear();
        document.querySelectorAll('.eco-view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        clearFocus(); hideInfoPanel(); clearSearch();
        applyVisibility(); applyFocus(); fitAll();
        setUrl({ view: activeView === 'core' ? null : activeView });
      });
    });

    const storyBar = document.getElementById('eco-story-bar');
    if (storyBar && storyModes.length) {
      storyBar.innerHTML = storyModes.map(s =>
        `<button class="eco-story-btn" data-story="${esc(s.id)}" title="${esc(s.description)}">${esc(s.name)}</button>`).join('');
      storyBar.querySelectorAll('.eco-story-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const story = storyModes.find(s => s.id === btn.dataset.story);
          if (story) focusStory(story);
        });
      });
    }

    /* ── Search over name / description / aliases ──────────────── */
    let searching = false;
    function search(q) {
      q = q.trim().toLowerCase();
      if (!q) { clearSearch(); return; }
      searching = true;
      clearFocus(true);
      const hits = new Set(nodes.filter(n => visible.has(n.id) && (
        n.name.toLowerCase().includes(q) ||
        (n.description || '').toLowerCase().includes(q) ||
        (n.aliases || []).some(a => a.toLowerCase().includes(q))
      )).map(n => n.id));
      const near = new Set(hits);
      hits.forEach(id => neighborsOf[id]?.forEach(nb => { if (visible.has(nb)) near.add(nb); }));

      node.attr('opacity', d => (!visible.has(d.id) ? 0 : hits.has(d.id) ? 1 : near.has(d.id) ? 0.3 : 0.05));
      node.select('.n-sel').attr('r', d => (hits.has(d.id) ? r(d) + 6 : 0));
      node.select('.n-label').attr('opacity', d => (hits.has(d.id) ? 1 : near.has(d.id) ? 0.25 : 0.04));
      link.attr('stroke-opacity', d => {
        const s = d.source.id ?? d.source, t = d.target.id ?? d.target;
        if (hits.has(s) && hits.has(t)) return 0.85;
        if (near.has(s) && near.has(t)) return 0.2;
        return 0.02;
      });
      const el = document.getElementById('search-count');
      if (el) {
        el.textContent = hits.size ? `${hits.size} found` : 'no match';
        el.style.color = hits.size ? 'rgba(255,255,255,0.45)' : 'rgba(255,120,120,0.75)';
      }
    }
    function clearSearch() {
      if (!searching) return;
      searching = false;
      const input = document.getElementById('eco-search');
      if (input) input.value = '';
      const el = document.getElementById('search-count');
      if (el) el.textContent = '';
      node.select('.n-sel').attr('r', 0);
      applyFocus();
    }
    document.getElementById('eco-search')?.addEventListener('input', e => search(e.target.value));

    document.getElementById('reset-graph')?.addEventListener('click', () => {
      clearFocus(); hideInfoPanel(); clearSearch();
      expanded.clear();
      activeFilter = 'all';
      document.querySelectorAll('.eco-filter').forEach(b => b.classList.remove('active'));
      document.querySelector('.eco-filter[data-group="all"]')?.classList.add('active');
      applyVisibility(); applyFocus(); fitAll();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (searching) { clearSearch(); return; }
        clearFocus(); hideInfoPanel();
      }
      if (e.key === 'f' && !e.metaKey && !e.ctrlKey && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('eco-search')?.focus();
      }
    });

    function setUrl(patch) {
      const p = new URLSearchParams(location.search);
      Object.entries(patch).forEach(([k, v]) => (v == null ? p.delete(k) : p.set(k, v)));
      const qs = p.toString();
      history.replaceState(null, '', qs ? `${location.pathname}?${qs}` : location.pathname);
    }

    new ResizeObserver(() => {
      W = wrapper.clientWidth; H = wrapper.clientHeight;
      svg.attr('width', W).attr('height', H);
      computeTargets();
      if (!reduceMotion) sim.alpha(0.15).restart();
    }).observe(wrapper);

    /* ── Boot ──────────────────────────────────────────────────── */
    applyVisibility();
    fitAll();

    const initialStory = params.get('story');
    const initialNode = params.get('node');
    if (initialStory) {
      const story = storyModes.find(s => s.id === initialStory);
      if (story) focusStory(story);
    } else if (initialNode && nodeMap[initialNode]) {
      if (!visible.has(initialNode)) { expanded.add(initialNode); applyVisibility(); }
      focusNode(nodeMap[initialNode], { skipUrl: true });
    }
  }
})();
