/* ═══════════════════════════════════════════════════════════════
   Ecosystem Graph — D3 v7 force-directed network
   Loaded by skill-map/index.html after D3 CDN script
   Data source: window.ECOSYSTEM_DATA_URL (set by index.html)
═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Color palette by group ─────────────────────────────────── */
  const COLORS = {
    project:  '#818cf8',
    language: '#fbbf24',
    ai:       '#f472b6',
    data:     '#34d399',
    cloud:    '#38bdf8',
    tool:     '#c084fc',
  };

  const GROUP_LABELS = {
    project:  'Project',
    language: 'Language',
    ai:       'AI / ML',
    data:     'Data',
    cloud:    'Cloud',
    tool:     'Tool',
  };

  /* ── DOM refs ───────────────────────────────────────────────── */
  const wrapper   = document.getElementById('graph-wrapper');
  const tooltipEl = document.getElementById('graph-tooltip');

  /* ── Fetch graph data ───────────────────────────────────────── */
  const dataUrl = window.ECOSYSTEM_DATA_URL || '/skill-map/data.json';
  fetch(dataUrl)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then(initGraph)
    .catch(err => {
      console.error('Ecosystem graph: failed to load data —', err);
      if (wrapper) wrapper.innerHTML =
        '<p style="color:rgba(255,255,255,0.25);text-align:center;padding:5rem 2rem;font-family:system-ui">' +
        'Could not load graph data.</p>';
    });

  /* ══════════════════════════════════════════════════════════════
     INIT GRAPH
  ══════════════════════════════════════════════════════════════ */
  function initGraph(graphData) {

    /* ── Pre-compute connection degree for node sizing ── */
    const deg = {};
    graphData.nodes.forEach(n => { deg[n.id] = 0; });
    graphData.links.forEach(l => {
      deg[l.source] = (deg[l.source] || 0) + 1;
      deg[l.target] = (deg[l.target] || 0) + 1;
    });

    /* Node radius: scales with degree, capped per group */
    function r(d) {
      const k = deg[d.id] || 0;
      if (d.group === 'project') return Math.min(20, 13 + Math.max(0, k - 2) * 0.55);
      return Math.min(12, 5 + Math.max(0, k - 1) * 0.90);
    }

    /* ── Mutable data copies for simulation ── */
    const nodes = graphData.nodes.map(d => ({ ...d }));
    const links = graphData.links.map(d => ({ ...d }));

    /* ── Dimensions ── */
    let W = wrapper.clientWidth;
    let H = wrapper.clientHeight;

    /* ── SVG ── */
    const svg = d3.select('#skill-graph')
      .attr('width', W)
      .attr('height', H);

    /* ── Defs ──────────────────────────────────────────────────── */
    const defs = svg.append('defs');

    /* Subtle top-lit linear gradient for all nodes (glass sheen) */
    const sheen = defs.append('linearGradient')
      .attr('id', 'node-sheen')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    sheen.append('stop').attr('offset', '0%')
      .attr('stop-color', '#fff').attr('stop-opacity', 0.13);
    sheen.append('stop').attr('offset', '55%')
      .attr('stop-color', '#fff').attr('stop-opacity', 0.02);
    sheen.append('stop').attr('offset', '100%')
      .attr('stop-color', '#000').attr('stop-opacity', 0.10);

    /* Glow filter — hover */
    const gf = defs.append('filter')
      .attr('id', 'node-glow')
      .attr('x', '-60%').attr('y', '-60%')
      .attr('width', '220%').attr('height', '220%');
    gf.append('feGaussianBlur')
      .attr('in', 'SourceGraphic').attr('stdDeviation', '4').attr('result', 'b');
    const gfm = gf.append('feMerge');
    gfm.append('feMergeNode').attr('in', 'b');
    gfm.append('feMergeNode').attr('in', 'b');
    gfm.append('feMergeNode').attr('in', 'SourceGraphic');

    /* Glow filter — active link */
    const lf = defs.append('filter')
      .attr('id', 'link-glow')
      .attr('x', '-10%').attr('y', '-300%')
      .attr('width', '120%').attr('height', '700%');
    lf.append('feGaussianBlur')
      .attr('in', 'SourceGraphic').attr('stdDeviation', '1.8');

    /* ── Black background rect ── */
    svg.append('rect').attr('width', '100%').attr('height', '100%').attr('fill', '#000');

    /* ── Zoom / pan group ── */
    const g = svg.append('g').attr('class', 'zoom-g');

    const zoom = d3.zoom()
      .scaleExtent([0.15, 7])
      .on('zoom', e => g.attr('transform', e.transform));
    svg.call(zoom);
    svg.on('click', e => {
      if (e.target === svg.node() || e.target.tagName === 'rect') clearHighlight();
    });

    /* ── Force simulation ── */
    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id(d => d.id)
        .distance(d => {
          const pp = d.source.group === 'project' && d.target.group === 'project';
          return pp ? 260 : 88;
        })
        .strength(0.36)
      )
      .force('charge', d3.forceManyBody()
        .strength(d => d.group === 'project' ? -480 : -140)
      )
      .force('center', d3.forceCenter(W / 2, H / 2).strength(0.04))
      .force('collision', d3.forceCollide()
        .radius(d => r(d) + 20)
        .strength(0.88)
      )
      .velocityDecay(0.40);

    /* ══════════════════════════════════════════════════════════
       LINKS
    ══════════════════════════════════════════════════════════ */
    const linkG = g.append('g').attr('class', 'eco-links');

    /* Pre-resolve node map for link coloring */
    const nodeMap = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });

    const link = linkG.selectAll('line')
      .data(links).join('line')
      .attr('stroke', d => {
        const sn = nodeMap[d.source.id || d.source];
        const tn = nodeMap[d.target.id || d.target];
        const tech = (sn && sn.group !== 'project') ? sn : tn;
        return COLORS[(tech && tech.group) || 'tool'];
      })
      .attr('stroke-opacity', 0.13)
      .attr('stroke-width', 0.85)
      .attr('stroke-linecap', 'round');

    /* ══════════════════════════════════════════════════════════
       NODES
    ══════════════════════════════════════════════════════════ */
    const nodeG = g.append('g').attr('class', 'eco-nodes');

    const node = nodeG.selectAll('g.eco-node')
      .data(nodes).join('g')
      .attr('class', 'eco-node')
      .style('cursor', 'pointer')
      .call(makeDrag(sim));

    /* ── Dashed outer ring: project nodes only ── */
    node.filter(d => d.group === 'project')
      .append('circle')
      .attr('class', 'n-ring')
      .attr('r', d => r(d) + 5)
      .attr('fill', 'none')
      .attr('stroke', d => COLORS[d.group])
      .attr('stroke-width', 0.6)
      .attr('stroke-opacity', 0.20)
      .attr('stroke-dasharray', '2 3.5');

    /* ── Base circle: colored fill ── */
    node.append('circle')
      .attr('class', 'n-base')
      .attr('r', 0)                              /* entrance: starts at 0 */
      .attr('fill', d => COLORS[d.group])
      .attr('fill-opacity', 0.10)
      .attr('stroke', d => COLORS[d.group])
      .attr('stroke-width', d => d.group === 'project' ? 1.4 : 0.9)
      .attr('stroke-opacity', 0.55);

    /* ── Glass sheen overlay ── */
    node.append('circle')
      .attr('class', 'n-sheen')
      .attr('r', 0)
      .attr('fill', 'url(#node-sheen)')
      .attr('pointer-events', 'none');

    /* ── Entrance animation ── */
    const entrance = node.transition()
      .delay((d, i) => 55 + i * 11)
      .duration(500)
      .ease(d3.easeBackOut.overshoot(1.08));
    entrance.select('.n-base').attr('r', d => r(d));
    entrance.select('.n-sheen').attr('r', d => r(d));

    /* ── Label ── */
    node.append('text')
      .attr('class', 'n-label')
      .attr('text-anchor', 'middle')
      .attr('dy', d => r(d) + 11)
      .attr('font-family', "'Bricolage Grotesque', system-ui, sans-serif")
      .attr('font-size', d => d.group === 'project' ? '9.5px' : '7.5px')
      .attr('font-weight', d => d.group === 'project' ? '600' : '400')
      .attr('fill', d => d.group === 'project' ? 'rgba(255,255,255,0.84)' : 'rgba(255,255,255,0.36)')
      .attr('pointer-events', 'none')
      .attr('opacity', 0)
      .text(d => d.name)
      .transition()
      .delay((d, i) => 270 + i * 11)
      .duration(380)
      .attr('opacity', d => d.group === 'project' ? 1 : 0.50);

    /* ══════════════════════════════════════════════════════════
       TICK
    ══════════════════════════════════════════════════════════ */
    sim.on('tick', () => {
      link
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`);
      /* Keep label dy in sync with final radius */
      node.select('.n-label').attr('dy', d => r(d) + 11);
    });

    /* ══════════════════════════════════════════════════════════
       HIGHLIGHT STATE
    ══════════════════════════════════════════════════════════ */
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
    }

    function clearHighlight() {
      activeId   = null;
      activeNbrs = new Set();
      applyHighlight();
    }

    function applyHighlight() {
      const on = activeId !== null;

      node.select('.n-base')
        .attr('fill-opacity',   d => !on || activeNbrs.has(d.id) ? 0.10 : 0.015)
        .attr('stroke-opacity', d => !on || activeNbrs.has(d.id) ? 0.55 : 0.06);
      node.select('.n-ring')
        .attr('stroke-opacity', d => !on || activeNbrs.has(d.id) ? 0.20 : 0.03);
      node.select('.n-sheen')
        .attr('opacity', d => !on || activeNbrs.has(d.id) ? 1 : 0.06);
      node.select('.n-label')
        .attr('opacity', d => {
          if (!on) return d.group === 'project' ? 1 : 0.50;
          if (activeNbrs.has(d.id)) return 1;
          return 0.04;
        });

      link
        .attr('stroke-opacity', d => {
          if (!on) return 0.13;
          const s = d.source.id ?? d.source;
          const t = d.target.id ?? d.target;
          return (activeNbrs.has(s) && activeNbrs.has(t)) ? 0.85 : 0.02;
        })
        .attr('stroke-width', d => {
          if (!on) return 0.85;
          const s = d.source.id ?? d.source;
          const t = d.target.id ?? d.target;
          return (activeNbrs.has(s) && activeNbrs.has(t)) ? 1.8 : 0.85;
        })
        .attr('filter', d => {
          if (!on) return null;
          const s = d.source.id ?? d.source;
          const t = d.target.id ?? d.target;
          return (activeNbrs.has(s) && activeNbrs.has(t)) ? 'url(#link-glow)' : null;
        });
    }

    /* ══════════════════════════════════════════════════════════
       MOUSE EVENTS
    ══════════════════════════════════════════════════════════ */
    node
      .on('mouseenter', (e, d) => {
        showTooltip(e, d);
        const nd  = d3.select(e.currentTarget);
        const rad = r(d);
        nd.select('.n-base').transition().duration(110)
          .attr('r', rad + 2.5).attr('fill-opacity', 0.20);
        nd.select('.n-sheen').transition().duration(110).attr('r', rad + 2.5);
        nd.select('.n-ring').transition().duration(110).attr('r', rad + 7.5);
        nd.select('.n-label').attr('opacity', 1);
        nd.raise();
      })
      .on('mousemove', moveTooltip)
      .on('mouseleave', (e, d) => {
        hideTooltip();
        const nd  = d3.select(e.currentTarget);
        const rad = r(d);
        const on  = activeId !== null;
        const dim = on && !activeNbrs.has(d.id);
        nd.select('.n-base').transition().duration(210)
          .attr('r', rad).attr('fill-opacity', dim ? 0.015 : 0.10);
        nd.select('.n-sheen').transition().duration(210).attr('r', rad);
        nd.select('.n-ring').transition().duration(210).attr('r', rad + 5);
        nd.select('.n-label').attr('opacity',
          dim ? 0.04 : (d.group === 'project' ? 1 : 0.50));
      })
      .on('click', (e, d) => { e.stopPropagation(); setHighlight(d); });

    /* ══════════════════════════════════════════════════════════
       TOOLTIP
    ══════════════════════════════════════════════════════════ */
    function showTooltip(e, d) {
      const label = GROUP_LABELS[d.group] || d.group;
      const c  = COLORS[d.group];
      const bg = c + '1a';
      let html =
        `<div class="tt-inner" style="border-left-color:${c}">` +
          `<div class="tt-name">${d.name}</div>` +
          `<span class="tt-badge" style="color:${c};border-color:${c}44;background:${bg}">${label}</span>`;
      if (d.desc) {
        html += `<p class="tt-desc">${d.desc}</p>`;
      }
      if (d.url) {
        html += `<a class="tt-link" href="${d.url}" style="color:${c}">View project →</a>`;
      }
      html += `</div>`;
      tooltipEl.innerHTML = html;
      tooltipEl.style.opacity = '1';
      moveTooltip(e);
    }

    function moveTooltip(e) {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left + 16;
      const y = e.clientY - rect.top  - 10;
      tooltipEl.style.left = `${Math.min(x, rect.width  - 255)}px`;
      tooltipEl.style.top  = `${Math.max(y, 8)}px`;
    }

    function hideTooltip() { tooltipEl.style.opacity = '0'; }

    /* ══════════════════════════════════════════════════════════
       DRAG
    ══════════════════════════════════════════════════════════ */
    function makeDrag(simulation) {
      return d3.drag()
        .on('start', (e, d) => {
          if (!e.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on('end',   (e, d) => {
          if (!e.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        });
    }

    /* ══════════════════════════════════════════════════════════
       GROUP FILTER BUTTONS
    ══════════════════════════════════════════════════════════ */
    let activeFilter = 'all';

    document.querySelectorAll('.eco-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.group;
        document.querySelectorAll('.eco-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        clearHighlight();
        applyFilter();
      });
    });

    function applyFilter() {
      const all     = activeFilter === 'all';
      const visible = new Set(
        nodes.filter(n => all || n.group === activeFilter).map(n => n.id)
      );

      /* When filtering a tech group, also show connected projects */
      if (!all && activeFilter !== 'project') {
        links.forEach(l => {
          const s  = l.source.id ?? l.source;
          const t  = l.target.id ?? l.target;
          const sn = nodeMap[s];
          const tn = nodeMap[t];
          if (sn?.group === activeFilter && tn?.group === 'project') visible.add(t);
          if (tn?.group === activeFilter && sn?.group === 'project') visible.add(s);
        });
      }

      node
        .attr('opacity',        d => visible.has(d.id) ? 1 : 0.04)
        .attr('pointer-events', d => visible.has(d.id) ? 'all' : 'none');

      link.attr('opacity', d => {
        const s = d.source.id ?? d.source;
        const t = d.target.id ?? d.target;
        return (visible.has(s) && visible.has(t)) ? 1 : 0.03;
      });

      /* Update stat counters */
      const vP = [...visible].filter(id => id.startsWith('p-')).length;
      const vT = [...visible].filter(id => id.startsWith('t-')).length;
      const vL = links.filter(l => {
        const s = l.source.id ?? l.source;
        const t = l.target.id ?? l.target;
        return visible.has(s) && visible.has(t);
      }).length;
      const $ = id => document.getElementById(id);
      if ($('stat-projects')) $('stat-projects').textContent = vP;
      if ($('stat-tech'))     $('stat-tech').textContent     = vT;
      if ($('stat-links'))    $('stat-links').textContent    = vL;
    }

    /* ══════════════════════════════════════════════════════════
       RESET BUTTON
    ══════════════════════════════════════════════════════════ */
    const resetBtn = document.getElementById('reset-graph');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        clearHighlight();
        activeFilter = 'all';
        document.querySelectorAll('.eco-filter').forEach(b => b.classList.remove('active'));
        document.querySelector('.eco-filter[data-group="all"]')?.classList.add('active');
        applyFilter();
        svg.transition().duration(680).ease(d3.easeCubicOut)
          .call(zoom.transform, d3.zoomIdentity);
      });
    }

    /* ══════════════════════════════════════════════════════════
       RESIZE
    ══════════════════════════════════════════════════════════ */
    new ResizeObserver(() => {
      W = wrapper.clientWidth;
      H = wrapper.clientHeight;
      svg.attr('width', W).attr('height', H);
      sim.force('center', d3.forceCenter(W / 2, H / 2).strength(0.04));
      sim.alpha(0.18).restart();
    }).observe(wrapper);

    /* Initial stats populate */
    applyFilter();
  }

})();
