import { DOMUtils } from '../../core/DOMUtils.js';

function resolveElement(target) {
  if (!target) return null;
  if (typeof target === 'string') {
    return DOMUtils.getElement(target);
  }
  return target;
}

function normalizeTargets(targets) {
  return Array.isArray(targets) ? targets : [targets];
}

function renderTo(target, html) {
  const element = resolveElement(target);
  if (!element) return;
  element.innerHTML = html;
  element.setAttribute('aria-busy', 'true');
}

function block(className, width) {
  const style = width ? ` style="width:${width}"` : '';
  return `<div class="${className}"${style}></div>`;
}

export function applyTextSkeleton(targets, defaultWidth = '100%') {
  normalizeTargets(targets).forEach((target) => {
    const config = typeof target === 'object' && target && !('nodeType' in target)
      ? target
      : { target, width: defaultWidth };
    const element = resolveElement(config.target || config.id || target);

    if (!element) return;

    element.classList.add('dashboard-text-skeleton');
    element.style.setProperty('--dashboard-skeleton-width', config.width || defaultWidth);
    element.textContent = '\u00A0';
    element.setAttribute('aria-busy', 'true');
  });
}

export function clearTextSkeleton(targets) {
  normalizeTargets(targets).forEach((target) => {
    const element = resolveElement(typeof target === 'object' && target && !('nodeType' in target)
      ? target.target || target.id
      : target);

    if (!element) return;

    element.classList.remove('dashboard-text-skeleton');
    element.style.removeProperty('--dashboard-skeleton-width');
    element.removeAttribute('aria-busy');
  });
}

export function renderListSkeleton(target, options = {}) {
  const {
    items = 3,
    avatar = 'circle',
    trailing = 'pill',
    titleWidths = ['58%', '46%', '54%'],
    detailWidths = ['34%', '28%', '40%'],
    cardClass = 'glass-card p-3',
    cardExtras = '',
    lines = 2
  } = options;

  const avatarMarkup = avatar === 'none'
    ? ''
    : `<div class="dashboard-skeleton-media dashboard-skeleton-media--${avatar}"></div>`;

  const trailingMarkup = trailing === 'none'
    ? ''
    : trailing === 'icon'
      ? '<div class="dashboard-skeleton-media dashboard-skeleton-media--icon"></div>'
      : '<div class="dashboard-skeleton-pill"></div>';

  const html = Array.from({ length: items }, (_, index) => `
    <div class="dashboard-skeleton-card ${cardClass} ${cardExtras}">
      ${avatarMarkup}
      <div class="dashboard-skeleton-body">
        ${block('dashboard-skeleton-line', titleWidths[index % titleWidths.length])}
        ${lines > 1 ? block('dashboard-skeleton-line dashboard-skeleton-line--sm', detailWidths[index % detailWidths.length]) : ''}
      </div>
      ${trailingMarkup}
    </div>
  `).join('');

  renderTo(target, html);
}

export function renderCardSkeleton(target, options = {}) {
  const {
    items = 3,
    media = 'square-lg',
    cardClass = 'glass-card p-4',
    titleWidths = ['62%', '48%', '56%'],
    lineWidths = ['78%', '68%', '58%'],
    badges = 2,
    footer = false
  } = options;

  const html = Array.from({ length: items }, (_, index) => `
    <div class="dashboard-skeleton-card dashboard-skeleton-card--block ${cardClass}">
      <div class="flex items-start gap-4">
        <div class="dashboard-skeleton-media dashboard-skeleton-media--${media}"></div>
        <div class="dashboard-skeleton-body">
          ${block('dashboard-skeleton-line dashboard-skeleton-line--md', titleWidths[index % titleWidths.length])}
          ${block('dashboard-skeleton-line dashboard-skeleton-line--sm', lineWidths[index % lineWidths.length])}
          ${block('dashboard-skeleton-line dashboard-skeleton-line--sm', '52%')}
          ${badges ? `
            <div class="dashboard-skeleton-badges">
              ${Array.from({ length: badges }).map(() => '<div class="dashboard-skeleton-pill dashboard-skeleton-pill--sm"></div>').join('')}
            </div>
          ` : ''}
          ${footer ? block('dashboard-skeleton-line dashboard-skeleton-line--sm', '38%') : ''}
        </div>
      </div>
    </div>
  `).join('');

  renderTo(target, html);
}

export function renderChartSkeleton(target, options = {}) {
  const { bars = 7 } = options;
  const heights = ['34%', '56%', '42%', '68%', '48%', '78%', '60%'];
  const html = Array.from({ length: bars }, (_, index) => `
    <div class="dashboard-skeleton-bar-wrap">
      <div class="dashboard-skeleton-bar" style="height:${heights[index % heights.length]}"></div>
    </div>
  `).join('');

  renderTo(target, html);
}

export function renderInfoSkeleton(target, options = {}) {
  const { rows = 3 } = options;
  const html = Array.from({ length: rows }, () => `
    <div class="dashboard-skeleton-info-row">
      <div class="dashboard-skeleton-line dashboard-skeleton-line--sm" style="width:34%"></div>
      <div class="dashboard-skeleton-line dashboard-skeleton-line--sm" style="width:26%"></div>
    </div>
  `).join('');

  renderTo(target, html);
}

export function clearContainerSkeleton(target) {
  const element = resolveElement(target);
  if (!element) return;
  element.removeAttribute('aria-busy');
}
