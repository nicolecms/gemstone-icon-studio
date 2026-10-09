export type AssetVariant = {
  id: string
  label: string
  src: string
}

export type ColourVariant = {
  id: string
  label: string
  value: string
}

/**
 * Asset paths are relative to /public. Replace these predictable filenames
 * with your real asset filenames when you add the artwork.
 */
const numberedAssets = (
  prefix: string,
  count: number,
  label: string,
): AssetVariant[] =>
  Array.from({ length: count }, (_, index) => {
    const number = String(index + 1).padStart(2, '0')
    return {
      id: `${prefix}-${number}`,
      label: `${label} ${index + 1}`,
      src: `/assets/${prefix}/${prefix}-${number}.png`,
    }
  })

export const assetManifest = {
  jewel: numberedAssets('jewel', 14, '寶石'),
  ribbon: numberedAssets('ribbon', 14, '絲帶'),
  character: numberedAssets('character', 7, '角色'),
  metal: numberedAssets('metal', 3, '金屬框'),
  secondary: numberedAssets('secondary', 2, '次要框'),
  primary: numberedAssets('primary', 14, '主要框'),
  pattern: numberedAssets('pattern', 2, '背景圖案'),
  colours: [
    { id: 'colour-01', label: '玫瑰粉', value: '#F3DCE5' },
    { id: 'colour-02', label: '薰衣草紫', value: '#E6DDF4' },
    { id: 'colour-03', label: '天空藍', value: '#DCECF8' },
    { id: 'colour-04', label: '薄荷綠', value: '#DCEFE5' },
    { id: 'colour-05', label: '奶油黃', value: '#F7EBC8' },
    { id: 'colour-06', label: '蜜桃橘', value: '#F8E0D2' },
    { id: 'colour-07', label: '珍珠白', value: '#F7F3EF' },
    { id: 'colour-08', label: '莓果紅', value: '#EBCBD8' },
    { id: 'colour-09', label: '霧霾藍', value: '#D4DFEF' },
    { id: 'colour-10', label: '鼠尾草綠', value: '#D8E3D2' },
    { id: 'colour-11', label: '香檳金', value: '#F1E0B8' },
    { id: 'colour-12', label: '淡丁香紫', value: '#E9D7EA' },
    { id: 'colour-13', label: '櫻花粉', value: '#F7E3EA' },
    { id: 'colour-14', label: '深海藍', value: '#D5E5EA' },
  ] satisfies ColourVariant[],
} as const

export type AssetLayerName =
  | 'jewel'
  | 'ribbon'
  | 'character'
  | 'metal'
  | 'secondary'
  | 'primary'
  | 'pattern'

export const defaultSelections = {
  jewel: assetManifest.jewel[0],
  ribbon: assetManifest.ribbon[0],
  character: assetManifest.character[0],
  metal: assetManifest.metal[0],
  secondary: assetManifest.secondary[0],
  primary: assetManifest.primary[0],
  pattern: assetManifest.pattern[0],
  colour: assetManifest.colours[0],
}

export const layerOrderBottomToTop = [
  'colour',
  'pattern',
  'photo',
  'metal',
  'secondary',
  'primary',
  'character',
  'ribbon',
  'jewel',
] as const
