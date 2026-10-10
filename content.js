/* 计算光刻 Wiki —— 章节内容（依据《计算光刻技术讲义》整理） */
const PARTS = [
  { name: '第一部分 · 数学与物理基础', chapters: ['ch1', 'ch2', 'ch3', 'ch4'] },
  { name: '第二部分 · 分辨率增强与 OPC', chapters: ['ch5', 'ch6'] },
  { name: '第三部分 · 反演方法：ILT 与 SMO', chapters: ['ch7', 'ch8', 'ch9'] },
  { name: '第四部分 · 工程放大与前沿', chapters: ['ch10', 'ch11', 'ch12', 'ch13', 'ch14'] },
  { name: '附录', chapters: ['appA'] },
];

const CHAPTERS = {

ch1: {
  no: '第一章', title: '绪论：从摩尔定律到计算光刻', en: 'From Moore’s Law to Computational Lithography',
  desc: '光刻的经济地位、Rayleigh 判据与 k₁ 四十年下行史、计算光烙的定义与三阶段。',
  html: `
<p class="lead">用波长 193 nm 的"光刀"雕刻几十纳米的图形，衍射早已把掩模边界模糊成灰影。产业界之所以还能一代代缩小特征尺寸，是因为工程师不再指望光学系统"忠实成像"，而是用计算预先补偿畸变。</p>

<h2>1.1 光刻在制造中的地位</h2>
<p>光刻是前道工艺中唯一直接定义图形横向尺寸的步骤，也是技术难度最大、资本投入最集中的环节：光刻工艺成本约占芯片制造成本的 <strong>30%–35%</strong>，耗时约占晶圆制造总周期的 <strong>40%–60%</strong>，一个先进节点要经历 60–90 步光刻；光刻机约占生产线总投资的 20%、全球 WFE 支出的 24%。</p>
<p>并非所有掩模层同等困难：栅极层、最底层金属、通孔层等少数<strong>关键层</strong>使用极限工艺（浸没式 ArF / EUV + 全套 RET），其余层用成熟工艺控成本。一颗先进芯片只有约二十余层需要重度计算光刻处理，但这二十余层足以消耗数万台服务器数周机时。</p>
<p>摩尔定律的经济学基础是 Dennard 缩放；而"7 nm""5 nm"这类节点名自 1990 年代末起已与任何可测尺寸脱钩，成为代际品牌标签——浸没式光刻 2008 年支撑 40 nm 节点，2018 年仍是 7 nm 主力，波长始终停在 193 nm，缺口全靠 NA 提升与 k₁ 压榨填补。</p>

<h2>1.2 分辨率极限：Rayleigh 判据与 k₁ 因子</h2>
<p>投影光刻分辨率由 Rayleigh 公式统一刻画：</p>
$$CD = k_1 \\frac{\\lambda}{NA}, \\qquad NA = n\\sin\\theta$$
$$DOF = k_2 \\frac{\\lambda}{NA^2}$$
<p>物理极限 k₁ = 0.25 来自双光束干涉条件：至少 0 级与一个 ±1 级衍射光同时进入光瞳才能成像（第二章给出完整推导）。注意式中的尖锐权衡：分辨率按 1/NA 改善，焦深却按 1/NA² 恶化——193 nm、NA 1.35 时 DOF 仅约 53 nm。</p>
<div class="demo" data-demo="rayleigh"></div>

<h2>1.3 k₁ 的四十年下行曲线</h2>
<table>
<tr><th>时代 / 技术</th><th>k₁ 典型值</th><th>说明</th></tr>
<tr><td>高对比度时代（无 RET，1980s）</td><td>0.7–0.8</td><td>掩模近似忠实成像</td></tr>
<tr><td>规则 OPC（250–180 nm）</td><td>0.5–0.6</td><td>查表式边缘修正</td></tr>
<tr><td>OPC 频域扩展极限</td><td>≈0.45</td><td>频率覆盖 1.2–1.3 NA/λ</td></tr>
<tr><td>离轴照明（45° 四极 / 轴向四极+光瞳滤波）</td><td>≈0.43 / 0.30</td><td>扩展有效频率覆盖</td></tr>
<tr><td>交替相移掩模 AltPSM</td><td>≈0.35</td><td>Levenson 1982</td></tr>
<tr><td>ArF 浸没 45 nm 半周期</td><td>0.28–0.33</td><td>NA=1.35 量产平台</td></tr>
<tr><td>ArF 浸没单曝极限（38 nm 半周期）</td><td>0.27–0.28</td><td>量产 k₁ 最低点</td></tr>
<tr><td>物理极限（两光束干涉）</td><td>0.25</td><td>低于此值单曝对比度不足</td></tr>
<tr><td>多重曝光（DPT/SADP）</td><td>等效 k₁<0.25</td><td>拆分版图降低图形密度</td></tr>
</table>
<p>每一次 k₁ 下探都对应一种新自由度被纳入调控：掩模振幅（OPC）→ 掩模相位（PSM）→ 光源角度（OAI）→ 掩模拓扑（ILT）→ 曝光次数（多重曝光）——这条<strong>"自由度接力"</strong>正是本 Wiki 的叙事主线。</p>

<h2>1.4 计算光刻的定义与三阶段</h2>
<p>计算光刻是以正向成像模型为基础的<strong>逆向优化</strong>：设掩模复透射率为 $m(\\mathbf{r})$，成像链为正向算子 $\\mathcal{H}$，目标图形为 $z$，则求解</p>
$$\\hat{m} = \\arg\\min_m \\, \\lVert \\mathcal{H}\\{m\\} - z \\rVert_2^2 + \\lambda_R R(m)$$
<p>$R(m)$ 为可制造性正则项。由于 $\\mathcal{H}$ 含低通滤波与非线性阈值，解不唯一——这既是困难也是机会：巨大的解空间里存在比"照抄版图"好得多的掩模。掩模从"被复印的底片"变成"被优化的衍射元件"。</p>
<ul>
<li><strong>规则 OPC</strong>（250–180 nm）：查找表 + 模板修正，手工查表近似。</li>
<li><strong>模型 OPC</strong>（90 nm 起，Rieger/Cobb 等 1990s）：正向仿真 + EPE 反馈迭代；Cobb 的 SOCS 分解使全芯片前向仿真可行。</li>
<li><strong>逆光刻 ILT</strong>：掩模像素化、逐像素梯度优化，允许任意拓扑。思想早于 OPC（Saleh & Sayegh 1981），2023 年 NVIDIA cuLitho 宣称提速约 40 倍、2024 年在 TSMC 与 Synopsys 投产，ILT 由此成为先进节点标准流程。</li>
</ul>
<blockquote>产业格局：ASML/Brion（Tachyon，SMO 领先）、Synopsys（Proteus，ILT 部署最广）、Siemens EDA（Calibre nmOPC）、KLA（PROLITH）、NVIDIA（cuLitho 算力层）；国产方面东方晶源（PanGenILT 全芯片 ILT）与宇微光学已进入产线验证。</blockquote>

<div class="keypoints"><ul>
<li>Rayleigh 公式 $CD=k_1\\lambda/NA$ 与焦深公式构成全部讨论的出发点；k₁ 物理极限 0.25 来自双光束干涉。</li>
<li>计算光刻 = 正向建模 + 逆向优化 + 正则化；三阶段为规则 OPC → 模型 OPC → ILT。</li>
<li>"自由度接力"：每当 k₁ 逼近极限，就把新的物理自由度纳入优化。</li>
</ul></div>`
},

ch2: {
  no: '第二章', title: '光学成像的数学基础', en: 'Mathematical Foundations of Optical Imaging',
  desc: '傅里叶光学、Abbe 成像理论、点扩散函数与 MTF、标量衍射的边界与矢量效应。',
  html: `
<p class="lead">k₁ 的极限 0.25 从何而来？为什么增大 NA 能提高分辨率？答案必须回到波动光学：成像即两次傅里叶变换，分辨率即频谱截断。</p>

<h2>2.1 傅里叶光学预备</h2>
<p>单色光场可分解为平面波叠加，空间频率 $(f_x,f_y)$ 对应传播方向 $\\sin\\theta_x=\\lambda f_x$。由于 $|\\sin\\theta|\\le 1$，只有 $f\\le 1/\\lambda$ 的分量能到达远场——更高频率是倏逝波，这就是衍射极限的根源。</p>
<p>薄透镜后焦面上的复振幅正比于前焦面物分布的傅里叶变换；两块透镜组成 4f 系统，公共焦面即频谱面。光刻机概念上与之同构：<strong>掩模面是物面，光瞳面是频谱面，晶圆面是像面</strong>。频谱面是可以"动手"的物理平面——离轴照明、相移掩模、光瞳滤波都是对频谱做外科手术。</p>
<p>投影物镜的全部成像性质由光瞳函数决定：</p>
$$P(f_x,f_y)=\\begin{cases} e^{ikW(f_x,f_y)}, & f_x^2+f_y^2\\le f_c^2 \\\\ 0, & \\text{其余}\\end{cases}, \\qquad f_c = \\frac{NA}{\\lambda}$$
先进物镜波前像差已在亚纳米量级（RMS 远小于 λ/50），非常接近衍射受限。</p>

<h2>2.2 Abbe 成像理论</h2>
<p>1873 年 Abbe 提出两步模型：① 照明光被掩模衍射，在物镜后焦面形成衍射谱；② 各衍射级次作为次级波源在像面干涉成像。第一步是傅里叶变换，第二步是逆变换——但孔径有限，频谱被截断，像不可能等于物。</p>
<p>对占空比 1:1、周期 p 的一维二元线条，$t(x)=\\sum a_m e^{i2\\pi m f_0 x}$（$f_0=1/p$，$a_0=1/2$，$a_{\\pm1}=1/\\pi$）。若光瞳只通过 0 与 ±1 级：</p>
$$U_i(x)=\\frac{1}{2}+\\frac{2}{\\pi}\\cos(2\\pi f_0 x), \\qquad I_i(x)=\\left[\\frac{1}{2}+\\frac{2}{\\pi}\\cos(2\\pi f_0 x)\\right]^2$$
<p>只要 ±1 级进入光瞳，像面就复现同周期条纹（亮峰 1.34、暗谷 0.017）；若连 ±1 级也被挡住，只剩直流 $I_i=1/4$，图形彻底丢失。<strong>"至少两个衍射级次参与干涉才能成像"</strong>由此成为代数结论：</p>
$$\\frac{1}{p}\\le\\frac{NA}{\\lambda} \\;\\Rightarrow\\; HP_{min}=\\frac{\\lambda}{2NA} \\;\\Rightarrow\\; k_1 = 0.25$$
<div class="demo" data-demo="abbe"></div>

<h2>2.3 相干成像与点扩散函数</h2>
<p>相干照明下系统对<strong>复振幅</strong>线性：$U_i = h \\otimes U_g$，相干传递函数即光瞳函数本身。圆形光瞳的强度 PSF 为 Airy 分布：</p>
$$I_{PSF}(r)=\\left[\\frac{2J_1(v)}{v}\\right]^2, \\qquad v=\\frac{2\\pi}{\\lambda}NA\\cdot r$$
<p>第一零点半径 $0.61\\lambda/NA$ 即经典 Rayleigh 两点判据（相当于 k₁=0.61；光刻分辨周期图形且借助光刻胶非线性阈值，故可到 0.25）。</p>
<table>
<tr><th>照明类型</th><th>线性量</th><th>传递函数</th><th>截止频率</th></tr>
<tr><td>相干（点光源）</td><td>复振幅</td><td>CTF = 光瞳函数 P</td><td>$NA/\\lambda$</td></tr>
<tr><td>非相干</td><td>强度</td><td>OTF（光瞳自相关）</td><td>$2NA/\\lambda$</td></tr>
<tr><td>部分相干（0<σ<1）</td><td>双线性（Hopkins）</td><td>TCC</td><td>$\\approx(1+\\sigma)NA/\\lambda$</td></tr>
</table>
<p>非相干截止频率更高但通带中段对比度持续下降；实际光刻用扩展光源，介于二者之间，$\\sigma = NA_{ill}/NA_{obj}$ 典型 0.3–0.7。例：NA=1.35、σ=0.7 时表观截止约 11.9 µm⁻¹，对应周期约 84 nm——单靠扩展光源仍不足以覆盖 76 nm 周期，这就是必须叠加 OAI、PSM 与 OPC 的定量理由。</p>

<h2>2.4 标量衍射与矢量成像</h2>
<p>标量理论以 Helmholtz 方程 $\\nabla^2 U+k^2U=0$ 出发，经 Kirchhoff 边界条件得衍射积分；相位项泰勒展开保留二次项为 Fresnel 近似，只留线性项为 Fraunhofer 近似（远场 = 傅里叶变换）。</p>
<p>高 NA（经验警戒线 NA≳0.6–0.7）下偏振不可忽略：双光束干涉中 TM 偏振对比度退化为</p>
$$\\text{Contrast}_{TM} = \\cos(2\\theta) = 1 - 2\\left(\\frac{k_1\\lambda}{n\\cdot HP}\\right)^2$$
<p>k₁→0.25 时 TM 对比度先撞墙；浸没系统中同样 NA 所需实际角度更小，TM 对比度优于干式。工程对策是偏振照明；完整矢量成像需 Richards–Wolf 积分，先进节点 ILT 与 EUV 掩模 3D 模型都必须建立在矢量框架上。</p>

<div class="keypoints"><ul>
<li>成像 = 两次傅里叶变换 + 频谱截断；截止频率 $f_c = NA/\\lambda$。</li>
<li>k₁=0.25 的物理极限 = "0 级与一个 ±1 级同时入瞳"的代数结果。</li>
<li>相干/非相干/部分相干分别以 CTF / OTF / TCC 描述，截止频率 $NA/\\lambda$、$2NA/\\lambda$、$(1+\\sigma)NA/\\lambda$。</li>
</ul></div>`
},

ch3: {
  no: '第三章', title: '部分相干成像理论', en: 'Partially Coherent Imaging: Hopkins & TCC',
  desc: 'Hopkins 四重积分、TCC 的定义与厄米半正定性、SOCS 分解与九个数量级的加速。',
  html: `
<p class="lead">真实光源是扩展光源：掩模上任意两点的光场既非完全相关也非完全无关。本章回答两个问题——如何统一计算任意相干态的像（Hopkins 方程），以及它为何能高效到嵌入 OPC/ILT 迭代（SOCS 分解）。</p>

<h2>3.1 部分相干光的数学描述</h2>
<p>互相干函数 $\\Gamma(\\mathbf{r}_1,\\mathbf{r}_2;\\tau)=\\langle U(\\mathbf{r}_1,t+\\tau)U^*(\\mathbf{r}_2,t)\\rangle$；准单色光下退化为互强度 $J(\\mathbf{r}_1,\\mathbf{r}_2)$，归一化即复相干度 $\\gamma$。van Cittert–Zernike 定理：空间非相干扩展光源经自由传播产生的互强度正比于光源强度分布的傅里叶变换——光源越大，空间相干性越差。光刻机采用科勒照明，掩模面互强度的频域对应物直接就是光源分布本身。工程上用单一参数概括相干程度：$\\sigma = NA_{ill}/NA_{obj}$。部分相干把可传递频带展宽到 $(1+\\sigma)NA/\\lambda$，这是它支撑低 k₁ 成像的几何本质。</p>

<h2>3.2 Hopkins 成像方程与 TCC</h2>
<p>Abbe 方法把扩展光源离散为点源，每个点源做一次相干成像，再按源强权重非相干叠加：</p>
$$I(x,y)=\\frac{1}{J_{sum}}\\iint J(f_s,g_s)\\,|A_{(f_s,g_s)}(x,y)|^2\\,df_s\\,dg_s$$
<p>交换积分次序、把含源点坐标的因子先行积出（再现 van Cittert–Zernike），即得 Hopkins 空间域四重积分：</p>
$$I=\\iiiint J(\\mathbf{r}_1-\\mathbf{r}_2)\\,K(\\mathbf{r}-\\mathbf{r}_1)K^*(\\mathbf{r}-\\mathbf{r}_2)\\,M(\\mathbf{r}_1)M^*(\\mathbf{r}_2)\\,d\\mathbf{r}_1 d\\mathbf{r}_2$$
<p>换到频域，把与掩模无关的因子一次性折叠为<strong>传输交叉系数</strong>：</p>
$$TCC(\\mathbf{f}';\\mathbf{f}'')=\\iint J(\\mathbf{f})\\,H(\\mathbf{f}+\\mathbf{f}')\\,H^*(\\mathbf{f}+\\mathbf{f}'')\\,d\\mathbf{f}$$
<p>TCC 是掩模谱中两个频率分量之间的耦合强度，只依赖照明、NA、离焦与像差，<strong>与掩模无关</strong>——给定工艺条件只需算一次，之后对任意掩模复用。Abbe 与 Hopkins 数学上严格等价（2026 年 PIER 的统一框架证明同离散表示下可达机器精度一致），区别仅是积分次序：Hopkins 适合固定照明反复换掩模（OPC/ILT），Abbe 适合光源本身是优化变量（SO/SMO）。</p>

<h2>3.3 SOCS 分解与快速计算</h2>
<p>TCC 算子<strong>厄米且半正定</strong>，由 Mercer 定理可展开为正交特征函数级数：</p>
$$TCC(\\mathbf{f}';\\mathbf{f}'')=\\sum_{k=1}^{\\infty}\\kappa_k\\,\\Phi_k(\\mathbf{f}')\\Phi_k^*(\\mathbf{f}''), \\qquad \\kappa_1\\ge\\kappa_2\\ge\\dots\\ge 0$$
<p>代回成像方程，部分相干成像精确等于一组相干系统输出的非相干加权和——<strong>SOCS（Sum of Coherent Systems）</strong>：</p>
$$I(x,y)=\\sum_{k=1}^{\\infty}\\kappa_k\\,\\big|\\phi_k(x,y)\\otimes M(x,y)\\big|^2$$
<p>特征值近似指数衰减，只保留前 Q 个核即得 SOCS 近似；对典型 193 nm 浸没条件，前 61 个核可覆盖 98.3% 能量。复杂度对比（像面 N² 像素）：直接四重积分 O(N⁶)；Abbe 源点求和 O(SN²log N)；SOCS+FFT 仅 O(QN²log N)。取 N=1024、Q=64：直接法约 1.15×10¹⁸ 次乘加（每秒 10¹⁰ 次的机器上约三年半），SOCS 约 1.3×10⁹ 次（0.13 秒）——九个数量级的差距使"每修正一次掩模就重算一次空间像"的模型 OPC 成为可能。</p>

<h2>3.4 照明模式的数学描述</h2>
<p>以归一化光瞳径向坐标 ρ（光瞳边缘 ρ=1）参数化五种标准照明：</p>
<table>
<tr><th>照明模式</th><th>形状</th><th>关键参数</th><th>适用图形</th></tr>
<tr><td>传统（圆形）</td><td>均匀圆盘</td><td>σ（典型 0.5–0.85）</td><td>通用</td></tr>
<tr><td>环形</td><td>环带</td><td>σ_in / σ_out（如 0.5/0.9）</td><td>各向同性密集线条</td></tr>
<tr><td>二极 Dipole</td><td>两个离轴极区</td><td>极心 σ_c、极区大小</td><td>单一方向密集线条</td></tr>
<tr><td>四极 Quasar</td><td>四个离轴极区（45°）</td><td>σ_c、张角 30°/45°</td><td>x/y 两方向图形</td></tr>
<tr><td>自由照明</td><td>像素化任意分布</td><td>光瞳逐点强度</td><td>SMO 定制</td></tr>
</table>
<div class="demo" data-demo="illum"></div>
<p>离轴照明的思想是"只保留好的角度"：让 0 级与 +1 级以对称倾角通过光瞳，干涉条纹对离焦一阶不敏感，同时改善对比度与焦深。代价是方向选择性：Dipole-X 只增强 x 方向图形，四极对横竖都有中等增益，环形是各向同性折中。照明自由度从单参数 σ 一路扩展到逐像素任意分布——照明从"给定条件"变成"优化变量"，这正是第九章 SMO 的前提。硬件上由 ASML FlexRay 微镜阵列或定制 DOE 实现。</p>

<div class="keypoints"><ul>
<li>Hopkins 方程把光源折叠进 TCC：算一次、任意掩模复用；TCC 厄米半正定。</li>
<li>SOCS：部分相干 = 若干相干系统的加权和，特征值指数衰减，加速约 10⁹ 倍。</li>
<li>照明模式是 TCC 的形状开关；方向性照明以方向选择性换取目标方向的对比度与焦深。</li>
</ul></div>`
},

ch4: {
  no: '第四章', title: '成像质量评价与光刻胶模型', en: 'Image Quality Metrics & Resist Models',
  desc: 'NILS、曝光宽容度、工艺窗口与 Bossung 曲线；Dill ABC 参数、CAR 与 Mack 显影模型；EPE、MEEF 与 PV band。',
  html: `
<p class="lead">空间像只是连续光强分布——它算不算"好"、经曝光显影后变成什么图形，需要一套可量化的指标与光刻胶模型。</p>

<h2>4.1 空间像质量指标</h2>
<p>图像对数斜率及其归一化形式：</p>
$$ILS = \\frac{1}{I}\\frac{\\partial I}{\\partial x}\\Big|_{edge}, \\qquad NILS = CD \\cdot ILS$$
<p>NILS 直接决定曝光宽容度：剂量相对误差引起的 CD 误差 $\\Delta CD/CD \\approx \\Delta E/(E\\cdot NILS)$，量产通常要求 NILS ≥ 2 量级。对比度 $(I_{max}-I_{min})/(I_{max}+I_{min})$、曝光宽容度 EL 与焦深 DOF 共同刻画工艺稳健性；把不同离焦-剂量组合下的 CD 画成曲线簇即 <strong>Bossung 曲线</strong>，满足 CD 规格的 (E, z) 区域为<strong>工艺窗口</strong>（Process Window），常用内接最大椭圆面积量化。</p>

<h2>4.2 光刻胶曝光与显影模型</h2>
<ul>
<li><strong>阈值模型</strong>：$I \\ge I_{th}$ 处显影，简单快速，是 OPC/ILT 迭代的主力近似；局限是完全忽略胶的化学过程。</li>
<li><strong>Dill 模型</strong>：以 ABC 三个参数描述曝光动力学——A（漂白吸收）、B（非漂白吸收）、C（光敏速率），光敏剂浓度遵循耦合微分方程。</li>
<li><strong>化学放大胶 CAR</strong>：光酸产生 → PEB 扩散 → 催化脱保护反应链；一个光子触发多次脱保护，灵敏度大幅提升，但酸扩散引入模糊（acid blur），是 EUV 随机效应的来源之一。</li>
<li><strong>Mack 显影模型</strong>：显影速率 $r(m)$ 为光敏剂浓度的经验函数；集总参数模型 LPM 把整条胶链压缩为少量可校准参数。</li>
</ul>
<p>工程实践中常把阈值模型推广为 sigmoid 软阈值 $Z = \\mathrm{sig}(a(I-t))$，既保留"切轮廓"的非线性，又让整条链路处处可微——这是 ILT/SMO 梯度法的标准前向模型（第七、九章）。</p>

<h2>4.3 图形误差度量</h2>
<p><strong>EPE（边缘放置误差）</strong>：仿真轮廓与目标边缘的法向偏差，是 OPC 迭代的直接反馈量；<strong>MEEF（掩模误差增强因子）</strong>：</p>
$$MEEF = \\frac{\\partial CD_{wafer}}{\\partial CD_{mask}/M}$$
<p>低 k₁ 下 MEEF 可达 3–5 甚至更高：掩模上 1 nm 的误差被放大成晶圆上数 nm——k₁ 越低，对掩模制造与 OPC 精度的要求越苛刻。<strong>PV band</strong>：在所有工艺角（离焦、剂量、掩模偏差）下轮廓的包络带，其宽度直接度量工艺窗口被"吃掉"多少。数值例：由 $\\Delta CD \\approx CD\\cdot\\Delta E/(E\\cdot NILS)$，NILS=2.0、剂量误差 2% 时 CD 误差约 1%。</p>

<div class="keypoints"><ul>
<li>NILS 把"像的陡度"与"CD 对剂量误差的敏感度"联系起来，是最重要的单点像质指标。</li>
<li>工艺窗口（EL × DOF）是一切 RET/OPC/SMO 优化的最终目标函数。</li>
<li>EPE 驱动迭代，MEEF 度量低 k₁ 的误差放大，PV band 给出多工艺角下的最坏包络。</li>
</ul></div>`
},

ch5: {
  no: '第五章', title: '分辨率增强技术 RET', en: 'Resolution Enhancement Techniques',
  desc: '光学邻近效应的四种现象，PSM、OAI、SRAF 三大 RET 的原理与组合策略。',
  html: `
<p class="lead">当 k₁ 跌破 0.5，掩模图形不再忠实成像：线条缩短、拐角圆化、密集与孤立图形 CD 分叉。RET 的任务是在频域与相域上把丢失的信息"塞回"光瞳。</p>

<h2>5.1 光学邻近效应的现象学</h2>
<p>四种典型 OPE 现象：① 线端缩短（line-end pullback）；② 拐角圆化（corner rounding）；③ 密集/孤立偏差（iso-dense bias）；④ 线宽随周期变化的 pitch 依赖。频域解释统一而简单：高频分量被光瞳截断，方波边缘退化为平滑过渡；不同周期图形的衍射级次落在光瞳内的比例不同，成像质量因而随周期起伏。</p>

<h2>5.2 相移掩模 PSM</h2>
<p>把掩模当作衍射元件而非底片：在相邻透光区引入 180° 相位差，使 0 级衍射相消、能量集中到 ±1 级。</p>
<ul>
<li><strong>衰减型 AttPSM</strong>：以部分透光（约 6%）的反相材料替代不透明铬，边缘处振幅穿越零点，对数斜率提升；制造简单、无相位冲突，是应用最广的 PSM。</li>
<li><strong>交替型 AltPSM</strong>（Levenson 1982）：相邻透光区 0°/180° 交替，相当于把成像变为"两束 ±1 级光"的干涉，k₁ 可从约 0.7 降至约 0.35——历史上第一次把掩模当衍射元件设计；代价是相位冲突（一条线两侧相位无法同时满足）需要版图着色与双曝光解决。</li>
<li><strong>无铬相位掩模 CPL</strong>：用刻蚀石英构成相位图形，兼有 AttPSM 与 AltPSM 特性。</li>
</ul>

<h2>5.3 离轴照明 OAI</h2>
<p>双光束成像几何：对周期 p 的线条，0 级与 +1 级关于光轴对称入瞳时条纹对离焦一阶不敏感。把光源移到光瞳边缘恰好实现这一几何——最佳离轴角满足 $\\sin\\theta = \\lambda/(2p)$。环形、四极、二极分别对应各向同性、横竖兼顾、单方向极致三种权衡（见第三章）。OAI 的副作用是<strong>禁止 pitch</strong>：某些周期的衍射级次恰好都落在光源几何的"盲区"，成像质量反而劣于常规照明——这解释了为什么实际工艺要 OAI 与 SRAF 联用。</p>

<h2>5.4 亚分辨率辅助图形 SRAF</h2>
<p>在孤立图形旁放置细到无法自行印刷的辅助条（SRAF），使孤立图形的频谱环境"拟密集化"：衍射级次分布接近密集图形，从而获得与密集图形相近的对比度与焦深。SRAF 的放置是带约束的优化：太远离无效果，太近/太宽会被印出来（不可打印约束）；规则表时代靠 DOE 实验标定，如今由模型驱动甚至由 ILT 自发涌现（第八章水平集的拓扑变化会自然长出 SRAF）。</p>

<h2>5.5 RET 组合策略</h2>
<table>
<tr><th>技术</th><th>操纵的自由度</th><th>典型 k₁ 收益</th><th>主要代价</th></tr>
<tr><td>OPC（第六章）</td><td>掩模振幅/几何</td><td>0.5→0.45</td><td>计算量、掩模复杂度</td></tr>
<tr><td>AttPSM</td><td>掩模相位</td><td>边缘斜率显著提升</td><td>掩模成本</td></tr>
<tr><td>AltPSM</td><td>掩模相位（强）</td><td>→≈0.35</td><td>相位冲突、双重曝光</td></tr>
<tr><td>OAI</td><td>光源角度分布</td><td>→≈0.43/0.30</td><td>方向选择性、禁止 pitch</td></tr>
<tr><td>SRAF</td><td>掩模拓扑（辅助）</td><td>孤立图形匹配密集</td><td>不可打印约束</td></tr>
</table>
<p>各节点实践中 RET 很少单用：浸没式平台的标准组合是"四极/环形照明 + AttPSM + SRAF + 模型 OPC"，SMO（第九章）则把光源也纳入同一优化问题。</p>

<div class="keypoints"><ul>
<li>PSM 操纵相位（0 级相消）、OAI 操纵照明角度（级次择优）、SRAF 操纵局部图形密度。</li>
<li>RET 的频域本质统一：让更多有效频率信息以更好的相位关系穿过光瞳。</li>
<li>每种 RET 都有代价——禁止 pitch、相位冲突、可打印性，工程是折中的艺术。</li>
</ul></div>`
},

ch6: {
  no: '第六章', title: '光学邻近效应修正 OPC', en: 'Optical Proximity Correction',
  desc: '从规则到模型：EPE 反馈迭代、模型校准、运行时间与验证的工程挑战。',
  html: `
<p class="lead">OPC 是计算光刻工业化的起点：既然知道成像会把图形"印歪"，就预先把掩模图形"掰弯"，让歪打正着。</p>

<h2>6.1 基本思想与分类</h2>
<p>预畸变补偿：目标轮廓 $T$、前向模型 $\\mathcal{H}$，求掩模使 $\\mathcal{H}\\{M\\}\\approx T$。<strong>规则 OPC</strong> 把实验/仿真总结成查找表（"某线宽某间距边移多少 nm、线端加多大 hammerhead、拐角加多大 serif"），适用于 180 nm 以上图形环境有限的节点；<strong>模型 OPC</strong>（90 nm 起成为主流）每次修正都用 Hopkins/SOCS 模型重新仿真，以仿真轮廓与目标的偏差驱动下一轮修正。</p>

<h2>6.2 模型 OPC 的算法流程</h2>
<ol>
<li><strong>版图切分</strong>：把多边形边缘切成小段（fragment），在段上布置评估点；切分粒度决定精度与速度的折中。</li>
<li><strong>前向仿真</strong>：SOCS 卷积 + 阈值/胶模型得到轮廓，量取每个评估点的 EPE。</li>
<li><strong>反馈修正</strong>：按 EPE 反方向移动边段，步长乘阻尼因子（典型 0.3–0.7）避免振荡；MEEF 高的区域需要更小步长。</li>
<li><strong>收敛判据与发散防护</strong>：|EPE| 全部小于阈值或迭代上限；对振荡段回退、对相互拉扯的相邻段做一致性约束。</li>
</ol>
<p>迭代格式写成 $\\Delta e^{(k+1)} = -\\eta\\cdot EPE^{(k)}/(1+MEEF)$ 一类阻尼反馈——MEEF 出现在分母上，直观体现了低 k₁ 区"轻轻一碰就过冲"的数值性格。</p>

<h2>6.3 模型校准</h2>
<p>模型 OPC 的精度上限由模型决定：用一组覆盖设计空间的一维/二维校准图形（CD-SEM 量测数千至上万条 CD），拟合光学参数（NA、σ、离焦、像差）与胶参数（阈值、扩散长度、LPM 参数），以 RMS 拟合残差为指标。校准集不足会<strong>过拟合</strong>——量测点漂亮、新图形翻车；工业实践用独立验证集交叉检查，并对物理不可信的参数加约束。</p>

<h2>6.4 工程挑战</h2>
<ul>
<li><strong>运行时间</strong>：全芯片数十亿多边形、每段每次迭代都要成像仿真。对策：层次化复用（相同 cell 算一次）、图形匹配缓存、分区 + 分布式计算、GPU 加速（cuLitho）。</li>
<li><strong>OPC 后验证 ORC</strong>：修正后再用独立模型做多工艺角仿真，检查 PV band、桥接/断线热点，形成"修正—验证—修复"闭环（第十三章）。</li>
<li><strong>与规则 OPC 对比</strong>：规则法快且可预期但覆盖有限；模型法普适且精确但依赖校准质量与算力。实际流程常混合：简单层规则 OPC，关键层模型 OPC，热点区 ILT。</li>
</ul>

<div class="keypoints"><ul>
<li>模型 OPC = "仿真—量 EPE—阻尼移边"的反馈回路；MEEF 决定反馈增益的上限。</li>
<li>模型校准是精度天花板：校准图形集设计 + 过拟合防护同等重要。</li>
<li>OPC 修的是"边的位置"；当移动边已不够用时，就该 ILT 出场了（下一章）。</li>
</ul></div>`
},

ch7: {
  no: '第七章', title: '逆光刻 ILT 的数学原理', en: 'Inverse Lithography: Mathematical Formulation',
  desc: '逆问题的不适定性与正则化、像素化掩模与 sigmoid 松弛、伴随法求梯度、优化算法谱系。',
  html: `
<p class="lead">OPC 只能"移动已有的边"。ILT 更进一步：把掩模像素化，让每个像素都是优化变量，允许解长出任意拓扑——包括自动涌现的 SRAF 与曲线轮廓。</p>

<h2>7.1 从正问题到逆问题</h2>
<p>正向链：掩模 $M$ →（成像算子）→ 空间像 $I$ →（阈值/胶）→ 轮廓 $Z$。逆问题 $ \\hat{M}=\\arg\\min_M \\lVert \\mathcal{H}\\{M\\}-Z_T \\rVert^2 $ 是<strong>不适定</strong>的：$\\mathcal{H}$ 含低通滤波（高频信息被光瞳丢弃）与非线性阈值，逆不存在或不唯一、对扰动敏感。正则化 $R(M)$ 因此不是可选项而是必需品：它把"能成像"的无穷多解约束到"能制造"的子集——掩模可制造性惩罚（最小线宽/间距/曲率/面积）、复杂度惩罚、以及把灰度解推向 0/1 两端的离散化惩罚。</p>

<h2>7.2 像素化掩模与连续松弛</h2>
<p>把掩模栅格化为 $N_p\\times N_p$ 像素，每个像素透过率 $m_i\\in[0,1]$。成像链用 sigmoid 软化：$Z=\\mathrm{sig}(a(I-t))$，整条链处处可微。目标函数：</p>
$$J(M)=\\big\\lVert Z_T - \\mathrm{sig}\\big(a(I\\{M\\}-t)\\big)\\big\\rVert_2^2 + \\gamma_d\\sum_i m_i(1-m_i) + \\gamma_{tv}\\,TV(M)$$
<p>其中 $m_i(1-m_i)$ 在 0/1 处取零、在中间取极大——把像素"吸"向二值。变量替换 $m_i=(1+\\cos\\theta_i)/2$ 可把 box 约束化为无约束问题，且在像素趋近 0/1 时梯度自动衰减，与离散化惩罚协同。</p>

<h2>7.3 梯度推导：伴随法</h2>
<p>目标函数对数百万个掩模像素逐一求导，若用有限差分需要数百万次成像仿真——不可行。<strong>伴随法（adjoint method）</strong>用链式法则逐层反传：正向做一次成像得到 $I$ 与 $Z$，把误差信号 $2(Z-Z_T)\\,aZ(1-Z)$ 当作"反向光源"穿回同一套光学系统，得到每个像素的梯度：</p>
$$\\frac{\\partial J}{\\partial M} = 2\\,\\mathrm{Re}\\sum_k \\kappa_k\\, \\phi_k^* \\circledast \\Big[\\big(2(Z-Z_T)aZ(1-Z)\\big)\\cdot(\\phi_k\\otimes M)\\Big]$$
<p>全部像素的梯度只需<strong>两次</strong>类成像仿真的代价——与问题规模无关。部分相干情形下对 SOCS 的每个相干核各做一次正向+反向即可。这一"两次仿真换全部梯度"的性质，是 ILT 在百万像素尺度上可行的根本原因，也与深度学习反向传播同构。</p>

<h2>7.4 数值优化算法</h2>
<table>
<tr><th>算法</th><th>代表工作</th><th>特点</th></tr>
<tr><td>模拟退火/像素翻转</td><td>Saleh & Sayegh 1981</td><td>全局性好；极慢，历史意义</td></tr>
<tr><td>凸集投影 POCS</td><td>Pati & Kailath 1994</td><td>理论优雅；难容复杂正则项</td></tr>
<tr><td>最速下降</td><td>Poonawala & Milanfar 2007</td><td>框架奠基；狭长谷收敛慢</td></tr>
<tr><td>共轭梯度 CG</td><td>Ma & Arce 2011</td><td>迭代数减约 1/2–2/3，工业常用</td></tr>
<tr><td>SGD / Adam</td><td>Jia & Lam 2010 等</td><td>离焦随机采样得鲁棒掩模</td></tr>
<tr><td>IHT（迭代硬阈值）</td><td>Ma et al. 2018</td><td>小波域稀疏先验，效率与可制造性兼得</td></tr>
<tr><td>Newton-IHT</td><td>Ma et al. 2019</td><td>近似 Hessian 预条件，二阶加速</td></tr>
</table>
<p>从连续解到二值掩模采用"过程二值化"：迭代中按退火调度增大 sigmoid 陡度 a 与离散化权重，收敛前灰度像素已被压向两端（(0.1, 0.9) 区间像素占比可压至 1% 以下），阈值化后再用同一模型复验并局部修补。</p>

<div class="keypoints"><ul>
<li>ILT = 不适定逆问题 + 正则化；正则项同时承担"可制造"与"可优化"两重职责。</li>
<li>伴随法以两次仿真的代价给出全部像素梯度——ILT 可行的数学基石。</li>
<li>算法谱系：无结构（退火/POCS）→ 一阶梯度（CG/SGD/Adam）→ 结构先验（IHT/Newton-IHT）。</li>
</ul></div>`
},

ch8: {
  no: '第八章', title: 'ILT 的算法实现与工程化', en: 'ILT in Practice: Level-Set, MRC & Full-Chip',
  desc: '水平集方法与拓扑涌现、掩模可制造性约束 MRC、全芯片 ILT 的计算挑战与 GPU 加速。',
  html: `
<p class="lead">逐像素 ILT 优化的是百万个独立灰度值，而光刻真正关心的是图形边界。水平集方法直接以轮廓为优化对象，并赋予 ILT 一项像素法难以企及的能力：拓扑的自发改变。</p>

<h2>8.1 水平集方法</h2>
<p>用高维函数 $\\phi(x,y)$ 的零等值线表示掩模边界：$\\phi>0$ 为铬区、$\\phi<0$ 为透光区。优化变成演化方程</p>
$$\\frac{\\partial \\phi}{\\partial t} = v(x,y)\\,|\\nabla\\phi|$$
<p>速度场 $v$ 由代价函数的 shape derivative 给出（边缘向外/向内推进的"力"）。水平集的天然优势：<strong>拓扑变化免费</strong>——零等值线可以自发分裂与合并，SRAF 因而能像"从溶液里析出晶体"一样在迭代中自发涌现，无需人工放置规则；轮廓处处光滑，天然更接近可制造的曲线掩模。</p>

<h2>8.2 掩模可制造性约束 MRC</h2>
<p>数学上最优的掩模常含碎屑、尖角与亚分辨率细丝——掩模厂写不出来也检不了。MRC 约束包括最小线宽/间距、最小曲率半径、最小图形面积；实现方式有惩罚项（软）与投影算子（硬）两类。曲线掩模（curvilinear）与曼哈顿掩模的制造差异曾是 ILT 落地的拦路虎：<strong>多束掩模写入机</strong>（multi-beam writer）用数万束并行电子束写入，写入时间与图形复杂度解耦，从硬件上解除了形状限制——这是 ILT 在 2020 年代爆发的三把钥匙之一（另两把是伴随法算法与 GPU 算力）。</p>

<h2>8.3 全芯片 ILT 的计算挑战</h2>
<p>局部 ILT（热点修补）与全芯片 ILT 的计算量相差数个数量级。全芯片方案必须处理：分区拼接处的边界一致性（D2S 的无缝合方案以重叠缓冲区 + 一致性约束消除接缝）；层次化复用与负载均衡；以及最根本的算力问题。NVIDIA cuLitho（2023）把成像与梯度计算移植到 GPU：宣称提速约 40 倍、500 台 DGX H100 可顶替约 4 万台 CPU 服务器，掩模处理周期从约两周压缩到过夜，2024 年在 TSMC 与 Synopsys 投产。</p>

<h2>8.4 ILT vs OPC 综合对比</h2>
<table>
<tr><th>维度</th><th>模型 OPC</th><th>ILT</th></tr>
<tr><td>优化对象</td><td>已有图形的边段位置</td><td>逐像素透过率 / 轮廓拓扑</td></tr>
<tr><td>解空间</td><td>受限于初始版图</td><td>含任意拓扑，SRAF 自发涌现</td></tr>
<tr><td>工艺窗口</td><td>基准</td><td>显著更大（尤其低 k₁ 与复杂二维图形）</td></tr>
<tr><td>计算成本</td><td>高</td><td>更高（GPU 时代可承受）</td></tr>
<tr><td>掩模复杂度</td><td>曼哈顿、易制造</td><td>曲线化，依赖多束写入</td></tr>
<tr><td>典型角色</td><td>成熟节点主力、ILT 的初值</td><td>先进节点关键层标准流程</td></tr>
</table>

<div class="keypoints"><ul>
<li>水平集以轮廓为变量：拓扑自由变化，SRAF 自发涌现。</li>
<li>MRC 不是事后检查，而是优化内生的约束；多束写入机解除了形状限制。</li>
<li>算法（伴随/水平集）+ 算力（GPU）+ 写入能力（多束）三瓶颈相继解除，ILT 升级为标准流程。</li>
</ul></div>`
},

ch9: {
  no: '第九章', title: '光源-掩模联合优化 SMO', en: 'Source Mask Optimization',
  desc: 'k₁<0.3 时单独优化掩模自由度不足；像素化光源、多工艺角目标函数、交替 vs 联合优化、自由照明硬件。',
  html: `
<p class="lead">当 k₁<0.3，掩模一个自由度已不够用——必须把光源也变成优化变量，让光与掩模协同"跳舞"。这就是 SMO，也是本 Wiki 作者每天在工作里打交道的引擎。</p>

<h2>9.1 动机与问题表述</h2>
<p>算例：90 nm 周期（半周期 45 nm）在 NA=1.35 下 $k_1 = 45\\times1.35/193 \\approx 0.315$——勉强可做，必须 SMO 级联合优化才能撑开工艺窗口；64 nm 周期（半周期 32 nm）$k_1\\approx0.224<0.25$，低于单曝物理极限，只能诉诸多重曝光或 EUV。<strong>SMO 的适用边界：把可制造 k₁ 从约 0.35 压到约 0.27，但不能突破 0.25。</strong></p>
<p>光源的数学表示与掩模像素化完全平行：把光瞳面栅格化（典型 21×21 至 31×31，约 400–1000 个自由度），每像素强度 $J_m\\ge0$ 独立可调。对比参数化表示（环形/二极，2–4 个变量，DOE 可制造性好但表达有限）、Zernike 展开（降维）与多极合成（利用稀疏性，可提速约 7 倍），<strong>像素化表示是工业主流</strong>：每个光源像素对应一个相干成像核，优化变量直接就是各核权重，与 TCC/SOCS 框架天然兼容。</p>

<h2>9.2 数学模型与算法</h2>
<p>前向模型（Abbe 源点求和形式）与胶的 sigmoid 近似：</p>
$$I(\\mathbf{r};J,M)=\\sum_{m=1}^{N_s} J_m\\,\\big|M(\\mathbf{r})\\circledast h_m(\\mathbf{r},z)\\big|^2, \\qquad Z=\\mathrm{sig}\\big(a(I-t)\\big)$$
<p>目标函数在多工艺角（离焦 ±Δz、剂量 ±ΔE、掩模 CD 偏差）集合 C 上加权 EPE，再加正则：</p>
$$\\min_{J,M}\\; F(J,M)=\\sum_{c\\in C} w_c\\sum_i w_i\\, EPE_i^{(c)}(J,M)^2 + \\gamma_1 R_{MRC}(M) + \\gamma_2 R_{smooth}(J)$$
<p>s.t. $J\\succeq 0$，$\\sum_m J_m = 1$。多工艺角采样是灵魂：只优化名义工况会得到"名义完美、一吹就倒"的解；把扰动角点纳入目标等价于直接最大化工艺窗口面积。</p>
<p>求解策略分两类：<strong>交替优化</strong>（固定掩模优化光源 SO → 固定光源做 MO/OPC → 往复；每步规模小、可复用成熟求解器，但沿坐标轴下降易停鞍部）与<strong>同步联合优化</strong>（伴随法同时算 $\\nabla_J F$ 与 $\\nabla_M F$ 同步更新）。ASML 2008 年对比实验证明同步型工艺窗口明显更大——最优组合位于联合空间的"山脊"上，交替法难以贴脊前进。因问题非凸、解不唯一，实践上以针对主周期的参数化照明（如四极）作初猜。</p>
<p>计算瓶颈与压缩感知加速：每算一次 $\\nabla_J F$ 需 $N_s$ 次相干成像。利用"最优光源是稀疏的"这一经验事实，把光源步改写为稀疏重构 $\\min_J \\lVert J\\rVert_1$ s.t. 成像保真、$\\sum J_m \\ge \\eta$——<strong>光瞳填充率 η 约束不可省略</strong>（否则光源被压成针尖亮点，通光量与吞吐量无法接受，工程上 η 一般不低于 20% 量级）。中科院韦亚一团队将 CS 光源优化用于 High-NA EUV SMO，GPU 提速 10 倍以上、图形误差降约 70%、约 150 s 完成一轮。</p>

<h2>9.3 自由照明的物理实现</h2>
<p>SMO 算出的自由照明要能被照明器"打印"出来：定制 DOE 每种光源一片、周期以周计；ASML <strong>FlexRay</strong>（2009）用数千个 MEMS 微镜对光瞳强度编程，数分钟生成任意形状（初设约 10 min），等效于机内存放"无限多片虚拟 DOE"。实测：FlexRay 光源与传统 DOE 的晶圆 CD 匹配优于 0.3 nm，连续 13 小时 CD 漂移 <0.03 nm；2010 年 imec 在 22 nm SRAM 接触孔层实测了自由照明在 EL、DOF 与 MEEF 上的收益。光源可制造性约束包括最小可分辨光斑、灰度连续性与填充率/吞吐量。</p>

<h2>9.4 高维扩展与工业实践</h2>
<p>SMO 的自由度还可继续扩展：SMPO 加入偏振态联合优化，SMPWO 加入光瞳波前（像差）联合优化。工业标准流程是"<strong>SMO 定全局光源、ILT 精修掩模</strong>"：先用 SMO 为某一层（或一组相似层）确定一个共享自由光源，再在该光源下对版图做 OPC/ILT。工艺窗口收益的来源可分解为：光源把能量集中到对主周期最有利的角度（对比度↑），掩模预畸变补偿邻近效应（EPE↓），二者协同使多工艺角下的公共窗口最大化。</p>
<div class="demo" data-demo="ilt"></div>

<div class="keypoints"><ul>
<li>SMO 把光源从"工艺条件"变成"优化变量"；像素化光源 + 像素化掩模，$J_m$ 即第 m 个相干核的权重。</li>
<li>多工艺角目标函数 = 数值化的工艺窗口最大化；联合优化优于交替优化（山脊直觉）。</li>
<li>压缩感知利用光源稀疏性加速；填充率约束保证通光量；FlexRay/DOE 负责把自由照明做出来。</li>
</ul></div>`
},

ch10: {
  no: '第十章', title: '多重曝光与工艺协同', en: 'Multiple Patterning & Co-optimization',
  desc: 'LELE 与图着色分解、SADP/SAQP 自对准方案、DTCO 与 EUV 时代的混合策略。',
  html: `
<p class="lead">k₁ 压到 0.27 已是 193i 单曝极限。再往下走，最后一次"自由度接力"交给了曝光次数本身：一次印不下，就拆成两次、四次印。</p>

<h2>10.1 动机</h2>
<p>193 nm 浸没单曝的半周期下限约 38 nm。更密图形的出路是降低单次曝光的图形密度：把版图拆到多张掩模上分别曝光。等效地，k₁ 可以"除以"拆分次数——这就是表 1-1 中"等效 k₁<0.25"的含义。</p>

<h2>10.2 LELE 与版图分解</h2>
<p><strong>Litho-Etch-Litho-Etch</strong>：第一套图形曝光刻蚀后，再曝光第二套互补图形。核心难点是版图分解的数学：<strong>图着色问题</strong>——把间距小于分解阈值的图形连边构成冲突图，二着色可行当且仅当无<strong>奇数环</strong>；存在奇数环时必须插入 stitch（把一条线拆到两张掩模拼接）或修改版图。三重/四重曝光（LE³/LE⁴）对应三/四着色，套刻误差（overlay）与 stitch 误差成为新的 CD 误差来源。</p>

<h2>10.3 自对准多重曝光 SADP/SAQP</h2>
<p><strong>SADP</strong>（自对准双重）：心轴曝光 → ALD 保形沉积侧墙 → 刻蚀回切 → 去心轴，侧墙即最终线条。七步工艺把 pitch 减半，且侧墙宽度由沉积厚度控制——CD 均匀性远好于两次独立曝光，代价是只能做规则的一维图形，且两侧墙间距交替出现 <strong>pitch walking</strong>。<strong>SAQP</strong> 再迭代一次，pitch 除以 4，是 7 nm 时代 FinFET 鳍片与金属层的主力方案。</p>

<h2>10.4 DTCO 与更广义协同</h2>
<p>多重曝光把"能不能印"变成了"版图能不能被分解"——设计规则必须随工艺反向调整：单向布线、固定 pitch 的标准单元、禁止奇数环的布线约束，这就是<strong>设计-工艺协同优化 DTCO</strong>。EUV 时代多重曝光并未消失：SALELE 等混合方案（自对准 + LELE）与定向自组装 DSA 继续把图形密度推向极限。</p>

<div class="keypoints"><ul>
<li>多重曝光 = 用曝光次数换 k₁；LELE 的版图分解 = 图着色，奇数环必须 stitch。</li>
<li>SADP/SAQP 用沉积厚度而非曝光控制 CD，精度高但图形受限，存在 pitch walking。</li>
<li>DTCO 把工艺约束前置到设计端，是"自由度接力"从光刻蔓延到设计的标志。</li>
</ul></div>`
},

ch11: {
  no: '第十一章', title: 'EUV 计算光刻', en: 'Computational Lithography for EUV',
  desc: '13.5 nm 反射式光学的新问题：掩模 3D 效应、随机效应、Flare，以及 High-NA 的新要求。',
  html: `
<p class="lead">波长从 193 nm 跳到 13.5 nm，k₁ 公式里的 λ 小了一个数量级——但 EUV 不是"免费午餐"：反射式光学、光子统计与随机效应带来一整套新的计算问题。</p>

<h2>11.1 系统特点</h2>
<p>13.5 nm 波长下所有材料都强吸收，只能采用<strong>反射式</strong>光学（Mo/Si 多层膜，每面反射率约 70%）；掩模也是反射式的，且因照明与投影光路不重合而<strong>倾斜入射</strong>（主光线角约 6°），非远心几何使标量薄掩模模型彻底失效。</p>

<h2>11.2 EUV 特有的成像问题</h2>
<ul>
<li><strong>掩模 3D 效应</strong>：吸收层厚度与波长可比拟，斜入射产生阴影效应（横向图形 CD 依方向偏移）、最佳焦面依图形方向分裂、telecentricity 误差。必须用时域有限差分/波导法全波仿真建立 mask-3D 紧凑模型。</li>
<li><strong>随机效应</strong>：13.5 nm 光子能量约为 193 nm 的 14 倍，同等剂量下光子数只有约 1/14——散粒噪声显著；叠加光酸涨落与 PEB 扩散，表现为线边粗糙度 LER、局部 CD 涨落乃至随机缺陷（桥接/断线）。这是 EUV 良率的头号敌人，需要 PSD（功率谱密度）建模与缺陷概率模型。</li>
<li><strong>Flare 杂散光</strong>：多层膜镜面粗糙度散射形成长程背景光，使局部有效剂量随版图密度变化，需按密度图做长程校正。</li>
</ul>

<h2>11.3 EUV 计算光刻方法</h2>
<p>EUV OPC/ILT 的前向模型必须升级为矢量 + mask-3D 紧凑模型，目标函数中加入随机项（以 LER 或缺陷概率为惩罚），并在剂量-吞吐量-良率三角中权衡：提高剂量压低散粒噪声，但光源功率有限、吞吐量下降。EUV 的 OPC 修正量普遍小于 193i 时代，但模型复杂度与验证成本高得多。</p>

<h2>11.4 High-NA EUV</h2>
<p>NA 从 0.33 提到 0.55（EXE 平台）：分辨率 $0.33/0.55$ 倍提升，代价是景深缩到 1/3 以下、采用变形光学（x/y 放大率 4×/8×）导致<strong>半场曝光</strong>，一个 die 需两次曝光拼接。High-NA 下 mask-3D 效应与随机效应进一步加剧，工艺窗口更窄——讲义给出的核心论据是：<strong>High-NA 时代 ILT 从"加分项"变成"标配"</strong>，因为只有像素级联合优化才能在如此紧张的窗口内挤出余量。</p>

<div class="keypoints"><ul>
<li>EUV = 反射式 + 斜入射：mask-3D 效应、随机效应、Flare 是新三大计算问题。</li>
<li>随机性的根源是光子统计：剂量、吞吐、良率构成硬约束三角。</li>
<li>High-NA（0.55）带来半场拼接与更窄窗口，ILT 由此成为标配。</li>
</ul></div>`
},

ch12: {
  no: '第十二章', title: '机器学习与 AI 计算光刻', en: 'Machine Learning for Computational Lithography',
  desc: 'CNN 加速成像仿真、AI-OPC 与 Neural-ILT、热点检测，以及物理与数据融合的未来。',
  html: `
<p class="lead">计算光刻的每一步都是"仿真 + 优化"，而深度学习最擅长近似昂贵的函数与反向搜索——两者天然合拍。</p>

<h2>12.1 AI 加速光刻仿真</h2>
<p>用 CNN 学习"掩模局部邻域 → 空间像/轮廓"的映射，推理比严格 SOCS 仿真快一到两个数量级；LithoGAN 等生成式方法直接生成轮廓。核心权衡是精度-速度：AI 模型适合快速筛选与初值生成，最终签核仍回到物理模型。训练数据的覆盖度决定泛化边界——分布外图形是主要风险。</p>

<h2>12.2 AI-OPC 与 AI-ILT</h2>
<ul>
<li><strong>直接预测</strong>：GAN/CNN 从目标版图一步生成 OPC 后掩模，省去迭代；局限是精度与可制造性需后处理保证。</li>
<li><strong>Neural-ILT</strong>：以神经网络参数化掩模或用网络输出作为 ILT 初值/正则先验；泛化性（训练集之外的新版图）仍是开放问题。</li>
<li><strong>LithoBench</strong>：公开基准与统一评测指标（EPE、PV band、运行时间、MRC 违规数）使方法可比。</li>
</ul>

<h2>12.3 热点检测与可制造性预测</h2>
<p>CNN 热点分类器把"版图片段 → 是否会桥接/断线"变成二分类，替代部分昂贵的全工艺角仿真；难点在于热点极度稀少（不平衡数据），需要过采样、代价敏感学习与异常检测配合。输出可直接反馈给 P&R 工具做可制造性评分。</p>

<h2>12.4 物理与数据的融合</h2>
<p><strong>PINN</strong>（物理信息神经网络）把 Hopkins/sigmoid 前向模型写进损失函数，用物理约束弥补数据稀缺；混合建模以 AI 做初值、物理模型做精修。商业落地侧：cuLitho 生态把 GPU 加速与 ML 组件结合，生成式掩模综合开始进入原型阶段；"信任度"（模型在分布外的行为可解释、可验证）是 AI 全面进入签核流程前必须跨过的门槛。</p>

<div class="keypoints"><ul>
<li>AI 的三条价值线：仿真加速、初值/逆解生成、热点快速筛选。</li>
<li>分布外泛化与可验证性是 AI 进入签核（sign-off）的核心障碍。</li>
<li>趋势不是 AI 取代物理模型，而是 PINN/混合建模范式下的"物理 + 数据"双轮驱动。</li>
</ul></div>`
},

ch13: {
  no: '第十三章', title: '全芯片验证与工程流程', en: 'Full-Chip Verification & Engineering Flow',
  desc: '芯片制造中最大的计算负载、验证-修复闭环、掩模数据准备 MDP 与商用软件栈格局。',
  html: `
<p class="lead">把前面所有算法搬上全芯片，才算真正进入工程世界：这是芯片制造中最大的计算负载之一。</p>

<h2>13.1 工程架构</h2>
<p>一颗先进芯片的版图形数达百亿量级，OPC/ILT 的前向仿真需要万亿次量级的卷积。标准架构：层次化处理（相同 cell 实例复用结果）→ 分区切割 + 重叠缓冲区 → 数千节点分布式计算 → GPU 集群加速。数据规模决定了计算光刻团队本质上是"披着光刻外衣的高性能计算团队"。</p>

<h2>13.2 验证与修复闭环</h2>
<p>OPC/ILT 之后必须独立验证：多工艺角仿真得到 <strong>PV band</strong> 最坏情况包络，识别热点并按类型分级（桥接、断线、pinch、overlay 敏感……）。三条热点检测路线：基于图形匹配（快、只能查已知模式）、基于仿真（准、慢）、基于机器学习（折中）。发现热点后回到局部 OPC/ILT 修复，形成"修正—验证—修复"闭环直至收敛。</p>

<h2>13.3 掩模数据准备 MDP</h2>
<p>修正后的掩模图形要翻译成写入机语言：fracturing（把曲线/斜边打散成写入机的矩形/梯形射击）、MPC（掩模工艺修正，补偿电子束邻近效应与刻蚀偏差）、像素级剂量校正；随后 MRC 检查、掩模 SEM 量测与 AIMS（空中像量测）验证，合格的掩模数据才发往晶圆厂。</p>

<h2>13.4 商用软件栈与产业格局</h2>
<table>
<tr><th>厂商</th><th>产品</th><th>强项</th></tr>
<tr><td>ASML / Brion</td><td>Tachyon</td><td>SMO 领先，与扫描机深度集成</td></tr>
<tr><td>Synopsys</td><td>Proteus</td><td>部署最广的 ILT 方案</td></tr>
<tr><td>Siemens EDA</td><td>Calibre nmOPC</td><td>层次化验证引擎、OPC/验证份额大</td></tr>
<tr><td>KLA</td><td>PROLITH</td><td>光刻成像与胶建模仿真标杆</td></tr>
<tr><td>NVIDIA</td><td>cuLitho</td><td>GPU 加速算力层，被 Synopsys 等集成</td></tr>
<tr><td>东方晶源</td><td>HPOT / PanGenILT</td><td>国产全芯片 ILT（公司口径为全球最早之一）</td></tr>
<tr><td>宇微光学</td><td>自主 OPC 软件</td><td>国产自主可控 OPC</td></tr>
</table>
<p>在研发时间线上，计算光刻位于"工艺研发 → PDK/设计规则冻结"之间：OPC 模型随工艺成熟反复重校准，SMO 光源通常在一组关键层确定后冻结复用。</p>

<div class="keypoints"><ul>
<li>全芯片 = 层次化 + 分区 + 分布式 + GPU 的系统工程。</li>
<li>验证-修复闭环与 MDP/MPC 是算法到硅片的"最后一公里"。</li>
<li>产业呈寡头格局，国产软件正从单点突破走向平台化。</li>
</ul></div>`
},

ch14: {
  no: '第十四章', title: '前沿展望', en: 'Frontiers & Outlook',
  desc: '曲线掩模产业化、High-NA/Hyper-NA 路线图、竞争与互补技术、方法论启示。',
  html: `
<p class="lead">计算光刻的故事远未结束：曲线掩模正在量产化，High-NA 已经上路，而"正向建模 + 逆向优化 + 算力加速"的范式正在向更多领域外溢。</p>

<h2>14.1 曲线掩模产业化</h2>
<p>SEMI P49（CURVILINEAR MASK 数据格式）标准与多束写入机的普及，使 ILT 天然输出的曲线掩模从"写不起"变成"可量产"。全芯片曲线 ILT 的成本结构随之改变：写入时间不再随顶点数爆炸，瓶颈回到计算侧——这反过来又推动 GPU 与 AI 加速的投入。</p>

<h2>14.2 High-NA 与 Hyper-NA 路线图</h2>
<p>EXE（0.55 NA）平台已进入各头部晶圆厂的导入节奏；更远的 Hyper-NA 与 BEUV（6.x nm 波段）仍在前瞻研究阶段。NA 每上一个台阶，mask-3D、随机效应与拼接问题就严峻一分，计算光刻的戏份只会更重。</p>

<h2>14.3 竞争与互补技术</h2>
<p>DSA 定向自组装与纳米压印 NIL 在特定图形（规则阵列、存储）上提供非光刻路径；先进封装与面板级光刻的图形尺度宽松、但翘曲与大面积均匀性带来另一类计算问题，是计算光刻外溢的新市场。中国研发布局覆盖 OPC/ILT 软件、光源优化算法与 GPU 加速，正从单点突破走向平台化。</p>

<h2>14.4 方法论启示</h2>
<p>回顾整场"自由度接力赛"，计算光刻给出的范式是通用的：<strong>精确的正向模型（可微、可快速求值）+ 伴随梯度 + 正则化/约束 + 足够算力</strong>。同一范式已见于天线设计、超表面、光子学反演乃至蛋白质设计。开放问题依然丰富：随机效应的可微建模、AI 逆解的签核级信任度、设计与工艺的全栈联合优化（DTCO 的下一步是 STCO）。</p>
<blockquote>把"成像"变成"优化问题"，把"工艺余量"变成"目标函数"——这是"计算"二字在光刻中的真正含义，也是这本讲义（以及这个 Wiki）想留下的核心直觉。</blockquote>

<div class="keypoints"><ul>
<li>曲线掩模 + 多束写入解除 ILT 的制造瓶颈；High-NA 使 ILT 成为标配。</li>
<li>DSA/NIL/先进封装是互补而非替代；计算光刻范式正在外溢。</li>
<li>"正向建模 + 逆向优化 + 算力加速"是可迁移的方法论资产。</li>
</ul></div>`
},

appA: {
  no: '附录 A', title: '常用符号、公式与术语', en: 'Notation, Key Formulas & Glossary',
  desc: '符号表、关键公式速查、中英术语对照。',
  html: `
<p class="lead">速查页：常用符号、各章核心公式与高频术语中英对照。</p>

<h2>A.1 常用符号</h2>
<table>
<tr><th>符号</th><th>含义</th></tr>
<tr><td>$\\lambda$</td><td>曝光波长（g 线 436 / i 线 365 / KrF 248 / ArF 193 / EUV 13.5 nm）</td></tr>
<tr><td>NA</td><td>数值孔径 $n\\sin\\theta$；浸没 1.35，EUV 0.33，High-NA 0.55</td></tr>
<tr><td>$k_1, k_2$</td><td>分辨率 / 焦深工艺因子；$k_1$ 物理极限 0.25</td></tr>
<tr><td>$\\sigma$</td><td>相干因子 $NA_{ill}/NA_{obj}$</td></tr>
<tr><td>$M(\\mathbf{r})$, $\\tilde M(\\mathbf{f})$</td><td>掩模复透过率及其频谱</td></tr>
<tr><td>$P$, $H$, $K$ / $h$</td><td>光瞳函数、相干传递函数、点扩散函数</td></tr>
<tr><td>$J(\\mathbf{f})$</td><td>光源强度分布（SMO 中逐像素 $J_m$）</td></tr>
<tr><td>TCC, $\\kappa_k$, $\\phi_k$</td><td>传输交叉系数及其特征值/相干核</td></tr>
<tr><td>EPE, MEEF, NILS</td><td>边缘放置误差、掩模误差增强因子、归一化对数斜率</td></tr>
<tr><td>DOF, EL, PW</td><td>焦深、曝光宽容度、工艺窗口</td></tr>
</table>

<h2>A.2 关键公式速查</h2>
$$CD = k_1\\frac{\\lambda}{NA} \\qquad DOF = k_2\\frac{\\lambda}{NA^2}$$
$$f_{c,coh}=\\frac{NA}{\\lambda}, \\quad f_{c,incoh}=\\frac{2NA}{\\lambda}, \\quad f_{c}\\approx\\frac{(1+\\sigma)NA}{\\lambda}$$
$$I_{PSF}(r)=\\left[\\frac{2J_1(v)}{v}\\right]^2,\\; v=\\tfrac{2\\pi}{\\lambda}NA\\,r \\qquad r_1 = 0.61\\lambda/NA$$
$$I(\\mathbf{r})=\\sum_k \\kappa_k\\,|\\phi_k\\otimes M|^2 \\quad\\text{(SOCS)}$$
$$Z=\\mathrm{sig}\\big(a(I-t)\\big), \\qquad \\hat M=\\arg\\min_M \\lVert Z_T-Z\\{M\\}\\rVert^2 + \\gamma R(M)$$
$$I(\\mathbf{r};J,M)=\\sum_m J_m|M\\circledast h_m|^2 \\quad\\text{(SMO 前向)}$$
$$\\text{Contrast}_{TM}=\\cos(2\\theta) \\qquad \\frac{\\Delta CD}{CD}\\approx\\frac{\\Delta E}{E\\cdot NILS}$$

<h2>A.3 术语速览（中—英）</h2>
<table>
<tr><th>中文</th><th>English</th><th>一句话</th></tr>
<tr><td>计算光刻</td><td>Computational Lithography</td><td>以正向模型为基础的逆向优化技术体系</td></tr>
<tr><td>光学邻近效应修正</td><td>OPC</td><td>预畸变掩模以补偿成像畸变</td></tr>
<tr><td>逆光刻</td><td>ILT</td><td>像素级掩模反演优化</td></tr>
<tr><td>光源-掩模联合优化</td><td>SMO</td><td>光源与掩模协同优化（本 Wiki 作者的日常）</td></tr>
<tr><td>相移掩模</td><td>PSM</td><td>用相位干涉提升分辨率</td></tr>
<tr><td>离轴照明</td><td>OAI</td><td>光源离轴，级次择优</td></tr>
<tr><td>亚分辨率辅助图形</td><td>SRAF</td><td>印不出来的"托儿"图形</td></tr>
<tr><td>传输交叉系数</td><td>TCC</td><td>掩模谱频率对之间的耦合核</td></tr>
<tr><td>相干系统求和</td><td>SOCS</td><td>部分相干 = 相干系统加权和</td></tr>
<tr><td>多重图形化</td><td>LELE / SADP / SAQP</td><td>拆分版图/自对准倍增密度</td></tr>
<tr><td>掩模可制造性规则</td><td>MRC</td><td>掩模厂写得出来的约束</td></tr>
<tr><td>工艺窗口</td><td>Process Window</td><td>剂量-焦深的合格区域</td></tr>
</table>

<div class="keypoints"><ul>
<li>本页适合收藏：写代码 / 读论文 / 开会时装作不经意地引用。</li>
<li>完整符号表、公式编号推导与延伸阅读请见原讲义附录。</li>
</ul></div>`
}
};
