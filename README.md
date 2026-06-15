# MD5 Tools

> 拖曳或點擊加入檔案，即時算出 **MD5 / SHA-1 / SHA-256** 的桌面小工具。

以 **Electron + Angular** 打造的檔案雜湊檢視器。把檔案丟進視窗（或點擊選擇），就會以串流方式邊讀邊算三種雜湊值，並顯示檔案大小、計算耗時與即時進度。

---

## 功能

- 📂 **兩種加入方式**：拖曳檔案，或點擊拖放區開啟系統選檔視窗（可多選、支援鍵盤 Enter / 空白鍵）。
- 🔢 **一次算三種雜湊**：MD5、SHA-1、SHA-256，讀檔一次同時計算。
- 🌊 **串流處理**：以 1 MB 為單位串流讀取，超大檔也不會吃爆記憶體。
- 📊 **即時進度**：每個檔案獨立進度條，工具列顯示總數與計算中數量。
- ⚙️ **併發控制**：同時最多計算 4 個檔案，避免一次丟大量檔案把硬碟 I/O 灌爆。
- 📋 **一鍵複製**：點按即可把任一雜湊值複製到剪貼簿。
- 🌓 **自動深淺色**：跟隨系統主題（Angular Material）。

---

## 技術棧

| 範圍 | 使用 |
| --- | --- |
| 桌面框架 | Electron 42 |
| 前端 | Angular 22（zoneless、standalone、Signals、新版控制流） |
| UI | Angular Material |
| 雜湊運算 | Node.js `crypto` + 串流（Electron 主程序） |
| 語言 | TypeScript 6 |
| 打包 | electron-builder |

主程序與畫面透過 `contextBridge` + IPC 溝通，並啟用 `contextIsolation` / 關閉 `nodeIntegration`，符合 Electron 安全建議。

---

## 環境需求

- Node.js 20.19+ / 22.12+ / 24+
- npm

## 開發

```bash
npm install      # 安裝相依套件
npm start        # 同時啟動 Angular dev server 與 Electron（含熱更新）
```

`npm start` 會等 Angular dev server（`127.0.0.1:4200`）起來後再啟動 Electron。

## 建置與打包

```bash
npm run build            # 編譯 Angular + Electron（不打包）
npm run icon:generate    # 由程式產生 build/icon.png 應用程式圖示
npm run package          # 建置並用 electron-builder 打包成目前平台的免安裝版
```

各平台的免安裝（portable）格式：

| 平台 | 格式 | 產出範例 |
| --- | --- | --- |
| Windows | `portable`（單一 exe） | `MD5 Tools-1.0.0-portable.exe` |
| Linux | `AppImage`（單檔） | `MD5 Tools-1.0.0-x86_64.AppImage` |
| macOS | `zip`（解壓即用的 .app，x64 + arm64） | `MD5 Tools-1.0.0-arm64.zip` |

> macOS 版本未經程式碼簽章，首次開啟可能需在「系統設定 → 隱私權與安全性」手動允許。

---

## 自動發布（GitHub Actions）

`.github/workflows/release.yml` 會在**發布 GitHub Release 時**自動於三個官方 runner 上打包
Windows / Linux / macOS，並把三個免安裝檔**直接掛到該 Release** 上。

發布步驟：

1. 先把 `package.json` 的 `version` 改成新版本（畫面顯示的版本會跟著變）。
2. 在 GitHub 進入 **Releases → Draft a new release**，建立一個 tag（例如 `v1.0.0`）後按 **Publish**。
3. 等三個工作跑完，編譯出的檔案就會出現在該 Release 的資產（assets）中。

> 為什麼掛在 Release 而不是 Artifacts：Release 資產**不佔用** Actions 的儲存額度、不會過期，
> 使用者也能直接從 Release 頁面下載。整個流程只用官方 runner 與第一方工具，macOS 不簽章，皆在免費額度內。

---

## 版本號

畫面上顯示的版本以 `package.json` 的 `version` 為唯一來源：
建置 / 啟動前由 [`scripts/generate-version.mjs`](scripts/generate-version.mjs) 自動產生 `src/app/version.ts`，無需手動同步。

---

## 專案結構

```
electron/                 Electron 主程序（Node 端）
  main.ts                 建立視窗、載入畫面
  preload.ts              以 contextBridge 暴露安全 API
  ipc/hash.handler.ts     IPC：接收檔案路徑、回報進度
  services/hash.service.ts 串流讀檔並計算三種雜湊
src/app/                  Angular 前端（畫面端）
  components/drop-zone/   拖放 / 點擊加入檔案
  components/file-list/   檔案清單與單列項目
  services/hash-store.service.ts  狀態中心（Signals）+ 併發佇列
  services/electron.service.ts    包裝 window.electronAPI
scripts/                  圖示與版本號產生器
.github/workflows/        三平台打包 CI
```

---

## 授權

[MIT](LICENSE)
