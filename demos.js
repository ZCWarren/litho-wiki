/* 互动演示：Rayleigh 计算器 / Abbe 成像模拟 / 照明模式浏览器 / ILT-SMO 优化器 */
/* global document, window, requestAnimationFrame */

/* ================= 2D FFT 工具（radix-2，N 为 2 的幂） ================= */
function fft1d(re, im, invert) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const tr = re[i]; re[i] = re[j]; re[j] = tr;
      const ti = im[i]; im[i] = im[j]; im[j] = ti;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (2 * Math.PI / len) * (invert ? -1 : 1);
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cwr = 1, cwi = 0;
      for (let j = 0; j < len / 2; j++) {
        const ur = re[i + j], ui = im[i + j];
        const vr = re[i + j + len / 2] * cwr - im[i + j + len / 2] * cwi;
        const vi = re[i + j + len / 2] * cwi + im[i + j + len / 2] * cwr;
        re[i + j] = ur + vr; im[i + j] = ui + vi;
        re[i + j + len / 2] = ur - vr; im[i + j + len / 2] = ui - vi;
        const nwr = cwr * wr - cwi * wi;
        cwi = cwr * wi + cwi * wr; cwr = nwr;
      }
    }
  }
  if (invert) {
    for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
  }
}
function fft2(re, im, N, invert) {
  const tr = new Float64Array(N), ti = new Float64Array(N);
  for (let y = 0; y < N; y++) {
    const off = y * N;
    fft1d(re.subarray(off, off + N), im.subarray(off, off + N), invert);
  }
  for (let x = 0; x < N; x++) {
    for (let y = 0; y < N; y++) { tr[y] = re[y * N + x]; ti[y] = im[y * N + x]; }
    fft1d(tr, ti, invert);
    for (let y = 0; y < N; y++) { re[y * N + x] = tr[y]; im[y * N + x] = ti[y]; }
  }
}
function circshift(re, im, N, sx, sy) {
  const or = new Float64Array(N * N), oi = new Float64Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const tx = (x + sx + N) % N, ty = (y + sy + N) % N;
    or[ty * N + tx] = re[y * N + x]; oi[ty * N + tx] = im[y * N + x];
  }
  return [or, oi];
}

