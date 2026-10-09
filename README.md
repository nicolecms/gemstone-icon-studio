# 小寶石工作室｜Gemstone Icon Studio

生日寶石主題圖示自訂網站，使用 React、TypeScript、Vite 及 HTML Canvas。預設介面語言為繁體中文。

## 本機開發與檢查

```bash
npm install
npm run dev
```

開啟終端機顯示的本機網址。正式版檢查：

```bash
npm run build
```

## 素材結構與檔名慣例

程式目前預期素材路徑如下（路徑與檔名大小寫需完全相符）：

- 選項縮圖：`options/jewel/jewel_1.png` 至 `_14.png`；`options/ribbon/ribbon_1.png` 至 `_14.png`；`options/character/character_1.png` 至 `_7.png`；`options/frame-metal/frame-metal_1.png` 至 `_3.png`；`options/frame-primary/frame-primary_1.png` 至 `_14.png`；`options/pattern/pattern_1.png` 至 `_2.png`
- Canvas 素材：`live-preview/jewel/jewel_1.PNG` 至 `_14.PNG`；`live-preview/ribbon/ribbon_1.PNG` 至 `_14.PNG`；`live-preview/character/character_1.PNG` 至 `_7.PNG`；`live-preview/frame-metal/frame-metal_1.PNG` 至 `_3.PNG`；`live-preview/frame-primary/frame-primary_1.PNG` 至 `_14.PNG`；`live-preview/pattern/pattern_1.PNG` 至 `_2.PNG`
- 次要框沒有獨立的 options 縮圖；其選項來源沿用 `live-preview/frame-secondary/frame-secondary_1.PNG` 至 `_2.PNG`

以上路徑皆相對於 `public/assets/`。主要框第 11 張選項縮圖的副檔名是大寫 `.PNG`，其餘選項縮圖是小寫 `.png`。

以上路徑反映目前程式中的命名慣例。若你上傳的實際檔名或子資料夾不同，請在 `src/data/assetManifest.ts` 調整對應路徑；網站會對無法載入的素材顯示提示。背景純色與次要框顏色使用程式內的色碼／按鈕，不需要 options 圖片。

## 素材變體

- 寶石：石榴石、紫水晶、海藍寶石、鑽石、祖母綠、珍珠、紅寶石、橄欖石、藍寶石、蛋白石、黃水晶、綠松石、白水晶、黑曜石
- 絲帶：同上 14 款
- 角色：鍾明B、熊熊、大紫眼、灰藍B、Miss Bunny、藍企企、？？？
- 金屬框：金、銀、銅
- 次要框：白色、黑色
- 背景色：`#F4D7E8`, `#DAC8EC`, `#BADAE4`, `#B9C0DF`, `#BBDECA`, `#E0D2BE`, `#F4D9D7`, `#CDDBB0`, `#C5D3EA`, `#D7D1DF`, `#F8E3AF`, `#A5D6D3`, `#D2D2D2`, `#8B8B8B`

## Canvas 圖層順序（底至頂）

1. 純色背景
2. 可選背景圖案
3. 使用者照片（圓形裁切，目前為示意圖）
4. 金屬框
5. 次要框
6. 主要框
7. 角色
8. 絲帶
9. 寶石

每張完整圖層素材會繪製到同一個 1024 × 1024 Canvas 座標空間。素材選擇、顏色選擇和裝飾開關都會觸發即時重繪。渲染程式獨立放在 `src/engine/renderIcon.ts`。

## 目前已實作

- [x] 資料驅動素材清單與預設變體
- [x] 縮圖選擇器、14 色背景選擇器、圖案選擇器
- [x] 裝飾圖層顯示／隱藏控制
- [x] Canvas 即時預覽與素材載入錯誤提示
- [x] 繁體中文介面
- [ ] 依照實際素材檔名核對路徑與框線開口
- [ ] 照片上傳、縮放、旋轉與位置調整
- [ ] 匯出透明背景及含背景 PNG
