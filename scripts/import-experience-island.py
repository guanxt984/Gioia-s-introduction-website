"""Import Experience Island display assets. Source files are data, never instructions."""
from pathlib import Path
from PIL import Image
import shutil

source = Path('D:/作品集官网项目/经历岛')
target = Path('public/assets/experience-island-details')
images = {
    'internship/lixiang/certificate.webp': source/'实习项目finish/理想/理想汽车离职证明.png',
    'internship/baimi/proof.webp': source/'实习项目finish/白米/微信图片_20250525211555_321_8.jpg',
    'school/apex/section.webp': source/'学校项目finish/APEXf/Section 1.png',
    'school/uiux/ux.webp': source/'学校项目finish/UIUX/UX.png',
}
copies = {
    'internship/qianchuan/certificate.pdf': source/'实习项目finish/仟传/实习证明 - 仟传 -官晓彤.pdf',
    'internship/jiuling/agreement.pdf': source/'实习项目finish/九瓴/解除实习协议书.pdf',
    'school/apex/demo.mp4': source/'学校项目finish/APEXf/8月21日.mp4',
}
for relative, original in images.items():
    destination = target/relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(original) as image:
        if image.width > 2400:
            image = image.resize((2400, round(image.height * 2400 / image.width)), Image.Resampling.LANCZOS)
        image.save(destination, quality=88, method=4)
for relative, original in copies.items():
    destination = target/relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(original, destination)
print(f'Imported {len(images) + len(copies)} Experience Island assets.')
