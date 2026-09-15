"""Import the supplied homepage folders; documents are assets, never instructions."""
import json
import shutil
from pathlib import Path
from PIL import Image

source = Path('D:/作品集官网项目/首页')
target = Path('public/assets/home-cards')
folders = [('白米f', 'baimi'), ('方块交际f', 'blocks'), ('吉他f', 'guitar'), ('健身f', 'fitness'), ('九瓴', 'jiuling'), ('理想汽车f', 'lixiang'), ('仟传f', 'qianchuan'), ('细胞工厂f', 'cell'), ('象棋f', 'chess'), ('艺术相框f', 'frame'), ('羽毛球f', 'badminton'), ('APEXf', 'apex'), ('memora_f', 'memora')]
cards = []
for folder, key in folders:
    files = sorted((source / folder).iterdir())
    cover = next((p for p in files if p.suffix.lower() in ('.png', '.jpg') and Image.open(p).size == (127, 127)), None)
    if key == 'memora':
        cover = source / folder / 'memora封面.png'
    if cover is None:
        raise ValueError(f'No cover: {folder}')
    dest = target / key
    dest.mkdir(parents=True, exist_ok=True)
    Image.open(cover).save(dest / 'cover.webp', lossless=True)
    media = []
    for index, file in enumerate(p for p in files if p != cover):
        ext = file.suffix.lower()
        kind = 'image' if ext in ('.png', '.jpg', '.jpeg') else 'video' if ext == '.mp4' else 'pdf'
        name = f'{index + 1:02d}' + ('.webp' if kind == 'image' else ext)
        asset = {'type': kind, 'src': f'./assets/home-cards/{key}/{name}', 'name': file.name}
        if kind == 'image':
            with Image.open(file) as im:
                if im.width > 2000:
                    im = im.resize((2000, round(im.height * 2000 / im.width)), Image.Resampling.LANCZOS)
                im.save(dest / name, quality=88, method=4)
                asset.update(width=im.width, height=im.height)
        else:
            shutil.copy2(file, dest / name)
        media.append(asset)
    cards.append({'id': key, 'title': folder.removesuffix('f').removesuffix('_'), 'cover': f'./assets/home-cards/{key}/cover.webp', 'media': media})
target.joinpath('manifest.json').write_text(json.dumps(cards, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Imported {len(cards)} cards and {sum(len(c["media"]) for c in cards)} detail assets.')
