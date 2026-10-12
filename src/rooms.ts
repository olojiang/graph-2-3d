export interface RoomInfo {
  id: string
  name: string
  floor: number
  area: string
  desc: string
  color: number // hex for room floor tint
}

export const ROOMS: RoomInfo[] = [
  // Floor 1
  {
    id: 'living',
    name: '客厅',
    floor: 1,
    area: '42 m²',
    desc: '开放式客厅，落地玻璃幕墙，自然采光充足',
    color: 0xf5f0e8,
  },
  {
    id: 'dining',
    name: '餐厅',
    floor: 1,
    area: '28 m²',
    desc: '与厨房相连的开放餐厅，温馨木质装饰',
    color: 0xf0ebe0,
  },
  {
    id: 'kitchen',
    name: '厨房',
    floor: 1,
    area: '18 m²',
    desc: '岛台式厨房，高效动线设计',
    color: 0xeceae6,
  },
  {
    id: 'entry',
    name: '门厅 / 玄关',
    floor: 1,
    area: '12 m²',
    desc: '双层通高入口大厅，格栅隔断点缀',
    color: 0xe8e6e2,
  },
  {
    id: 'storage1',
    name: '储藏室',
    floor: 1,
    area: '8 m²',
    desc: '嵌入式储物间',
    color: 0xe2e0dc,
  },
  // Floor 2
  {
    id: 'master',
    name: '主卧',
    floor: 2,
    area: '36 m²',
    desc: '带步入式衣帽间，全景落地窗',
    color: 0xf2eee8,
  },
  {
    id: 'bedroom2',
    name: '次卧 A',
    floor: 2,
    area: '22 m²',
    desc: '南向卧室，内嵌书架',
    color: 0xedeae4,
  },
  {
    id: 'bedroom3',
    name: '次卧 B',
    floor: 2,
    area: '20 m²',
    desc: '北向卧室，安静宜人',
    color: 0xe8e6e0,
  },
  {
    id: 'study',
    name: '书房',
    floor: 2,
    area: '16 m²',
    desc: '西侧角落书房，双采光面',
    color: 0xe5e2dc,
  },
  {
    id: 'bath2',
    name: '主卫 / 客卫',
    floor: 2,
    area: '14 m²',
    desc: '双台盆，独立淋浴与浴缸',
    color: 0xe0deda,
  },
]
