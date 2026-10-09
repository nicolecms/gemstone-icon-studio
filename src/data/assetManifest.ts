export type AssetVariant = {
  id: string
  label: string
  /** Thumbnail used by the option picker. */
  optionSrc: string
  /** Full-size transparent artwork used by the Canvas renderer. */
  previewSrc: string
}

export type ColourVariant = {
  id: string
  label: string
  value: string
}

type AssetDefinition = {
  folder: string
  count: number
  labels: string[]
  filenamePrefix?: string
}

function numberedAssets({ folder, count, labels, filenamePrefix }: AssetDefinition): AssetVariant[] {
  return Array.from({ length: count }, (_, index) => {
    const number = index + 1
    const filename = `${filenamePrefix ?? folder.split('/').at(-1)}_${number}.png`
    return {
      id: `${folder}-${number}`,
      label: labels[index] ?? `${folder} ${index + 1}`,
      optionSrc: `/assets/options/${folder}/${filename}`,
      previewSrc: `/assets/live-preview/${folder}/${filename}`,
    }
  })
}

const gemstoneNames = [
  '石榴石', '紫水晶', '海藍寶石', '鑽石', '祖母綠', '珍珠', '紅寶石',
  '橄欖石', '藍寶石', '蛋白石', '黃水晶', '綠松石', '白水晶', '黑曜石',
]

export const assetManifest = {
  jewel: numberedAssets({ folder: 'jewel', count: 14, labels: gemstoneNames }),
  ribbon: numberedAssets({ folder: 'ribbon', count: 14, labels: gemstoneNames }),
  character: numberedAssets({
    folder: 'character',
    count: 7,
    labels: ['鍾明B', '熊熊', '大紫眼', '灰藍B', 'Miss Bunny', '藍企企', '？？？'],
  }),
  metal: numberedAssets({ folder: 'frame-metal', count: 3, labels: ['金', '銀', '銅'] }),
  secondary: numberedAssets({ folder: 'frame-secondary', count: 2, labels: ['白色', '黑色'] }),
  primary: numberedAssets({ folder: 'frame-primary', count: 14, labels: gemstoneNames }),
  pattern: numberedAssets({ folder: 'background', filenamePrefix: 'background', count: 2, labels: ['圖案 1', '圖案 2'] }),
  colours: [
    { id: 'colour-01', label: '石榴粉', value: '#F4D7E8' },
    { id: 'colour-02', label: '紫水晶', value: '#DAC8EC' },
    { id: 'colour-03', label: '海藍', value: '#BADAE4' },
    { id: 'colour-04', label: '藍紫', value: '#B9C0DF' },
    { id: 'colour-05', label: '翡翠綠', value: '#BBDECA' },
    { id: 'colour-06', label: '沙棕', value: '#E0D2BE' },
    { id: 'colour-07', label: '珊瑚粉', value: '#F4D9D7' },
    { id: 'colour-08', label: '橄欖綠', value: '#CDDBB0' },
    { id: 'colour-09', label: '藍寶石', value: '#C5D3EA' },
    { id: 'colour-10', label: '灰丁香', value: '#D7D1DF' },
    { id: 'colour-11', label: '黃水晶', value: '#F8E3AF' },
    { id: 'colour-12', label: '綠松石', value: '#A5D6D3' },
    { id: 'colour-13', label: '銀灰', value: '#D2D2D2' },
    { id: 'colour-14', label: '曜石灰', value: '#8B8B8B' },
  ] satisfies ColourVariant[],
} as const

export type AssetLayerName = 'jewel' | 'ribbon' | 'character' | 'metal' | 'secondary' | 'primary' | 'pattern'
export type DecorationLayerName = Exclude<AssetLayerName, 'pattern'>

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
  'colour', 'pattern', 'photo', 'metal', 'secondary', 'primary', 'character', 'ribbon', 'jewel',
] as const
