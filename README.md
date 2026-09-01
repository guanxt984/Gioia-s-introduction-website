# 经历岛 3D 模型

这是面向网页展示优化的低多边形经历岛模型。

## 构建

```powershell
npm.cmd install
npm.cmd run build:model
npm.cmd run check:model
```

## 预览

```powershell
npm.cmd run serve
```

随后打开终端显示的本地地址，并进入：

`/experience-islands-viewer.html`

## 交付文件

- `public/models/experience-islands.glb`
- `public/experience-islands-viewer.html`
- `src/experience-islands.js`

## 独立子岛节点

- `island_internship`
- `island_ai`
- `island_school`

网页可通过节点名分别获取子岛，计算包围盒并执行聚焦、放大、淡化其他岛屿等交互。
