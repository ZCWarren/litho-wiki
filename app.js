/* 路由 + 渲染 */
(function () {
  const sidebar = document.getElementById('sidebar');
  const content = document.getElementById('content');
  const scrim = document.getElementById('scrim');
  const menuBtn = document.getElementById('menu-btn');

  /* ---------- sidebar ---------- */
  let nav = `<a class="nav-item" href="#/"><span class="no">⌂</span>首页 · Home</a>`;
  for (const part of PARTS) {
    nav += `<div class="nav-part">${part.name}</div>`;
    for (const id of part.chapters) {
      const ch = CHAPTERS[id];
      nav += `<a class="nav-item" data-id="${id}" href="#/${id}"><span class="no">${ch.no.replace('第', '').replace('章', '')}</span><span>${ch.title}</span></a>`;
    }
  }
  sidebar.innerHTML = nav;

  menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  scrim.addEventListener('click', () => sidebar.classList.remove('open'));

  /* ---------- 首页 ---------- */
  function homeHTML() {
    let cards = '';
    for (const part of PARTS) {
      for (const id of part.chapters) {
        const ch = CHAPTERS[id];
        cards += `<a class="chcard" href="#/${id}"><div class="no">${ch.no}</div><div class="t">${ch.title}</div><div class="d">${ch.desc}</div></a>`;
      }
    }
    return `
    <div class="hero">
      <div class="kicker">COMPUTATIONAL LITHOGRAPHY · INTERACTIVE WIKI</div>
      <h1>计算光刻 Wiki</h1>
      <p class="sub">数学原理 · 工程实现 · 前沿应用 —— 一场「自由度的接力赛」：从 Rayleigh 判据到逆光刻与 EUV。</p>
    </div>
    <blockquote>
      当工艺因子 $k_1$ 一路逼近甚至跌破 0.3，掩模上的图形与硅片上的像早已不是简单的「缩小复印」。
      计算光刻用数学与算法向物理「借」分辨率：给定想要的目标图形，反推光源、掩模、光瞳应如何协同。
      本 Wiki 依据《计算光刻技术讲义》整理，全部十四章，关键概念配有<strong>可动手玩的互动演示</strong>。
    </blockquote>
    <h2>四条推荐阅读路径</h2>
    <ul>
      <li><strong>光学背景</strong>：快速浏览 <a href="#/ch2">第 2</a>、<a href="#/ch3">3</a> 章 → 直奔 <a href="#/ch5">第 5 章 RET</a>。</li>
      <li><strong>算法背景</strong>：精读 <a href="#/ch3">第 3 章</a> TCC/SOCS 分解 → 直取 <a href="#/ch7">第 7 章 ILT</a> 伴随法。</li>
      <li><strong>工艺工程师</strong>：从 <a href="#/ch4">第 4</a>、<a href="#/ch5">5</a> 章切入 → 按兴趣深入 <a href="#/ch10">多重曝光</a> 与 <a href="#/ch11">EUV</a>。</li>
      <li><strong>只想动手玩</strong>：直接跳到 <a href="#/ch9">第 9 章 SMO</a> 末尾的 <strong>ILT/SMO 实时优化器</strong>。</li>
    </ul>
    <h2>目录</h2>
    <div class="chgrid">${cards}</div>
    <div class="foot">计算光刻 Wiki · 由 <a href="https://zcwarren.github.io" target="_blank" rel="noreferrer">Zichen (Warren) Song</a> 维护 · 内容依据《计算光刻技术讲义》（2026.10）整理 · <a href="https://github.com/ZCWarren/litho-wiki" target="_blank" rel="noreferrer">GitHub 仓库</a></div>`;
  }

  /* ---------- 渲染 ---------- */
  function render() {
    const hash = location.hash.replace(/^#\/?/, '') || '';
    sidebar.classList.remove('open');
    sidebar.querySelectorAll('.nav-item').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#/' + hash);
    });
    if (!hash) {
      content.innerHTML = homeHTML();
      document.title = '计算光刻 Wiki · Computational Lithography';
    } else if (CHAPTERS[hash]) {
      const ch = CHAPTERS[hash];
      const ids = Object.keys(CHAPTERS);
      const idx = ids.indexOf(hash);
      const prev = idx > 0 ? ids[idx - 1] : null;
      const next = idx < ids.length - 1 ? ids[idx + 1] : null;
      content.innerHTML = `
        <h1>${ch.no} ${ch.title}<span class="en">${ch.en}</span></h1>
        ${ch.html}
        <div class="prevnext">
          ${prev ? `<a href="#/${prev}">← ${CHAPTERS[prev].no} ${CHAPTERS[prev].title}</a>` : '<span></span>'}
          ${next ? `<a href="#/${next}">${CHAPTERS[next].no} ${CHAPTERS[next].title} →</a>` : '<span></span>'}
        </div>`;
      document.title = `${ch.no} ${ch.title} · 计算光刻 Wiki`;
    } else {
      content.innerHTML = '<h1>404</h1><p class="lead">页面不存在，<a href="#/">回到首页</a>。</p>';
    }
    window.scrollTo(0, 0);
    // 挂载互动演示
    content.querySelectorAll('.demo[data-demo]').forEach(el => {
      const fn = DEMOS[el.dataset.demo];
      if (fn) try { fn(el); } catch (e) { el.innerHTML += '<div class="demo-note">演示加载失败：' + e.message + '</div>'; }
    });
    // 数学渲染
    if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([content]).catch(() => {});
  }

  window.addEventListener('hashchange', render);
  render();
})();
