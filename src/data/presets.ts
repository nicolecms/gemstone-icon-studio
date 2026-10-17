import { assetManifest, type AssetVariant, type ColourVariant } from './assetManifest'

export type GemstonePreset = {
  id: string
  name: string
  birthMonth: number | null
  jewel: string
  ribbon: string
  character: string
  primary: string
  secondary: string
  metal: string
  colour: string
  pattern: string
}

export const gemstonePresets: GemstonePreset[] = [
  { id: 'garnet', name: '石榴石', birthMonth: 1, jewel: '石榴石', ribbon: '石榴石', character: '鍾明B', primary: '石榴石', secondary: '白色', metal: '銅', colour: '#F4D7E8', pattern: '波點' },
  { id: 'amethyst', name: '紫水晶', birthMonth: 2, jewel: '紫水晶', ribbon: '紫水晶', character: '熊熊', primary: '紫水晶', secondary: '白色', metal: '銀', colour: '#DAC8EC', pattern: '菱格' },
  { id: 'aquamarine', name: '海藍寶石', birthMonth: 3, jewel: '海藍寶石', ribbon: '海藍寶石', character: '灰藍B', primary: '海藍寶石', secondary: '白色', metal: '銀', colour: '#BADAE4', pattern: '波點' },
  { id: 'diamond', name: '鑽石', birthMonth: 4, jewel: '鑽石', ribbon: '鑽石', character: '藍企企', primary: '鑽石', secondary: '白色', metal: '銀', colour: '#B9C0DF', pattern: '菱格' },
  { id: 'emerald', name: '祖母綠', birthMonth: 5, jewel: '祖母綠', ribbon: '祖母綠', character: '大紫眼', primary: '祖母綠', secondary: '黑色', metal: '金', colour: '#BBDECA', pattern: '波點' },
  { id: 'pearl', name: '珍珠', birthMonth: 6, jewel: '珍珠', ribbon: '珍珠', character: 'Miss Bunny', primary: '珍珠', secondary: '白色', metal: '金', colour: '#E0D2BE', pattern: '菱格' },
  { id: 'ruby', name: '紅寶石', birthMonth: 7, jewel: '紅寶石', ribbon: '紅寶石', character: '大紫眼', primary: '紅寶石', secondary: '白色', metal: '銀', colour: '#F4D9D7', pattern: '波點' },
  { id: 'peridot', name: '橄欖石', birthMonth: 8, jewel: '橄欖石', ribbon: '橄欖石', character: '灰藍B', primary: '橄欖石', secondary: '黑色', metal: '銀', colour: '#CDDBB0', pattern: '菱格' },
  { id: 'sapphire', name: '藍寶石', birthMonth: 9, jewel: '藍寶石', ribbon: '藍寶石', character: '藍企企', primary: '藍寶石', secondary: '白色', metal: '金', colour: '#C5D3EA', pattern: '波點' },
  { id: 'opal', name: '蛋白石', birthMonth: 10, jewel: '蛋白石', ribbon: '蛋白石', character: '鍾明B', primary: '蛋白石', secondary: '白色', metal: '金', colour: '#D7D1DF', pattern: '菱格' },
  { id: 'citrine', name: '黃水晶', birthMonth: 11, jewel: '黃水晶', ribbon: '黃水晶', character: 'Miss Bunny', primary: '黃水晶', secondary: '白色', metal: '銅', colour: '#F8E3AF', pattern: '波點' },
  { id: 'turquoise', name: '綠松石', birthMonth: 12, jewel: '綠松石', ribbon: '綠松石', character: '熊熊', primary: '綠松石', secondary: '黑色', metal: '銅', colour: '#A5D6D3', pattern: '菱格' },
  { id: 'clear-quartz', name: '白水晶', birthMonth: null, jewel: '白水晶', ribbon: '白水晶', character: '鍾明B', primary: '白水晶', secondary: '白色', metal: '金', colour: '#D2D2D2', pattern: '波點' },
  { id: 'obsidian', name: '黑曜石', birthMonth: null, jewel: '黑曜石', ribbon: '黑曜石', character: '熊熊', primary: '黑曜石', secondary: '黑色', metal: '銅', colour: '#8B8B8B', pattern: '菱格' },
]

export type PresetSelections = {
  jewel: AssetVariant
  ribbon: AssetVariant
  character: AssetVariant
  metal: AssetVariant
  secondary: AssetVariant
  primary: AssetVariant
  pattern: AssetVariant
  colour: ColourVariant
}

function byLabel(items: readonly AssetVariant[], label: string): AssetVariant {
  const item = items.find((candidate) => candidate.label === label)
  if (!item) throw new Error(`預設素材不存在：${label}`)
  return item
}

export function getPresetSelections(preset: GemstonePreset): PresetSelections {
  const colour = assetManifest.colours.find((candidate) => candidate.value.toUpperCase() === preset.colour.toUpperCase())
  if (!colour) throw new Error(`預設背景顏色不存在：${preset.colour}`)
  return {
    jewel: byLabel(assetManifest.jewel, preset.jewel),
    ribbon: byLabel(assetManifest.ribbon, preset.ribbon),
    character: byLabel(assetManifest.character, preset.character),
    metal: byLabel(assetManifest.metal, preset.metal),
    secondary: byLabel(assetManifest.secondary, preset.secondary),
    primary: byLabel(assetManifest.primary, preset.primary),
    pattern: byLabel(assetManifest.pattern, preset.pattern),
    colour,
  }
}

export function getPresetById(id: string | null | undefined): GemstonePreset | undefined {
  return gemstonePresets.find((preset) => preset.id === id)
}