/* ================= canvas 热力图 ================= */
function drawHeat(canvas, data, N, opts = {}) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const img = ctx.createImageData(w, h);
  let mn = Infinity, mx = -Infinity;
  for (const v of data) { if (v < mn) mn = v; if (v > mx) mx = v; }
  const rng = (mx - mn) || 1;
  const cmap = opts.cmap || ((t) => {
    // 深蓝→琥珀
    const r = Math.min(255, 30 + 255 * Math.max(0, t * 1.15 - 0.08) * (t > 0.6 ? 1 : 0.85));
    const g = Math.min(255, 40 + 190 * t * t);
    const b = Math.min(255, 70 + 120 * (1 - t) * (1 - t) + 40 * t);
    return [r, g, b];
  });
  for (let py = 0; py < h; py++) {
    const gy = Math.floor(py * N / h);
    for (let px = 0; px < w; px++) {
      const gx = Math.floor(px * N / w);
      const t = (data[gy * N + gx] - mn) / rng;
      const [r, g, b] = cmap(t);
      const o = (py * w + px) * 4;
      img.data[o] = r; img.data[o + 1] = g; img.data[o + 2] = b; img.data[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  if (opts.overlay) { // 叠加目标轮廓
    ctx.strokeStyle = 'rgba(120,220,140,.9)'; ctx.lineWidth = 1.5;
    const o = opts.overlay;
    for (let py = 1; py < h - 1; py++) {
      const gy = Math.floor(py * N / h);
      for (let px = 1; px < w - 1; px++) {
        const gx = Math.floor(px * N / w);
        const v = o[gy * N + gx];
        if ((v >= 0.5) !== (o[gy * N + gx + 1] >= 0.5) || (v >= 0.5) !== (o[(gy + 1) * N + gx] >= 0.5)) {
          ctx.fillStyle = 'rgba(120,220,140,.75)';
          ctx.fillRect(px, py, 1, 1);
        }
      }
    }
  }
}
function setupCanvas(canvas, px) {
  canvas.width = px; canvas.height = px;
  canvas.style.aspectRatio = '1';
}

/* ================= Demo 1: Rayleigh 计算器 ================= */
function mountRayleigh(el) {
  el.innerHTML = `
    <div class="demo-title">互动 · Rayleigh 计算器</div>
    <div class="demo-row">
      <label class="ctl">λ = <b id="rl-lam-v"></b> nm
        <input type="range" id="rl-lam" min="13.5" max="436" step="0.5" value="193"></label>
      <label class="ctl">NA = <b id="rl-na-v"></b>
        <input type="range" id="rl-na" min="0.30" max="1.70" step="0.01" value="1.35"></label>
      <label class="ctl">k₁ = <b id="rl-k1-v"></b>
        <input type="range" id="rl-k1" min="0.25" max="0.80" step="0.01" value="0.28"></label>
      <label class="ctl">k₂ = <b id="rl-k2-v"></b>
        <input type="range" id="rl-k2" min="0.30" max="1.00" step="0.05" value="0.50"></label>
    </div>
    <div class="demo-row">
      <span class="demo-out">最小半周期 CD ≈ <b id="rl-cd"></b> nm</span>
      <span class="demo-out">焦深 DOF ≈ <b id="rl-dof"></b> nm</span>
    </div>
    <div class="demo-row" style="gap:8px">
      ${[['g 线', 436, 0.5, 0.8], ['i 线', 365, 0.55, 0.7], ['KrF', 248, 0.8, 0.55], ['ArF 干式', 193, 0.93, 0.4], ['ArF 浸没', 193, 1.35, 0.28], ['EUV', 13.5, 0.33, 0.45], ['High-NA', 13.5, 0.55, 0.4]]
        .map(p => `<button data-preset="${p[1]},${p[2]},${p[3]}">${p[0]}</button>`).join('')}
    </div>
    <canvas id="rl-cv" style="height:120px"></canvas>
    <div class="demo-note">拖动滑块体会三代光刻的取舍：λ 每降一代都要重写整套材料与光学；NA 提升分辨率但焦深按 1/NA² 牺牲；k₁ 的压榨就是计算光刻的全部故事。条带图：k₁ 从 0.8（1980s）到 0.25（物理极限）的历史位置。</div>`;
  const $ = (id) => el.querySelector(id);
  const cv = $('#rl-cv');
  function upd() {
    const lam = +$('#rl-lam').value, na = +$('#rl-na').value, k1 = +$('#rl-k1').value, k2 = +$('#rl-k2').value;
    $('#rl-lam-v').textContent = lam; $('#rl-na-v').textContent = na.toFixed(2);
    $('#rl-k1-v').textContent = k1.toFixed(2); $('#rl-k2-v').textContent = k2.toFixed(2);
    $('#rl-cd').textContent = (k1 * lam / na).toFixed(1);
    $('#rl-dof').textContent = (k2 * lam / (na * na)).toFixed(1);
    const ctx = cv.getContext('2d');
    const w = cv.width = cv.clientWidth * 2, h = cv.height = 240;
    ctx.clearRect(0, 0, w, h);
    // k1 标尺 0.25..0.8
    const x0 = 60, x1 = w - 30, y = 100;
    const X = (k) => x0 + (k - 0.25) / 0.55 * (x1 - x0);
    ctx.strokeStyle = '#3a414d'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    ctx.strokeStyle = '#e8a33d';
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(X(k1), y); ctx.stroke();
    ctx.fillStyle = '#9aa1ac'; ctx.font = '22px monospace';
    [0.25, 0.35, 0.5, 0.8].forEach(k => ctx.fillText(k.toFixed(2), X(k) - 22, y + 42));
    ctx.fillStyle = '#e8a33d';
    ctx.beginPath(); ctx.arc(X(k1), y, 14, 0, 7); ctx.fill();
    ctx.fillStyle = '#e8e6e1'; ctx.font = 'bold 24px monospace';
    ctx.fillText('k₁ = ' + k1.toFixed(2), X(k1) - 52, y - 30);
    ctx.fillStyle = k1 < 0.30 ? '#e06c5b' : '#9aa1ac'; ctx.font = '20px sans-serif';
    ctx.fillText(k1 < 0.25 ? '⚠ 低于物理极限，单曝不可行' : k1 < 0.30 ? '极限区：需要 SMO/多重曝光' : '', x0, 200);
  }
  el.querySelectorAll('input').forEach(i => i.addEventListener('input', upd));
  el.querySelectorAll('[data-preset]').forEach(b => b.addEventListener('click', () => {
    const [lam, na, k1] = b.dataset.preset.split(',').map(Number);
    $('#rl-lam').value = lam; $('#rl-na').value = na; $('#rl-k1').value = k1; upd();
  }));
  upd();
}

/* ================= Demo 2: Abbe 成像模拟 ================= */
function mountAbbe(el) {
  el.innerHTML = `
    <div class="demo-title">互动 · Abbe 成像：衍射级次与频谱截断</div>
    <div class="demo-row">
      <label class="ctl">周期 p = <b id="ab-p-v"></b> nm
        <input type="range" id="ab-p" min="80" max="800" step="10" value="400"></label>
      <label class="ctl">NA = <b id="ab-na-v"></b>
        <input type="range" id="ab-na" min="0.2" max="1.6" step="0.05" value="0.8"></label>
      <label class="ctl">λ = 193 nm（固定）</label>
      <label class="ctl">阈值 t = <b id="ab-t-v"></b>
        <input type="range" id="ab-t" min="0.1" max="0.5" step="0.01" value="0.3"></label>
    </div>
    <div class="demo-grid">
      <canvas id="ab-pupil"></canvas>
      <canvas id="ab-img"></canvas>
    </div>
    <div class="demo-row"><span class="demo-out" id="ab-status"></span>
      <span class="demo-out">k₁ = <b id="ab-k1"></b></span>
      <span class="demo-out">胶轮廓 CD ≈ <b id="ab-cd"></b></span></div>
    <div class="demo-note">左图：光瞳（圆）与掩模衍射级次（点）；只有落入光瞳的级次（金色）参与成像。右图：空间像强度（琥珀）与阈值切出的胶轮廓（绿区）。把 p 调小，观察 ±1 级依次被逐出光瞳、条纹对比度下降直至"一片灰平"——这就是 k₁=0.25 极限的现场。</div>`;
  const $ = (id) => el.querySelector(id);
  setupCanvas($('#ab-pupil'), 360); setupCanvas($('#ab-img'), 360);
  const LAM = 193;
  function upd() {
    const p = +$('#ab-p').value, NA = +$('#ab-na').value, thr = +$('#ab-t').value;
    $('#ab-p-v').textContent = p; $('#ab-na-v').textContent = NA.toFixed(2); $('#ab-t-v').textContent = thr.toFixed(2);
    const hp = p / 2, k1 = hp * NA / LAM;
    $('#ab-k1').textContent = k1.toFixed(3);
    // 通过的级次
    const maxM = 15;
    const pass = [];
    for (let m = -maxM; m <= maxM; m++) {
      if (m === 0) { pass.push(m); continue; }
      if (Math.abs(m % 2) === 1 && Math.abs(m) * LAM / p <= NA) pass.push(m); // 偶次谐波为零
    }
    const has1 = pass.includes(1) || pass.includes(-1);
    $('#ab-status').innerHTML = has1
      ? `通过级次：${pass.join(', ')} — <b>图形可分辨</b>`
      : '仅 0 级通过 — <b style="color:#e06c5b">不可分辨（只剩直流）</b>';
    // 光瞳图
    {
      const cv = $('#ab-pupil'), ctx = cv.getContext('2d'), w = cv.width, c = w / 2;
      const scale = (w / 2 - 20) / (NA * 1.35);
      ctx.clearRect(0, 0, w, w);
      ctx.fillStyle = '#10141a'; ctx.fillRect(0, 0, w, w);
      ctx.beginPath(); ctx.arc(c, c, NA * scale, 0, 7);
      ctx.fillStyle = 'rgba(232,163,61,.08)'; ctx.fill();
      ctx.strokeStyle = '#e8a33d'; ctx.lineWidth = 2; ctx.stroke();
      for (let m = -maxM; m <= maxM; m++) {
        if (m !== 0 && m % 2 === 0) continue;
        const fx = m * LAM / p; // sinθ
        if (Math.abs(fx) > NA * 1.3) continue;
        const x = c + fx * scale;
        const inside = Math.abs(fx) <= NA;
        ctx.beginPath(); ctx.arc(x, c, m === 0 ? 9 : 7, 0, 7);
        ctx.fillStyle = inside ? '#e8a33d' : '#3a414d'; ctx.fill();
        ctx.fillStyle = inside ? '#0d0f12' : '#9aa1ac';
        ctx.font = 'bold 15px monospace'; ctx.textAlign = 'center';
        ctx.fillText(String(m), x, c + 30);
      }
      ctx.textAlign = 'left';
    }
    // 空间像
    {
      const cv = $('#ab-img'), ctx = cv.getContext('2d'), w = cv.width;
      ctx.clearRect(0, 0, w, w);
      ctx.fillStyle = '#10141a'; ctx.fillRect(0, 0, w, w);
      const xs = [], Is = [];
      const npts = 400;
      for (let i = 0; i < npts; i++) {
        const x = (i / npts - 0.5) * p * 2; // 显示两个周期
        let re = 0.5;
        for (const m of pass) {
          if (m === 0) continue;
          const am = Math.sin(Math.PI * m / 2) / (Math.PI * m);
          re += 2 * am * Math.cos(2 * Math.PI * m * x / p);
        }
        xs.push(x); Is.push(re * re);
      }
      const Imax = Math.max(...Is, 1e-9);
      // 胶轮廓（超过阈值区域）
      ctx.fillStyle = 'rgba(120,220,140,.22)';
      let started = false, sx = 0, cdCount = 0, cdSum = 0;
      for (let i = 0; i < npts; i++) {
        const px = i / npts * w;
        const on = Is[i] >= thr;
        if (on && !started) { started = true; sx = px; }
        if (!on && started) { started = false; ctx.fillRect(sx, 0, px - sx, w); cdSum += (xs[i] - xs[Math.round(sx / w * npts)] || 0); cdCount++; }
      }
      if (started) ctx.fillRect(sx, 0, w - sx, w);
      // 阈值线
      ctx.strokeStyle = 'rgba(154,161,172,.6)'; ctx.setLineDash([6, 5]); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, w - thr / Imax * w * 0.9 - 10); ctx.lineTo(w, w - thr / Imax * w * 0.9 - 10); ctx.stroke();
      ctx.setLineDash([]);
      // 强度曲线
      ctx.strokeStyle = '#e8a33d'; ctx.lineWidth = 2.5; ctx.beginPath();
      for (let i = 0; i < npts; i++) {
        const px = i / npts * w, py = w - Is[i] / Imax * w * 0.9 - 10;
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.stroke();
      // CD 估算：一个周期内超过阈值的宽度
      let cdw = 0;
      for (let i = 0; i < npts; i++) if (xs[i] > 0 && xs[i] <= p && Is[i] >= thr) cdw++;
      $('#ab-cd').textContent = has1 ? (cdw / npts * p * 2).toFixed(0) + ' nm' : '—';
    }
  }
  el.querySelectorAll('input').forEach(i => i.addEventListener('input', upd));
  upd();
}

/* ================= Demo 3: 照明模式浏览器 ================= */
function mountIllum(el) {
  el.innerHTML = `
    <div class="demo-title">互动 · 照明模式与光瞳</div>
    <div class="demo-row">
      <label class="ctl">模式
        <select id="il-mode">
          <option value="conv">传统（圆形）</option>
          <option value="ann">环形</option>
          <option value="dipx">二极 Dipole-X</option>
          <option value="quad">四极 Quasar</option>
          <option value="free">自由照明（SMO 风格）</option>
        </select></label>
      <label class="ctl">σ / σ_out = <b id="il-s-v"></b>
        <input type="range" id="il-s" min="0.2" max="0.95" step="0.01" value="0.75"></label>
      <label class="ctl">σ_in = <b id="il-si-v"></b>
        <input type="range" id="il-si" min="0.05" max="0.8" step="0.01" value="0.5"></label>
    </div>
    <div class="demo-grid">
      <canvas id="il-pupil"></canvas>
      <canvas id="il-info"></canvas>
    </div>
    <div class="demo-note">左：光瞳面光源强度分布（科勒照明下，光源面与光瞳面傅里叶共轭）。右：该照明对 <b>x 方向</b>与 <b>y 方向</b>线条的有效频率覆盖示意——方向性照明用"牺牲一个方向"换取"另一个方向的极致"。自由照明一格随机生成，正是 SMO 输出的样子。</div>`;
  const $ = (id) => el.querySelector(id);
  setupCanvas($('#il-pupil'), 340); setupCanvas($('#il-info'), 340);
  // 预生成自由照明
  const free = [];
  for (let i = 0; i < 12; i++) {
    const a = Math.random() * Math.PI * 2, r = 0.55 + Math.random() * 0.3;
    free.push([Math.cos(a) * r, Math.sin(a) * r, 0.10 + Math.random() * 0.08, 0.5 + Math.random()]);
  }
  function blob(ctx, c, scale, x, y, r, alpha) {
    const g = ctx.createRadialGradient(c + x * scale, c + y * scale, 0, c + x * scale, c + y * scale, r * scale);
    g.addColorStop(0, `rgba(232,163,61,${alpha})`);
    g.addColorStop(1, 'rgba(232,163,61,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c * 2, c * 2);
  }
  function upd() {
    const mode = $('#il-mode').value, s = +$('#il-s').value, si = +$('#il-si').value;
    $('#il-s-v').textContent = s.toFixed(2); $('#il-si-v').textContent = si.toFixed(2);
    const cv = $('#il-pupil'), ctx = cv.getContext('2d'), w = cv.width, c = w / 2, scale = c - 14;
    ctx.clearRect(0, 0, w, w);
    ctx.fillStyle = '#10141a'; ctx.fillRect(0, 0, w, w);
    ctx.beginPath(); ctx.arc(c, c, scale, 0, 7);
    ctx.strokeStyle = '#3a414d'; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.arc(c, c, scale, 0, 7); ctx.clip();
    if (mode === 'conv') blob(ctx, c, scale, 0, 0, s, 0.95);
    else if (mode === 'ann') {
      blob(ctx, c, scale, 0, 0, s, 0.95);
      ctx.globalCompositeOperation = 'destination-out';
      blob(ctx, c, scale, 0, 0, Math.min(si, s - 0.02), 1);
      ctx.globalCompositeOperation = 'source-over';
    } else if (mode === 'dipx') { blob(ctx, c, scale, -s, 0, 0.22, 0.95); blob(ctx, c, scale, s, 0, 0.22, 0.95); }
    else if (mode === 'quad') {
      const q = s / Math.SQRT2;
      [[q, q], [q, -q], [-q, q], [-q, -q]].forEach(([x, y]) => blob(ctx, c, scale, x, y, 0.20, 0.95));
    } else free.forEach(([x, y, r, a]) => blob(ctx, c, scale, x, y, r, Math.min(a, 0.95)));
    ctx.restore();
    // 右图：频率覆盖示意（简化：光源圆盘与光瞳的 Minkowski 和截面）
    const cv2 = $('#il-info'), ctx2 = cv2.getContext('2d'), w2 = cv2.width;
    ctx2.clearRect(0, 0, w2, w2);
    ctx2.fillStyle = '#10141a'; ctx2.fillRect(0, 0, w2, w2);
    const pad = 46, H = w2 - pad * 1.6, W2 = w2 - pad * 2;
    ctx2.strokeStyle = '#3a414d'; ctx2.strokeRect(pad, pad / 2, W2, H);
    ctx2.fillStyle = '#9aa1ac'; ctx2.font = '18px monospace';
    ctx2.fillText('有效频率覆盖（示意）', pad, pad / 2 - 12);
    const bars = mode === 'dipx' ? [[1, 0.15], [0.35, 0.85]]
      : mode === 'quad' ? [[0.75, 0.5], [0.75, 0.5]]
      : mode === 'ann' ? [[0.85, 0.65], [0.85, 0.65]]
      : mode === 'free' ? [[0.9, 0.55], [0.85, 0.6]]
      : [[0.55 + 0.4 * s, 0.95], [0.55 + 0.4 * s, 0.95]];
    const labels = ['x 向线条', 'y 向线条'];
    bars.forEach(([cov, gain], i) => {
      const y = pad / 2 + H * (i + 0.5) / 2;
      ctx2.fillStyle = 'rgba(232,163,61,.18)';
      ctx2.fillRect(pad + 2, y - 24, (W2 - 4) * cov, 48);
      ctx2.strokeStyle = '#e8a33d'; ctx2.strokeRect(pad + 2, y - 24, (W2 - 4) * cov, 48);
      ctx2.fillStyle = '#e8e6e1'; ctx2.font = '16px sans-serif';
      ctx2.fillText(labels[i] + '　覆盖 ' + Math.round(cov * 100) + '%', pad + 12, y + 6);
    });
  }
  el.querySelectorAll('input,select').forEach(i => i.addEventListener('input', upd));
  upd();
}

/* ================= Demo 4: ILT / SMO 实时优化器 ================= */
function mountILT(el) {
  const N = 64, NP = N * N;
  const DX = 10;                 // nm / pixel
  const LAM = 193, NA = 1.35;
  const FC = (NA / LAM) * N * DX;      // 光瞳截止频率（像素单位）≈ 4.48
  const SR = 4;                   // 光源采样半径（像素）

  el.innerHTML = `
    <div class="demo-title">互动实验室 · ILT / SMO 实时优化器（64×64，真实梯度下降）</div>
    <div class="demo-row">
      <label class="ctl">目标图形
        <select id="smo-target">
          <option value="lines">密集线条（80 nm 周期，k₁≈0.28）</option>
          <option value="contacts">接触孔阵列（120 nm 周期）</option>
          <option value="L">L 形拐角</option>
        </select></label>
      <label class="ctl">初始光源
        <select id="smo-src">
          <option value="ann">环形</option>
          <option value="conv">传统（圆形）</option>
          <option value="quad">四极</option>
          <option value="dip">二极-X</option>
        </select></label>
      <label class="toggle"><input type="checkbox" id="smo-joint" checked> 联合优化光源（SMO 模式；关闭则仅 ILT）</label>
    </div>
    <div class="demo-grid">
      <div><canvas id="smo-cv-t"></canvas><div class="demo-note">目标图形</div></div>
      <div><canvas id="smo-cv-m"></canvas><div class="demo-note">掩模 M（迭代演化）</div></div>
      <div><canvas id="smo-cv-i"></canvas><div class="demo-note">空间像 / 胶轮廓（绿线=目标边缘）</div></div>
      <div><canvas id="smo-cv-s"></canvas><div class="demo-note">光源 J（光瞳面，SMO 时演化）</div></div>
    </div>
    <div class="demo-row">
      <button class="primary" id="smo-run">▶ 开始优化</button>
      <button id="smo-step">单步 ×10</button>
      <button id="smo-reset">重置</button>
      <span class="demo-out">迭代 <b id="smo-iter">0</b></span>
      <span class="demo-out">图形误差 <b id="smo-cost">—</b></span>
    </div>
    <div class="demo-note">前向模型为 Abbe 源点求和 + sigmoid 胶模型（式 9-3/9-4），梯度由伴随法实时计算（式 9-7）。观察：掩模如何自发长出 SRAF 碎块、轮廓如何贴近绿线目标；开启 SMO 后光源会从初始形状"流"向对当前版图最有利的形态。这就是 SMO Engine 每天都在做的事的迷你版。</div>`;

  const $ = (id) => el.querySelector('#' + id);
  ['smo-cv-t', 'smo-cv-m', 'smo-cv-i', 'smo-cv-s'].forEach(id => setupCanvas($(id), 256));

  /* ---- 光瞳 ---- */
  const H = new Float64Array(NP);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const fx = x < N / 2 ? x : x - N, fy = y < N / 2 ? y : y - N;
    H[y * N + x] = (fx * fx + fy * fy <= FC * FC) ? 1 : 0;
  }
  /* ---- 光源采样点 ---- */
  const srcPts = [];
  for (let sy = -SR; sy <= SR; sy++) for (let sx = -SR; sx <= SR; sx++)
    if (sx * sx + sy * sy <= SR * SR + 0.01) srcPts.push([sx, sy]);
  const NS = srcPts.length;

  /* ---- 目标图形 ---- */
  function makeTarget(kind) {
    const T = new Float64Array(NP);
    if (kind === 'lines') {
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++)
        if (x % 8 < 4) T[y * N + x] = 1;   // 80 nm 周期 1:1
    } else if (kind === 'contacts') {
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const inX = (x % 12) >= 3 && (x % 12) < 8, inY = (y % 12) >= 3 && (y % 12) < 8;
        if (inX && inY) T[y * N + x] = 1;
      }
    } else { // L 形
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const v = x >= 20 && x < 28 && y >= 16 && y < 44;
        const hz = x >= 20 && x < 44 && y >= 36 && y < 44;
        if (v || hz) T[y * N + x] = 1;
      }
    }
    return T;
  }
  function makeSource(kind) {
    const J = new Float64Array(NS);
    srcPts.forEach(([sx, sy], i) => {
      const r = Math.hypot(sx, sy);
      if (kind === 'conv') J[i] = r <= 2.6 ? 1 : 0;
      else if (kind === 'ann') J[i] = (r >= 2.2 && r <= 4.0) ? 1 : 0;
      else if (kind === 'quad') {
        const d = Math.min(Math.hypot(sx - 3, sy - 3), Math.hypot(sx + 3, sy - 3), Math.hypot(sx - 3, sy + 3), Math.hypot(sx + 3, sy + 3));
        J[i] = d <= 1.6 ? 1 : 0;
      } else { // dipole-x
        const d = Math.min(Math.hypot(sx - 3.5, sy), Math.hypot(sx + 3.5, sy));
        J[i] = d <= 1.4 ? 1 : 0;
      }
    });
    let s = J.reduce((a, b) => a + b, 0) || 1;
    for (let i = 0; i < NS; i++) J[i] /= s;
    return J;
  }

  let M, T, J, iter = 0, running = false, raf = null;

  /* ---- 前向 + 梯度（伴随法） ---- */
  function forwardGrad(M, J, T) {
    const Br = new Float64Array(NP), Bi = new Float64Array(NP);
    Br.set(M);
    fft2(Br, Bi, N, false);                       // B = FFT(M)
    const I = new Float64Array(NP);
    const grads = new Float64Array(NP);
    const dJ = new Float64Array(NS);
    // 第一遍：空间像
    const As = [];
    for (let m = 0; m < NS; m++) {
      if (J[m] < 1e-4) { As.push(null); continue; }
      const [sx, sy] = srcPts[m];
      let [xr, xi] = circshift(Br, Bi, N, sx, sy);
      for (let i = 0; i < NP; i++) { xr[i] *= H[i]; xi[i] *= H[i]; }
      fft2(xr, xi, N, true);                      // A = IFFT(H·S·B)
      As.push([xr, xi]);
      for (let i = 0; i < NP; i++) I[i] += J[m] * (xr[i] * xr[i] + xi[i] * xi[i]);
    }
    // 胶模型 + 误差
    const a = 25, t = 0.3;
    const G = new Float64Array(NP);
    let cost = 0;
    for (let i = 0; i < NP; i++) {
      const z = 1 / (1 + Math.exp(-a * (I[i] - t)));
      const e = z - T[i];
      cost += e * e;
      G[i] = 2 * e * a * z * (1 - z);             // dF/dI
    }
    cost /= NP;
    // 第二遍：伴随反传
    for (let m = 0; m < NS; m++) {
      if (!As[m]) continue;
      const [ar, ai] = As[m];
      const [sx, sy] = srcPts[m];
      let dj = 0;
      const vr = new Float64Array(NP), vi = new Float64Array(NP);
      for (let i = 0; i < NP; i++) {
        vr[i] = G[i] * ar[i]; vi[i] = G[i] * ai[i];
        dj += G[i] * (ar[i] * ar[i] + ai[i] * ai[i]);
      }
      dJ[m] = dj / NP;
      fft2(vr, vi, N, false);                     // F(G·A)
      for (let i = 0; i < NP; i++) { vr[i] *= H[i]; vi[i] *= H[i]; }
      const [ur, ui] = circshift(vr, vi, N, -sx, -sy);
      fft2(ur, ui, N, true);                      // IFFT(S⁻¹·H·F(G·A))
      for (let i = 0; i < NP; i++) grads[i] += 2 * J[m] * ur[i];
    }
    // 离散化正则
    const gd = 0.02 * NP;
    let binc = 0;
    for (let i = 0; i < NP; i++) {
      binc += M[i] * (1 - M[i]);
      grads[i] += gd * (1 - 2 * M[i]);
    }
    cost += 0.02 * binc;
    for (let i = 0; i < NP; i++) grads[i] /= NP;
    return { I, grads, dJ, cost };
  }

  /* ---- 绘制 ---- */
  function drawAll(res) {
    drawHeat($('smo-cv-t'), T, N);
    drawHeat($('smo-cv-m'), M, N);
    if (res) drawHeat($('smo-cv-i'), res.I, N, { overlay: T });
    // 光源绘制
    const cv = $('smo-cv-s'), ctx = cv.getContext('2d'), w = cv.width, c = w / 2;
    const scale = (c - 12) / (FC * 1.15);
    ctx.clearRect(0, 0, w, w);
    ctx.fillStyle = '#10141a'; ctx.fillRect(0, 0, w, w);
    ctx.beginPath(); ctx.arc(c, c, FC * scale, 0, 7);
    ctx.strokeStyle = '#3a414d'; ctx.lineWidth = 2; ctx.stroke();
    const jmax = Math.max(...J, 1e-9);
    srcPts.forEach(([sx, sy], m) => {
      if (J[m] < jmax * 0.02) return;
      const al = 0.15 + 0.85 * J[m] / jmax;
      const r = 6 + 16 * J[m] / jmax;
      const g = ctx.createRadialGradient(c + sx * scale, c + sy * scale, 0, c + sx * scale, c + sy * scale, r);
      g.addColorStop(0, `rgba(232,163,61,${al})`);
      g.addColorStop(1, 'rgba(232,163,61,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(c + sx * scale, c + sy * scale, r, 0, 7); ctx.fill();
    });
    $('smo-iter').textContent = iter;
    if (res) $('smo-cost').textContent = (res.cost * 100).toFixed(2) + '%';
  }

  function step(n) {
    let res = null;
    for (let k = 0; k < n; k++) {
      res = forwardGrad(M, J, T);
      // 掩模更新（归一化梯度下降 + box 投影）
      let gmax = 1e-12;
      for (const g of res.grads) gmax = Math.max(gmax, Math.abs(g));
      const etaM = 0.25;
      for (let i = 0; i < NP; i++) {
        M[i] -= etaM * res.grads[i] / gmax;
        M[i] = M[i] < 0 ? 0 : M[i] > 1 ? 1 : M[i];
      }
      // 光源更新
      if ($('smo-joint').checked) {
        let jmax = 1e-12;
        for (const g of res.dJ) jmax = Math.max(jmax, Math.abs(g));
        const etaS = 0.03;
        let sum = 0;
        for (let m = 0; m < NS; m++) {
          J[m] -= etaS * res.dJ[m] / jmax;
          if (J[m] < 0) J[m] = 0;
          sum += J[m];
        }
        if (sum > 0) for (let m = 0; m < NS; m++) J[m] /= sum;
      }
      iter++;
    }
    drawAll(res);
  }

  function loop() {
    if (!running) return;
    step(3);
    raf = requestAnimationFrame(loop);
  }

  function reset() {
    T = makeTarget($('smo-target').value);
    J = makeSource($('smo-src').value);
    M = new Float64Array(NP);
    M.set(T);
    iter = 0;
    drawAll(forwardGrad(M, J, T));
  }

  $('smo-run').addEventListener('click', () => {
    running = !running;
    $('smo-run').textContent = running ? '⏸ 暂停' : '▶ 开始优化';
    if (running) loop(); else cancelAnimationFrame(raf);
  });
  $('smo-step').addEventListener('click', () => step(10));
  $('smo-reset').addEventListener('click', reset);
  $('smo-target').addEventListener('change', reset);
  $('smo-src').addEventListener('change', reset);
  reset();
}

const DEMOS = { rayleigh: mountRayleigh, abbe: mountAbbe, illum: mountIllum, ilt: mountILT };
