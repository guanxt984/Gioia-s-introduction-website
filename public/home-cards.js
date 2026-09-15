import { enumeratePartitions, solveJustifiedMosaic } from './justified-media-layout.js';

function orderCardMedia(card) {
  const media = [...card.media];
  if (!['baimi', 'qianchuan', 'lixiang'].includes(card.id)) return media;
  return media.sort((first, second) => {
    const firstIsHero = first.name.includes('大图');
    const secondIsHero = second.name.includes('大图');
    if (firstIsHero !== secondIsHero) return firstIsHero ? -1 : 1;
    return first.name.localeCompare(second.name, 'zh-CN', { numeric: true });
  });
}

function mediaAspect(asset) {
  if (asset.width && asset.height) return asset.width / asset.height;
  return asset.type === 'pdf' ? 0.78 : 16 / 9;
}

export function partitionsForCard(card, assets) {
  if (card.id === 'baimi' || card.id === 'qianchuan') {
    return [[[assets[0]], assets.slice(1)]];
  }
  if (card.id === 'lixiang') {
    return [[[assets[0]], assets.slice(1, 5), assets.slice(5, 9)]];
  }
  return enumeratePartitions(assets);
}

function resolveVideoAspect(asset) {
  if (asset.type !== 'video') return Promise.resolve({ ...asset, aspect: mediaAspect(asset) });
  return new Promise(resolve => {
    const probe = document.createElement('video');
    const finish = () => resolve({ ...asset, aspect: probe.videoWidth && probe.videoHeight ? probe.videoWidth / probe.videoHeight : 16 / 9 });
    probe.preload = 'metadata';
    probe.addEventListener('loadedmetadata', finish, { once: true });
    probe.addEventListener('error', finish, { once: true });
    probe.src = asset.src;
  });
}

async function mountHomeCards() {
  const orbit = document.querySelector('#home .orbit');
  if (!orbit || orbit.dataset.cardsMounted) return;
  orbit.dataset.cardsMounted = 'true';
  try {
    const response = await fetch('./assets/home-cards/manifest.json');
    if (!response.ok) throw new Error('卡片资料载入失败');
    const cards = await response.json();
    const dialog = document.createElement('dialog');
    dialog.className = 'home-card-dialog';
    dialog.setAttribute('aria-labelledby', 'home-card-title');
    dialog.innerHTML = '<header><h2 id="home-card-title"></h2><button type="button" autofocus aria-label="关闭详情">关闭 ×</button></header><div class="home-card-media"></div>';
    document.body.append(dialog);
    const gallery = dialog.querySelector('.home-card-media');
    const close = () => dialog.close();
    dialog.querySelector('button').addEventListener('click', close);
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
    });
    dialog.addEventListener('close', () => {
      gallery.querySelectorAll('video').forEach(video => video.pause());
      gallery.replaceChildren();
      document.documentElement.classList.remove('home-card-open');
    });
    function createMediaFigure(asset, card, index) {
      const figure = document.createElement('figure');
      figure.style.flexGrow = asset.aspect;
      const link = document.createElement('a');
      link.href = asset.src;
      link.target = '_blank';
      link.rel = 'noopener';
      if (asset.type === 'image') {
        const image = document.createElement('img');
        image.src = asset.src;
        image.alt = `${card.title} · 补充材料 ${index + 1}`;
        image.width = asset.width;
        image.height = asset.height;
        image.loading = 'lazy';
        figure.classList.add('is-image');
        link.append(image);
        link.setAttribute('aria-label', `${image.alt}，打开大图`);
        figure.append(link);
      } else if (asset.type === 'video') {
        figure.classList.add('is-video');
        const video = document.createElement('video');
        video.src = asset.src;
        video.controls = true;
        video.playsInline = true;
        video.preload = 'metadata';
        video.setAttribute('aria-label', `${card.title} · 视频 ${index + 1}`);
        figure.append(video);
      } else {
        figure.classList.add('is-pdf');
        link.textContent = `打开 PDF · ${asset.name}`;
        const frame = document.createElement('iframe');
        frame.src = asset.src;
        frame.title = `${card.title} PDF`;
        figure.append(link, frame);
      }
      return figure;
    }

    async function open(card) {
      dialog.querySelector('h2').textContent = card.title;
      dialog.dataset.cardId = card.id;
      dialog.dataset.mediaCount = card.media.length;
      gallery.replaceChildren();
      const assets = await Promise.all(orderCardMedia(card).map(resolveVideoAspect));
      const gap = window.innerWidth <= 600 ? 3 : 4;
      const layout = solveJustifiedMosaic(
        assets,
        Math.max(280, window.innerWidth - 40),
        Math.max(220, window.innerHeight - 94),
        gap,
        partitionsForCard(card, assets),
      );
      if (!layout) return;
      let assetIndex = 0;
      layout.rows.forEach((assetsInRow, rowIndex) => {
        const row = document.createElement('div');
        row.className = 'home-card-media-row';
        row.style.width = `${layout.width}px`;
        row.style.height = `${layout.heights[rowIndex]}px`;
        assetsInRow.forEach(asset => row.append(createMediaFigure(asset, card, assetIndex++)));
        gallery.append(row);
      });
      dialog.style.width = `${layout.width + 8}px`;
      dialog.style.height = `${layout.height + 62}px`;
      document.documentElement.classList.add('home-card-open');
      dialog.showModal();
      dialog.scrollTop = 0;
    }
    orbit.setAttribute('aria-label', '作品与兴趣，点击卡片查看详情');
    orbit.replaceChildren(...cards.map((card, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'tile';
      button.style.setProperty('--orbit-start', `${index * 100 / cards.length}%`);
      button.style.setProperty('--tile-tilt', `${index % 2 ? -7 : 8}deg`);
      button.setAttribute('aria-label', `${card.title}，查看详情`);
      button.setAttribute('aria-haspopup', 'dialog');
      button.title = card.title;
      const image = document.createElement('img');
      image.src = card.cover;
      image.alt = card.title;
      image.draggable = false;
      button.append(image);
      button.addEventListener('click', () => open(card));
      return button;
    }));
  } catch (error) {
    delete orbit.dataset.cardsMounted;
    orbit.textContent = error.message;
  }
}
if (typeof window !== 'undefined') {
  window.addEventListener('portfolio:ready', mountHomeCards, { once: true });
  mountHomeCards();
}
