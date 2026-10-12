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
3. 使用者照片（固定圓形裁切，可上載、拖曳、縮放及旋轉）
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
- [x] 本機照片上傳與載入錯誤提示
- [x] 固定圓形裁切、拖曳平移、縮放、旋轉、適合及重設
- [x] 1024 × 1024 透明背景 PNG 匯出
- [x] 1024 × 1024 純色背景＋圖案 PNG 匯出（保留照片與所有裝飾）

## 照片編輯與 PNG 匯出

- 選擇本機圖片後，照片會裁切到固定圓形遮罩。遮罩根據提供的 1080 × 1080 參考尺寸換算至 1024 × 1024 畫布：直徑 856px，左側／右側／上方／下方留白分別為 115／109／112／102px。
- 在預覽畫布上拖曳可平移照片；縮放及旋轉滑桿可調整照片。**適合圓形**會將縮放和位置還原至適合裁切的初始值；**重設照片**亦會將旋轉歸零。
- **透明背景 PNG** 會省略純色背景與圖案，但保留照片、金屬框、次要框、主要框、角色、絲帶及寶石。
- **含背景 PNG** 會包含目前選取的純色背景和（若已啟用）圖案，並保留相同的照片和裝飾。
- 兩種匯出均使用與預覽相同的 renderIcon 繪圖函式，輸出 1024 × 1024 PNG。匯出時若有素材載入失敗或瀏覽器無法建立 PNG，介面會顯示錯誤。

## 手動測試步驟

1. 執行 `npm install` 及 `npm run dev`，開啟網站。
2. 上載一張直向照片，再上載一張橫向照片；確認都能載入，且只在圓形遮罩內顯示。
3. 拖曳照片到左、右、上、下；確認照片位置隨拖曳改變，圓形邊界固定不變。
4. 將縮放調到最小和最大，將旋轉調到 -180°、0°、180°；確認預覽更新。
5. 點選 **適合圓形**，確認縮放與位置回到初始裁切；再移動及旋轉後點 **重設照片**，確認所有變換還原。
6. 選擇另一個背景色和圖案，隱藏／顯示不同裝飾，分別匯出兩種 PNG。
7. 在圖片檢視器或影像編輯器確認兩個檔案都是 1024 × 1024；透明版本的背景應透明，而含背景版本應使用所選色彩和啟用中的圖案。兩者的照片與裝飾應一致。
8. 嘗試上載非圖片檔案或損壞的圖片；確認顯示載入錯誤。若某個裝飾素材路徑錯誤，匯出應顯示錯誤，而不是默默下載不完整圖示。
9. 執行 `npm run build`，確認 TypeScript 和正式建置成功。