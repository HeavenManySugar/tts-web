# TTS Web

TTS Web 是一個基於 Next.js 的文字轉語音應用程式，提供多語言支持和語音選擇功能。

## 功能

- 支持多語言的文字轉語音功能。
- 調整語速和音調。
- 支持語音篩選功能。
- 高亮顯示正在朗讀的文字。

## 技術棧

- **框架**: [Next.js](https://nextjs.org/)
- **前端**: [React](https://reactjs.org/)
- **樣式**: [Tailwind CSS](https://tailwindcss.com/) 和 [DaisyUI](https://daisyui.com/)
- **語音 API**: 瀏覽器內建的 SpeechSynthesis API

## 安裝與運行

1. 克隆此專案：

   ```bash
   git clone <repository-url>
   cd tts-web
   ```

2. 安裝依賴：

   ```bash
   npm install
   ```

3. 啟動開發伺服器：

   ```bash
   npm run dev
   ```

4. 在瀏覽器中打開 [http://localhost:3000](http://localhost:3000)。

## 部署

此專案已配置 GitHub Actions，支持自動部署到 GitHub Pages。也可以透過 [GitHub Pages](https://ruien.me/tts-web/) 打開。

## 文件結構

```
.
├── app/
│   ├── globals.css          # 全局樣式
│   ├── language-options.tsx # 語言選項
│   ├── layout.tsx           # 頁面佈局
│   ├── page.tsx             # 主頁面
├── .github/workflows/       # GitHub Actions 配置
├── next.config.ts           # Next.js 配置
├── package.json             # 項目依賴
├── postcss.config.mjs       # PostCSS 配置
├── tsconfig.json            # TypeScript 配置
└── README.md                # 專案說明文件
```

## 授權

此專案採用 [Apache 2.0](./LICENSE) 授權。