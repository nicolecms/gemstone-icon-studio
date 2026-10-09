# 小寶石工作室｜Gemstone Icon Studio

生日寶石主題圖示自訂網站，使用 React、TypeScript、Vite 及 HTML Canvas 開發。網站預設語言為繁體中文。

## 本機開發

1. 安裝 Node.js LTS。
2. 複製此 repository。
3. 執行 `npm install`。
4. 執行 `npm run dev`，並在瀏覽器開啟終端機顯示的本機網址。
5. 執行 `npm run build` 可檢查 TypeScript 與建立正式版。

## Canvas 圖層順序（由底至頂）

1. 純色背景
2. 可選背景圖案
3. 使用者照片（圓形裁切）
4. 金屬框（Metal）
5. 次要框（Secondary / Main A）
6. 主要框（Primary / Main B）
7. 角色（Character）
8. 絲帶（Ribbon）
9. 寶石（Jewel）

每個素材會繪製到相同的 1024 × 1024 座標空間，以保持位置對齊。照片目前使用 Canvas 繪製的示意人像；之後會加入上傳、縮放及旋轉功能。

## 素材資料夾與檔名

將實際的透明 PNG 素材放入 `public/assets/` 下相應資料夾。程式目前使用以下預設路徑：

- `jewel/jewel-01.png` 至 `jewel-14.png`
- `ribbon/ribbon-01.png` 至 `ribbon-14.png`
- `character/character-01.png` 至 `character-07.png`
- `metal/metal-01.png` 至 `metal-03.png`
- `secondary/secondary-01.png` 至 `secondary-02.png`
- `primary/primary-01.png` 至 `primary-14.png`
- `pattern/pattern-01.png` 至 `pattern-02.png`

純色背景暫時以程式內的 14 個色碼定義，不需要額外圖片檔。

**重要：** 上述是目前約定的示範檔名。請把你的素材重新命名，或之後更新 `src/data/assetManifest.ts` 中的路徑以符合實際檔名。若素材未放入，預覽會顯示缺失素材提示，但仍會繼續繪製其餘圖層。

## 目前開發階段

- [x] 建立 React + TypeScript + Vite 專案
- [x] 預設使用繁體中文介面
- [x] 建立資料驅動素材清單與預設選項
- [x] 建立 Canvas 圖層繪製引擎及載入錯誤提示
- [ ] 導入真實素材並核對各圖層對齊
- [ ] 加入素材選擇、照片上傳與裁切控制
- [ ] 加入透明背景及一般背景 PNG 匯出
