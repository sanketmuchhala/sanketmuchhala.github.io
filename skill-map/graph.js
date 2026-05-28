/* ═══════════════════════════════════════════════════════════════════
   Ecosystem Graph  —  D3 v7 force-directed network
   Enhanced: clustered layout, logos, experience nodes,
             link context tooltips, info panel, search, zoom-to-node
═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Color palette ──────────────────────────────────────────── */
  const COLORS = {
    project:    '#818cf8',
    language:   '#fbbf24',
    ai:         '#f472b6',
    data:       '#34d399',
    cloud:      '#38bdf8',
    tool:       '#c084fc',
    experience: '#fb923c',
  };

  const GROUP_LABELS = {
    project:    'Project',
    language:   'Language',
    ai:         'AI / ML',
    data:       'Data',
    cloud:      'Cloud',
    tool:       'Tool',
    experience: 'Experience',
  };

  /* ── Cluster center positions (as fractions of W/H) ─────────── */
  const CLUSTER = {
    experience: { x: 0.12, y: 0.46 },
    project:    { x: 0.50, y: 0.50 },
    language:   { x: 0.26, y: 0.14 },
    ai:         { x: 0.74, y: 0.14 },
    data:       { x: 0.20, y: 0.82 },
    cloud:      { x: 0.80, y: 0.82 },
    tool:       { x: 0.88, y: 0.48 },
  };

  /* ── Icon URL resolver ──────────────────────────────────────── */
  function iconUrl(icon) {
    if (!icon) return null;
    if (icon.startsWith('dv:')) {
      const n = icon.slice(3);
      return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${n}/${n}-original.svg`;
    }
    if (icon.startsWith('si:')) {
      const parts = icon.slice(3).split('/');
      return `https://cdn.simpleicons.org/${parts[0]}/${parts[1] || 'FFFFFF'}`;
    }
    return icon;
  }

  /* ── DOM refs ───────────────────────────────────────────────── */
  const wrapper     = document.getElementById('graph-wrapper');
  const tooltipEl   = document.getElementById('graph-tooltip');
  const infoPanelEl = document.getElementById('info-panel');

  /* ── Fetch data ─────────────────────────────────────────────── */
  const dataUrl = window.ECOSYSTEM_DATA_URL || '/skill-map/data.json';
  fetch(dataUrl)
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then(initGraph)
    .catch(err => {
      console.error('Ecosystem graph: data load failed —', err);
      if (wrapper) wrapper.innerHTML =
        '<p style="color:rgba(255,255,255,0.25);text-align:center;padding:5rem 2rem;font-family:system-ui">Could not load graph data.</p>';
    });

  /* ══════════════════════════════════════════════════════════════
     INIT GRAPH
  ══════════════════════════════════════════════════════════════ */
  function initGraph(raw) {
    /* ── Degree computation for node sizing ── */
    const deg = {};
    raw.nodes.forEach(n => { deg[n.id] = 0; });
    raw.links.forEach(l => {
      deg[l.source] = (deg[l.source] || 0) + 1;
      deg[l.target] = (deg[l.target] || 0) + 1;
    });

    function r(d) {
      const k = deg[d.id] || 0;
      if (d.group === 'experience') return Math.min(26, 20 + Math.max(0, k - 3) * 0.55);
      if (d.group === 'project')    return Math.min(21, 14 + Math.max(0, k - 2) * 0.50);
      return Math.min(14,  8 + Math.max(0, k - 1) * 0.85);
    }

    /* ── Mutable copies ── */
    const nodes = raw.nodes.map(d => ({ ...d }));
    const links = raw.links.map(d => ({ ...d }));

    /* ── Build lookup maps ── */
    const nodeMap = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });

    /* ── Link base style helpers (experience links are heavier) ── */
    function isExpLink(d) {
      const sn = nodeMap[d.source.id || d.source];
      const tn = nodeMap[d.target.id || d.target];
      return sn?.group === 'experience' || tn?.group === 'experience';
    }
    function linkBaseOpacity(d) { return isExpLink(d) ? 0.42 : 0.28; }
    function linkBaseWidth(d)   { return isExpLink(d) ? 1.6  : 1.1;  }

    /* ── Dimensions ── */
    let W = wrapper.clientWidth;
    let H = wrapper.clientHeight;

    /* ── Seed node positions near cluster centers ── */
    nodes.forEach(n => {
      const c = CLUSTER[n.group] || { x: 0.5, y: 0.5 };
      n.x = c.x * W + (Math.random() - 0.5) * 90;
      n.y = c.y * H + (Math.random() - 0.5) * 90;
    });

    /* ── Force simulation (stopped initially) ── */
    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id(d => d.id)
        .distance(d => {
          const se = d.source.group === 'experience', te = d.target.group === 'experience';
          const sp = d.source.group === 'project',    tp = d.target.group === 'project';
          if (se || te) return 120;
          if (sp || tp) return 82;
          return 55;
        })
        .strength(0.32)
      )
      .force('charge', d3.forceManyBody()
        .strength(d => ({experience: -550, project: -420}[d.group] || -130))
      )
      .force('center', d3.forceCenter(W / 2, H / 2).strength(0.03))
      .force('collision', d3.forceCollide().radius(d => r(d) + 18).strength(0.88))
      .force('cluster', clusterForce)
      .velocityDecay(0.42)
      .stop();

    function clusterForce(alpha) {
      nodes.forEach(n => {
        const c = CLUSTER[n.group];
        if (!c) return;
        const strength = (n.group === 'project' || n.group === 'experience') ? 0.038 : 0.06;
        n.vx += (c.x * W - n.x) * alpha * strength;
        n.vy += (c.y * H - n.y) * alpha * strength;
      });
    }

    /* ── Pre-tick 140 iterations ── */
    for (let i = 0; i < 140; i++) sim.tick();

    /* ── SVG setup ── */
    const svg = d3.select('#skill-graph').attr('width', W).attr('height', H)
      .style('touch-action', 'none');

    /* ── Defs ── */
    const defs = svg.append('defs');

    /* Glass sheen */
    const sheen = defs.append('linearGradient')
      .attr('id', 'node-sheen').attr('x1','0%').attr('y1','0%').attr('x2','0%').attr('y2','100%');
    sheen.append('stop').attr('offset','0%').attr('stop-color','#fff').attr('stop-opacity', 0.12);
    sheen.append('stop').attr('offset','55%').attr('stop-color','#fff').attr('stop-opacity', 0.02);
    sheen.append('stop').attr('offset','100%').attr('stop-color','#000').attr('stop-opacity', 0.10);

    /* Node hover glow */
    const hgf = defs.append('filter').attr('id','node-glow')
      .attr('x','-60%').attr('y','-60%').attr('width','220%').attr('height','220%');
    hgf.append('feGaussianBlur').attr('in','SourceGraphic').attr('stdDeviation','3.5').attr('result','b');
    const hm = hgf.append('feMerge');
    hm.append('feMergeNode').attr('in','b');
    hm.append('feMergeNode').attr('in','b');
    hm.append('feMergeNode').attr('in','SourceGraphic');

    /* Link glow — blurred halo BEHIND crisp line */
    const lgf = defs.append('filter').attr('id','link-glow')
      .attr('x','-15%').attr('y','-400%').attr('width','130%').attr('height','900%');
    lgf.append('feGaussianBlur').attr('in','SourceGraphic').attr('stdDeviation','2.5').attr('result','gblur');
    const lgm = lgf.append('feMerge');
    lgm.append('feMergeNode').attr('in','gblur');
    lgm.append('feMergeNode').attr('in','SourceGraphic');

    /* Experience node gradient */
    const expGrad = defs.append('radialGradient').attr('id','exp-grad')
      .attr('cx','38%').attr('cy','30%').attr('r','68%');
    expGrad.append('stop').attr('offset','0%').attr('stop-color','#fed7aa').attr('stop-opacity',0.18);
    expGrad.append('stop').attr('offset','100%').attr('stop-color',COLORS.experience).attr('stop-opacity',0.06);

    /* ── Black background ── */
    svg.append('rect').attr('width','100%').attr('height','100%').attr('fill','#000');

    /* ── Zoom / pan ── */
    const g = svg.append('g').attr('class','zoom-g');
    const zoom = d3.zoom().scaleExtent([0.12, 8])
      .on('zoom', e => g.attr('transform', e.transform));
    svg.call(zoom);
    svg.on('click', e => {
      if (e.target === svg.node() || e.target.tagName === 'rect') {
        clearHighlight();
        hideInfoPanel();
      }
    });

    /* ── Auto-fit to pre-ticked positions ── */
    (function fitToView() {
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      nodes.forEach(n => {
        const pad = r(n) + 22;
        x0 = Math.min(x0, n.x - pad); x1 = Math.max(x1, n.x + pad);
        y0 = Math.min(y0, n.y - pad); y1 = Math.max(y1, n.y + pad);
      });
      const scale = Math.min((W / (x1 - x0)), (H / (y1 - y0))) * 0.90;
      const tx = (W - scale * (x0 + x1)) / 2;
      const ty = (H - scale * (y0 + y1)) / 2;
      svg.call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
    })();

    /* ════════════════════════════════════════════════════════════
       LINKS
    ════════════════════════════════════════════════════════════ */
    const linkG = g.append('g').attr('class', 'eco-links');

    const link = linkG.selectAll('line.eco-link')
      .data(links).join('line').attr('class', 'eco-link')
      .attr('stroke', d => {
        const sn = nodeMap[d.source.id || d.source];
        const tn = nodeMap[d.target.id || d.target];
        const tech = (sn && sn.group !== 'project' && sn.group !== 'experience') ? sn : tn;
        return COLORS[(tech && tech.group) || 'tool'];
      })
      .attr('stroke-opacity', d => linkBaseOpacity(d))
      .attr('stroke-width',   d => linkBaseWidth(d))
      .attr('stroke-linecap', 'round')
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y);

    /* Invisible hit-area lines for link hover (only links with context) */
    const linkHit = linkG.selectAll('line.eco-link-hit')
      .data(links.filter(l => l.context)).join('line').attr('class', 'eco-link-hit')
      .attr('stroke', 'transparent')
      .attr('stroke-width', 10)
      .style('cursor', 'crosshair')
      .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y);

    linkHit
      .on('mouseenter', (e, d) => showLinkTooltip(e, d))
      .on('mousemove',  e        => moveTooltip(e))
      .on('mouseleave', ()       => hideTooltip());

    /* ════════════════════════════════════════════════════════════
       NODES
    ════════════════════════════════════════════════════════════ */
    const nodeG = g.append('g').attr('class', 'eco-nodes');

    const node = nodeG.selectAll('g.eco-node')
      .data(nodes).join('g').attr('class', 'eco-node')
      .style('cursor', 'pointer')
      .attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`)
      .call(makeDrag(sim));

    /* Selection ring */
    node.append('circle').attr('class', 'n-sel')
      .attr('r', 0).attr('fill', 'none')
      .attr('stroke', d => COLORS[d.group])
      .attr('stroke-width', 1.2).attr('stroke-opacity', 0.8)
      .attr('pointer-events', 'none');

    /* Outer dashed ring for project + experience nodes */
    node.filter(d => d.group === 'project' || d.group === 'experience')
      .append('circle').attr('class', 'n-ring')
      .attr('r', d => r(d) + 5.5)
      .attr('fill', 'none')
      .attr('stroke', d => COLORS[d.group])
      .attr('stroke-width', d => d.group === 'experience' ? 0.8 : 0.55)
      .attr('stroke-opacity', d => d.group === 'experience' ? 0.35 : 0.18)
      .attr('stroke-dasharray', d => d.group === 'experience' ? '3 2.5' : '2 3.5');

    /* Experience node: extra outer glow fill */
    node.filter(d => d.group === 'experience')
      .append('circle').attr('class', 'n-exp-bg')
      .attr('r', d => r(d))
      .attr('fill', 'url(#exp-grad)')
      .attr('pointer-events', 'none');

    /* Base circle */
    node.append('circle').attr('class', 'n-base')
      .attr('r', 0)
      .attr('fill', d => COLORS[d.group])
      .attr('fill-opacity', d => ({ experience: 0.16, project: 0.12 }[d.group] || 0.11))
      .attr('stroke', d => COLORS[d.group])
      .attr('stroke-width', d => ({ experience: 1.8, project: 1.5 }[d.group] || 1.1))
      .attr('stroke-opacity', d => ({ experience: 0.75, project: 0.65 }[d.group] || 0.55));

    /* Glass sheen overlay */
    node.append('circle').attr('class', 'n-sheen')
      .attr('r', 0).attr('fill', 'url(#node-sheen)').attr('pointer-events', 'none');

    /* ── Entrance animation ── */
    const entry = node.transition()
      .delay((d, i) => 40 + i * 9)
      .duration(520).ease(d3.easeBackOut.overshoot(1.05));
    entry.select('.n-base').attr('r', d => r(d));
    entry.select('.n-sheen').attr('r', d => r(d));

    /* ── Tech logos (SVG image) ── */
    node.filter(d => d.icon).each(function(d) {
      const url = iconUrl(d.icon);
      if (!url) return;
      const size = r(d) * 1.05;
      const img = d3.select(this).append('image')
        .attr('class', 'n-icon')
        .attr('href', url)
        .attr('width',  size).attr('height', size)
        .attr('x', -size / 2).attr('y', -size / 2)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('opacity', 0)
        .attr('pointer-events', 'none');
      img.on('error', function() { d3.select(this).remove(); });
      img.transition()
        .delay(350 + nodes.indexOf(d) * 9)
        .duration(300)
        .attr('opacity', 0.82);
    });

    /* ── Experience nodes: Font Awesome briefcase icon ── */
    node.filter(d => d.group === 'experience')
      .append('text').attr('class', 'n-exp-icon')
      .attr('font-family', '"Font Awesome 6 Free"')
      .attr('font-weight', '900')
      .attr('font-size', d => `${Math.round(r(d) * 0.58)}px`)
      .attr('fill', COLORS.experience)
      .attr('fill-opacity', 0.72)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('dy', d => `-${r(d) * 0.08}px`)
      .attr('pointer-events', 'none')
      .text('');

    /* ── Label ── */
    node.append('text').attr('class', 'n-label')
      .attr('text-anchor', 'middle')
      .attr('dy', d => r(d) + 14)
      .attr('font-family', "'Bricolage Grotesque', system-ui, sans-serif")
      .attr('font-size', d => ({ experience: '13px', project: '11.5px' }[d.group] || '10px'))
      .attr('font-weight', d => d.group === 'experience' ? '700' : (d.group === 'project' ? '600' : '500'))
      .attr('fill', d => ({
        experience: 'rgba(255,255,255,0.92)',
        project:    'rgba(255,255,255,0.88)',
      }[d.group] || 'rgba(255,255,255,0.58)'))
      .attr('pointer-events', 'none')
      .attr('opacity', 0)
      .text(d => d.name)
      .transition()
      .delay((d, i) => 280 + i * 9)
      .duration(380)
      .attr('opacity', d => ({ experience: 1, project: 1 }[d.group] || 0.78));

    /* ════════════════════════════════════════════════════════════
       TICK
    ════════════════════════════════════════════════════════════ */
    sim.on('tick', () => {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      linkHit.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
             .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`);
      node.select('.n-label').attr('dy', d => r(d) + 14);
    });

    /* Resume simulation with low alpha for final settling */
    sim.alpha(0.08).restart();

    /* ════════════════════════════════════════════════════════════
       HIGHLIGHT STATE
    ════════════════════════════════════════════════════════════ */
    let activeId   = null;
    let activeNbrs = new Set();

    function setHighlight(d) {
      if (activeId === d.id) { clearHighlight(); return; }
      activeId   = d.id;
      activeNbrs = new Set([d.id]);
      links.forEach(l => {
        const s = l.source.id ?? l.source;
        const t = l.target.id ?? l.target;
        if (s === d.id) activeNbrs.add(t);
        if (t === d.id) activeNbrs.add(s);
      });
      applyHighlight();
      showInfoPanel(d);
      zoomToNeighborhood();
    }

    function clearHighlight() {
      activeId = null; activeNbrs = new Set();
      applyHighlight();
    }

    function applyHighlight() {
      const on = activeId !== null;

      /* Compute second-hop neighbors (neighbors-of-neighbors) */
      const secondHop = new Set();
      if (on) {
        links.forEach(l => {
          const s = l.source.id ?? l.source, t = l.target.id ?? l.target;
          if (activeNbrs.has(s) && !activeNbrs.has(t)) secondHop.add(t);
          if (activeNbrs.has(t) && !activeNbrs.has(s)) secondHop.add(s);
        });
      }

      const active = d => !on || activeNbrs.has(d.id);

      node.select('.n-sel').transition().duration(180)
        .attr('r', d => on && d.id === activeId ? r(d) + 7 : 0);

      node.select('.n-base')
        .attr('fill-opacity', d => {
          if (!on) return { experience: 0.16, project: 0.12 }[d.group] || 0.11;
          if (activeNbrs.has(d.id)) return { experience: 0.16, project: 0.12 }[d.group] || 0.11;
          return 0.02;
        })
        .attr('stroke-opacity', d => {
          if (!on) return { experience: 0.75, project: 0.65 }[d.group] || 0.55;
          if (activeNbrs.has(d.id)) return { experience: 0.75, project: 0.65 }[d.group] || 0.55;
          return 0.07;
        });
      node.select('.n-ring')
        .attr('stroke-opacity', d => active(d) ? (d.group === 'experience' ? 0.38 : 0.22) : 0.03);
      node.select('.n-sheen')
        .attr('opacity', d => active(d) ? 1 : 0.05);
      node.select('.n-icon')
        .attr('opacity', d => active(d) ? 0.84 : 0.06);
      node.select('.n-exp-icon')
        .attr('fill-opacity', d => active(d) ? 0.75 : 0.08);
      node.select('.n-label')
        .attr('opacity', d => {
          if (!on) return { experience: 1, project: 1 }[d.group] || 0.78;
          if (activeNbrs.has(d.id)) return 1;
          if (secondHop.has(d.id)) return 0.22;
          return 0.05;
        });

      /* Node group opacity for second-hop */
      node.attr('opacity', d => {
        if (!on) return null;
        if (activeNbrs.has(d.id)) return 1;
        if (secondHop.has(d.id)) return 0.38;
        return 0.06;
      });

      link
        .attr('stroke-opacity', d => {
          if (!on) return linkBaseOpacity(d);
          const s = d.source.id ?? d.source, t = d.target.id ?? d.target;
          if (activeNbrs.has(s) && activeNbrs.has(t)) return 0.92;
          if ((activeNbrs.has(s) && secondHop.has(t)) || (activeNbrs.has(t) && secondHop.has(s))) return 0.14;
          return 0.04;
        })
        .attr('stroke-width', d => {
          if (!on) return linkBaseWidth(d);
          const s = d.source.id ?? d.source, t = d.target.id ?? d.target;
          return activeNbrs.has(s) && activeNbrs.has(t) ? 2.2 : linkBaseWidth(d);
        })
        .attr('filter', d => {
          if (!on) return null;
          const s = d.source.id ?? d.source, t = d.target.id ?? d.target;
          return activeNbrs.has(s) && activeNbrs.has(t) ? 'url(#link-glow)' : null;
        });
    }

    /* ── Zoom to active neighborhood ── */
    function zoomToNeighborhood() {
      const nbrs = [...activeNbrs].map(id => nodeMap[id]).filter(n => n?.x != null);
      if (nbrs.length < 2) return;
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      nbrs.forEach(n => {
        const pad = r(n) + 32;
        x0 = Math.min(x0, n.x - pad); x1 = Math.max(x1, n.x + pad);
        y0 = Math.min(y0, n.y - pad); y1 = Math.max(y1, n.y + pad);
      });
      const scale = Math.min(W / (x1 - x0), H / (y1 - y0)) * 0.82;
      const tx = (W - scale * (x0 + x1)) / 2;
      const ty = (H - scale * (y0 + y1)) / 2;
      svg.transition().duration(500).ease(d3.easeQuadOut)
        .call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
    }

    /* ════════════════════════════════════════════════════════════
       MOUSE EVENTS
    ════════════════════════════════════════════════════════════ */
    node
      .on('mouseenter', (e, d) => {
        showNodeTooltip(e, d);
        const nd = d3.select(e.currentTarget), rad = r(d);
        nd.select('.n-base').transition().duration(100)
          .attr('r', rad + 2.5)
          .attr('fill-opacity', d.group === 'experience' ? 0.22 : 0.17);
        nd.select('.n-sheen').transition().duration(100).attr('r', rad + 2.5);
        nd.select('.n-ring').transition().duration(100).attr('r', rad + 8);
        nd.select('.n-label').attr('opacity', 1);
        nd.raise();
      })
      .on('mousemove',  e       => moveTooltip(e))
      .on('mouseleave', (e, d) => {
        hideTooltip();
        const nd = d3.select(e.currentTarget), rad = r(d);
        const on = activeId !== null, dim = on && !activeNbrs.has(d.id);
        nd.select('.n-base').transition().duration(200)
          .attr('r', rad)
          .attr('fill-opacity', dim ? 0.015 : (d.group === 'experience' ? 0.14 : 0.09));
        nd.select('.n-sheen').transition().duration(200).attr('r', rad);
        nd.select('.n-ring').transition().duration(200).attr('r', rad + 5.5);
        nd.select('.n-label').attr('opacity', dim ? 0.04 : ({ experience: 1, project: 1 }[d.group] || 0.78));
      })
      .on('click', (e, d) => { e.stopPropagation(); setHighlight(d); });

    /* ════════════════════════════════════════════════════════════
       TOOLTIPS
    ════════════════════════════════════════════════════════════ */
    function showNodeTooltip(e, d) {
      const label = GROUP_LABELS[d.group] || d.group;
      const c     = COLORS[d.group];
      const conn  = links.filter(l =>
        (l.source.id||l.source) === d.id || (l.target.id||l.target) === d.id
      ).length;
      let html =
        `<div class="tt-inner" style="border-left-color:${c}">` +
        `<div class="tt-name">${d.name}</div>` +
        `<span class="tt-badge" style="color:${c};border-color:${c}44;background:${c}1a">${label}</span>` +
        `<span class="tt-badge tt-badge-conn">${conn} connection${conn !== 1 ? 's' : ''}</span>`;
      if (d.desc) html += `<p class="tt-desc">${d.desc}</p>`;
      html += `</div>`;
      tooltipEl.innerHTML = html;
      tooltipEl.style.opacity = '1';
      moveTooltip(e);
    }

    function showLinkTooltip(e, d) {
      const sn  = nodeMap[d.source.id || d.source];
      const tn  = nodeMap[d.target.id || d.target];
      const tech = (sn && sn.group !== 'project' && sn.group !== 'experience') ? sn : tn;
      const proj = tech === sn ? tn : sn;
      const c   = COLORS[(tech && tech.group) || 'tool'];
      const html =
        `<div class="tt-inner" style="border-left-color:${c}">` +
        `<div class="tt-link-path">` +
        `<span class="tt-link-src">${proj?.name || ''}</span>` +
        `<span class="tt-link-arrow" style="color:${c}"> ⟶ </span>` +
        `<span class="tt-link-tgt">${tech?.name || ''}</span>` +
        `</div>` +
        `<p class="tt-context">${d.context}</p>` +
        `</div>`;
      tooltipEl.innerHTML = html;
      tooltipEl.style.opacity = '1';
      moveTooltip(e);
    }

    function moveTooltip(e) {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left + 16;
      const y = e.clientY - rect.top  - 10;
      tooltipEl.style.left = `${Math.min(x, rect.width  - 280)}px`;
      tooltipEl.style.top  = `${Math.max(y, 8)}px`;
    }
    function hideTooltip() { tooltipEl.style.opacity = '0'; }

    /* ════════════════════════════════════════════════════════════
       INFO PANEL
    ════════════════════════════════════════════════════════════ */
    function showInfoPanel(d) {
      if (!infoPanelEl) return;
      const c = COLORS[d.group];
      const label = GROUP_LABELS[d.group] || d.group;

      /* Gather connected nodes */
      const connLinks = links.filter(l =>
        (l.source.id||l.source) === d.id || (l.target.id||l.target) === d.id
      );
      const connNodes = connLinks.map(l => {
        const oid = (l.source.id||l.source) === d.id ? (l.target.id||l.target) : (l.source.id||l.source);
        return nodeMap[oid];
      }).filter(Boolean);

      /* Tags */
      let tagHtml = '';
      if (connNodes.length) {
        tagHtml = '<div class="ip-tags">' +
          connNodes.slice(0, 12).map(n =>
            `<span class="ip-tag" style="color:${COLORS[n.group]};border-color:${COLORS[n.group]}44;background:${COLORS[n.group]}14">${n.name}</span>`
          ).join('') +
          (connNodes.length > 12 ? `<span class="ip-tag-more">+${connNodes.length - 12}</span>` : '') +
          '</div>';
      }

      /* Context links — surface the "why" */
      const ctxLinks = connLinks
        .filter(l => l.context)
        .slice(0, 5)
        .map(l => {
          const oid = (l.source.id||l.source) === d.id ? (l.target.id||l.target) : (l.source.id||l.source);
          const nbr = nodeMap[oid];
          return { name: nbr?.name || oid, ctx: l.context, color: COLORS[nbr?.group || 'tool'] };
        });

      let ctxHtml = '';
      if (ctxLinks.length) {
        ctxHtml = '<div class="ip-ctx-list">' +
          ctxLinks.map(cl =>
            `<div class="ip-ctx-item">` +
            `<span class="ip-ctx-name" style="color:${cl.color}">${cl.name}</span>` +
            `<span class="ip-ctx-text">${cl.ctx}</span>` +
            `</div>`
          ).join('') +
          '</div>';
      }

      const linkHtml = d.url
        ? `<a class="ip-cta" href="${d.url}" target="_blank" rel="noopener noreferrer">View project <span>→</span></a>` : '';

      infoPanelEl.innerHTML =
        `<div class="ip-header">` +
          `<span class="ip-badge" style="color:${c};border-color:${c}44;background:${c}14">${label}</span>` +
          `<button class="ip-close" id="ip-close-btn">×</button>` +
        `</div>` +
        `<h2 class="ip-name">${d.name}</h2>` +
        (d.desc   ? `<p class="ip-desc">${d.desc}</p>` : '') +
        (d.detail ? `<p class="ip-detail">${d.detail}</p>` : '') +
        tagHtml +
        ctxHtml +
        linkHtml;

      infoPanelEl.style.setProperty('--ip-accent', c);
      infoPanelEl.classList.add('visible');

      document.getElementById('ip-close-btn')?.addEventListener('click', e => {
        e.stopPropagation();
        clearHighlight();
        hideInfoPanel();
      });
    }

    function hideInfoPanel() {
      infoPanelEl?.classList.remove('visible');
    }

    /* ════════════════════════════════════════════════════════════
       DRAG
    ════════════════════════════════════════════════════════════ */
    function makeDrag(simulation) {
      return d3.drag()
        .on('start', (e, d) => {
          if (!e.active) simulation.alphaTarget(0.25).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on('end',   (e, d) => {
          if (!e.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        });
    }

    /* ════════════════════════════════════════════════════════════
       GROUP FILTER
    ════════════════════════════════════════════════════════════ */
    let activeFilter = 'all';

    document.querySelectorAll('.eco-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.group;
        document.querySelectorAll('.eco-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        clearHighlight();
        hideInfoPanel();
        clearSearch();
        applyFilter();
      });
    });

    function applyFilter() {
      const all     = activeFilter === 'all';
      const visible = new Set(
        nodes.filter(n => all || n.group === activeFilter).map(n => n.id)
      );
      if (!all && activeFilter !== 'project' && activeFilter !== 'experience') {
        links.forEach(l => {
          const s = l.source.id ?? l.source, t = l.target.id ?? l.target;
          const sn = nodeMap[s], tn = nodeMap[t];
          if (sn?.group === activeFilter && (tn?.group === 'project' || tn?.group === 'experience')) visible.add(t);
          if (tn?.group === activeFilter && (sn?.group === 'project' || sn?.group === 'experience')) visible.add(s);
        });
      }

      node.attr('opacity', d => visible.has(d.id) ? 1 : 0.03)
          .attr('pointer-events', d => visible.has(d.id) ? 'all' : 'none');
      link.attr('opacity', d => {
        const s = d.source.id ?? d.source, t = d.target.id ?? d.target;
        return visible.has(s) && visible.has(t) ? 1 : 0.02;
      });
      linkHit.attr('pointer-events', d => {
        const s = d.source.id ?? d.source, t = d.target.id ?? d.target;
        return visible.has(s) && visible.has(t) ? 'all' : 'none';
      });

      const $ = id => document.getElementById(id);
      const vP = [...visible].filter(id => id.startsWith('p-')).length;
      const vT = [...visible].filter(id => id.startsWith('t-')).length;
      const vE = [...visible].filter(id => id.startsWith('e-')).length;
      const vL = links.filter(l => {
        const s = l.source.id??l.source, t = l.target.id??l.target;
        return visible.has(s) && visible.has(t);
      }).length;
      if ($('stat-projects')) $('stat-projects').textContent = vP;
      if ($('stat-tech'))     $('stat-tech').textContent     = vT;
      if ($('stat-links'))    $('stat-links').textContent    = vL;
      if ($('stat-exp'))      $('stat-exp').textContent      = vE;
    }

    /* ════════════════════════════════════════════════════════════
       SEARCH
    ════════════════════════════════════════════════════════════ */
    let searchActive = false;

    function filterBySearch(query) {
      const q = query.trim().toLowerCase();
      if (!q) { clearSearch(); return; }

      searchActive = true;
      clearHighlight();

      const matches = new Set(nodes.filter(n => n.name.toLowerCase().includes(q)).map(n => n.id));

      /* Also include direct neighbors of matched nodes */
      const matchAndNeighbors = new Set(matches);
      links.forEach(l => {
        const s = l.source.id ?? l.source, t = l.target.id ?? l.target;
        if (matches.has(s)) matchAndNeighbors.add(t);
        if (matches.has(t)) matchAndNeighbors.add(s);
      });

      node.attr('opacity', d => matches.has(d.id) ? 1 : (matchAndNeighbors.has(d.id) ? 0.35 : 0.05))
          .attr('pointer-events', 'all');
      node.select('.n-base')
        .attr('stroke-width', d => matches.has(d.id)
          ? ({ experience: 2.5, project: 2.2 }[d.group] || 2.0)
          : ({ experience: 1.8, project: 1.5 }[d.group] || 1.1))
        .attr('stroke-opacity', d => matches.has(d.id) ? 0.95 : 0.18);
      node.select('.n-sel').attr('r', d => matches.has(d.id) ? r(d) + 5 : 0);
      node.select('.n-label').attr('opacity', d => matches.has(d.id) ? 1 : (matchAndNeighbors.has(d.id) ? 0.28 : 0.04));

      link.attr('opacity', d => {
        const s = d.source.id ?? d.source, t = d.target.id ?? d.target;
        if (matches.has(s) && matches.has(t)) return 0.8;
        if (matchAndNeighbors.has(s) && matchAndNeighbors.has(t)) return 0.25;
        return 0.03;
      });

      const countEl = document.getElementById('search-count');
      if (countEl) {
        countEl.textContent = matches.size ? `${matches.size} found` : 'no match';
        countEl.style.color = matches.size ? 'rgba(255,255,255,0.45)' : 'rgba(255,100,100,0.7)';
      }
    }

    function clearSearch() {
      if (!searchActive) return;
      searchActive = false;
      const input = document.getElementById('eco-search');
      if (input) input.value = '';
      const countEl = document.getElementById('search-count');
      if (countEl) countEl.textContent = '';
      node.select('.n-base')
        .attr('stroke-width', d => ({ experience: 1.8, project: 1.5 }[d.group] || 1.1))
        .attr('stroke-opacity', d => ({ experience: 0.75, project: 0.65 }[d.group] || 0.55));
      node.select('.n-sel').attr('r', 0);
      applyFilter();
    }

    document.getElementById('eco-search')?.addEventListener('input', e => {
      filterBySearch(e.target.value);
    });

    /* ════════════════════════════════════════════════════════════
       RESET
    ════════════════════════════════════════════════════════════ */
    document.getElementById('reset-graph')?.addEventListener('click', () => {
      clearHighlight(); hideInfoPanel(); clearSearch();
      activeFilter = 'all';
      document.querySelectorAll('.eco-filter').forEach(b => b.classList.remove('active'));
      document.querySelector('.eco-filter[data-group="all"]')?.classList.add('active');
      applyFilter();
      svg.transition().duration(680).ease(d3.easeCubicOut)
        .call(zoom.transform, d3.zoomIdentity);
    });

    /* ════════════════════════════════════════════════════════════
       KEYBOARD SHORTCUTS
    ════════════════════════════════════════════════════════════ */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (searchActive) { clearSearch(); return; }
        clearHighlight(); hideInfoPanel();
      }
      if (e.key === 'f' && !e.metaKey && !e.ctrlKey && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('eco-search')?.focus();
      }
    });

    /* ════════════════════════════════════════════════════════════
       RESIZE
    ════════════════════════════════════════════════════════════ */
    new ResizeObserver(() => {
      W = wrapper.clientWidth; H = wrapper.clientHeight;
      svg.attr('width', W).attr('height', H);
      sim.force('center', d3.forceCenter(W/2, H/2).strength(0.03));
      sim.alpha(0.12).restart();
    }).observe(wrapper);

    /* Initial stats */
    applyFilter();
  }

})();
