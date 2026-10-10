# 计算光刻 Wiki · Computational Lithography

可互动的计算光刻中文 Wiki，依据《计算光刻技术讲义》（2026.10）整理。
在线访问：**https://zcwarren.github.io/litho-wiki/**

## 内容

- 14 章 + 附录：从 Rayleigh 判据、傅里叶光学、Hopkins/TCC/SOCS，到 RET、OPC、ILT、SMO、多重曝光、EUV、AI 光刻与全芯片工程。
- 四个互动演示（纯前端 Canvas + 原生 JS，无构建依赖）：
  - **Rayleigh 计算器**：λ / NA / k₁ / k₂ 滑块，实时算 CD 与 DOF；
  - **Abbe 成像模拟器**：一维光栅衍射级次入瞳与空间像，直观看到 k₁=0.25 极限；
  - **照明模式浏览器**：传统 / 环形 / 二极 / 四极 / 自由照明的光瞳分布；
  - **ILT / SMO 实时优化器**：64×64 像素化掩模 + 像素化光源，Abbe 源点求和前向 + sigmoid 胶模型，伴随法实时梯度下降（掩模梯度与光源梯度均经有限差分校验，相对误差 ~1e-9）。

## 本地预览

纯静态站点，无需构建：

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000
```

## 部署

推送到 GitHub 后，仓库 Settings → Pages → Source 选 GitHub Actions，
或直接以 `main` 分支根目录发布（仓库自带 `.nojekyll`）。
