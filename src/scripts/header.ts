// 导航栏行为：浮层开关、滚动的玻璃与隐藏、设置面板里的每一项。
//
// 设置全部存 localStorage，并在每次页面渲染时重新应用
// （客户端路由切换后 <html> 的属性会被新页面覆盖，所以必须重来一遍）。
import { applyTheme } from './theme';

const KEYS = {
  hue: 'hue',
  layout: 'postListLayout',
  sakura: 'sakuraEnabled',
  fireworks: 'fireworksEnabled',
  proseSize: 'proseSize',
  proseLeading: 'proseLeading',
  codeSize: 'codeSize',
};

const DEFAULTS = {
  hue: '265',
  proseSize: '100',
  proseLeading: '175',
  codeSize: '88',
};

function readSwitch(key: string, fallback: boolean) {
  const raw = localStorage.getItem(key);
  return raw === null ? fallback : raw === 'true';
}

export function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  // ---------- 1. 浮层 ----------
  const triggers = Array.from(header.querySelectorAll<HTMLElement>('[data-panel-trigger]'));
  const panelFor = (name: string) =>
    header.querySelector<HTMLElement>(`#panel-${name}`) ??
    header.querySelector<HTMLElement>(`.mobile-scrim[data-panel="${name}"]`);

  const closeAll = (except?: string) => {
    for (const trigger of triggers) {
      const name = trigger.dataset.panelTrigger ?? '';
      const panel = panelFor(name);
      if (name === except) {
        trigger.setAttribute('aria-expanded', 'true');
        if (panel) panel.hidden = false;
      } else {
        trigger.setAttribute('aria-expanded', 'false');
        if (panel) panel.hidden = true;
      }
    }
    document.body.classList.toggle('drawer-open', except === 'menu');
  };

  for (const trigger of triggers) {
    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const name = trigger.dataset.panelTrigger ?? '';
      closeAll(trigger.getAttribute('aria-expanded') === 'true' ? undefined : name);
    });
  }
  header.querySelectorAll<HTMLElement>('[data-panel-close]').forEach((b) => b.addEventListener('click', () => closeAll()));
  header.querySelectorAll<HTMLElement>('.mobile-scrim').forEach((s) => s.addEventListener('click', () => closeAll()));
  header.querySelectorAll<HTMLElement>('.float-panel').forEach((p) => p.addEventListener('click', (e) => e.stopPropagation()));
  document.addEventListener('click', () => closeAll());
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAll();
  });

  // ---------- 2. 移动端下拉 ----------
  header.querySelectorAll<HTMLElement>('[data-dropdown-trigger]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const item = button.closest('.nav-item');
      const open = item?.classList.toggle('is-open') ?? false;
      button.setAttribute('aria-expanded', String(open));
    });
  });

  // ---------- 3. 滚动 ----------
  let lastY = window.scrollY;
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const delta = y - lastY;

    header.classList.toggle('is-scrolled', y > 8);

    // ⚠️ 这里**故意不关面板**。
    // 之前做过"滚动就关闭音乐/主题面板"，但作者在拖色相滑杆时页面会轻微滚动，
    // 结果面板当场关掉，体验很差。滚动与面板开合从此互不干涉。

    // 隐藏要"走够距离"才触发，阈值太小会在触控板上抖
    if (y > 200 && delta > 8) header.classList.add('is-hidden');
    else if (delta < -8 || y <= 200) header.classList.remove('is-hidden');

    lastY = y;
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true },
  );
  onScroll();

  // ---------- 4. 设置项 ----------
  const hueRange = document.getElementById('hue-range') as HTMLInputElement | null;
  const hueValue = document.getElementById('hue-value');

  const paintRange = (el: HTMLInputElement | null) => {
    if (!el) return;
    const min = Number(el.min || 0);
    const max = Number(el.max || 100);
    const pct = ((Number(el.value) - min) / (max - min)) * 100;
    el.style.setProperty('--range-progress', pct.toFixed(1) + '%');
  };

  const setSwitch = (name: string, on: boolean) => {
    header.querySelectorAll<HTMLElement>(`[data-toggle="${name}"]`).forEach((el) => el.setAttribute('aria-checked', String(on)));
  };

  const apply = {
    hue(hue: string, persist: boolean) {
      document.documentElement.style.setProperty('--hue', hue);
      if (hueValue) hueValue.textContent = hue;
      if (hueRange) {
        hueRange.value = hue;
        paintRange(hueRange);
      }
      if (persist) localStorage.setItem(KEYS.hue, hue);
    },
    layout(mode: string, persist: boolean) {
      document.documentElement.dataset.postLayout = mode;
      header.querySelectorAll<HTMLElement>('[data-layout]').forEach((el) => {
        el.classList.toggle('is-active', el.dataset.layout === mode);
        el.setAttribute('aria-pressed', String(el.dataset.layout === mode));
      });
      if (persist) localStorage.setItem(KEYS.layout, mode);
    },
    sakura(on: boolean, persist: boolean) {
      // 关掉时给 <html> 打一个类，sakura.ts 读它决定要不要跑
      document.documentElement.classList.toggle('sakura-off', !on);
      setSwitch('sakura', on);
      if (persist) localStorage.setItem(KEYS.sakura, String(on));
      // 立刻生效：开→启动 worker，关→终止 worker 并移除 canvas
      window.dispatchEvent(new CustomEvent('sakura:change', { detail: on }));
    },
    proseSize(value: string, persist: boolean) {
      document.documentElement.style.setProperty('--prose-scale', (Number(value) / 100).toFixed(3));
      const out = document.getElementById('prose-size-value');
      if (out) out.textContent = value + '%';
      const el = document.getElementById('prose-size') as HTMLInputElement | null;
      if (el) {
        el.value = value;
        paintRange(el);
      }
      if (persist) localStorage.setItem(KEYS.proseSize, value);
    },
    proseLeading(value: string, persist: boolean) {
      document.documentElement.style.setProperty('--prose-leading', (Number(value) / 100).toFixed(2));
      const out = document.getElementById('prose-leading-value');
      if (out) out.textContent = value + '%';
      const el = document.getElementById('prose-leading') as HTMLInputElement | null;
      if (el) {
        el.value = value;
        paintRange(el);
      }
      if (persist) localStorage.setItem(KEYS.proseLeading, value);
    },
    codeSize(value: string, persist: boolean) {
      document.documentElement.style.setProperty('--code-scale', (Number(value) / 100).toFixed(3));
      const out = document.getElementById('code-size-value');
      if (out) out.textContent = value + '%';
      const el = document.getElementById('code-size') as HTMLInputElement | null;
      if (el) {
        el.value = value;
        paintRange(el);
      }
      if (persist) localStorage.setItem(KEYS.codeSize, value);
    },
    fireworks(on: boolean, persist: boolean) {
      // 和樱花一样：给 <html> 打类，fireworks.ts 读它
      document.documentElement.classList.toggle('fireworks-off', !on);
      setSwitch('fireworks', on);
      if (persist) localStorage.setItem(KEYS.fireworks, String(on));
      window.dispatchEvent(new CustomEvent('fireworks:change', { detail: on }));
    },
  };

  // 绑定
  hueRange?.addEventListener('input', () => apply.hue(hueRange.value, true));
  header.querySelectorAll<HTMLElement>('[data-hue]').forEach((b) => b.addEventListener('click', () => apply.hue(b.dataset.hue ?? DEFAULTS.hue, true)));
  header.querySelectorAll<HTMLElement>('[data-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const name = button.dataset.toggle ?? '';
      const next = button.getAttribute('aria-checked') !== 'true';
      if (name === 'sakura') apply.sakura(next, true);
      else if (name === 'fireworks') apply.fireworks(next, true);
    });
  });
  const bindRange = (id: string, fn: (v: string, p: boolean) => void) => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    el?.addEventListener('input', () => fn(el.value, true));
  };
  bindRange('prose-size', apply.proseSize);
  bindRange('prose-leading', apply.proseLeading);
  bindRange('code-size', apply.codeSize);

  header.querySelectorAll<HTMLElement>('[data-layout]').forEach((button) => {
    button.addEventListener('click', () => apply.layout(button.dataset.layout ?? 'list', true));
  });
  header.querySelector<HTMLElement>('[data-settings-reset]')?.addEventListener('click', () => {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
    apply.hue(DEFAULTS.hue, false);
    apply.layout('list', false);
    apply.sakura(false, false);
    apply.fireworks(false, false);
    apply.proseSize(DEFAULTS.proseSize, false);
    apply.proseLeading(DEFAULTS.proseLeading, false);
    apply.codeSize(DEFAULTS.codeSize, false);
  });

  // 每次渲染都把已保存的设置重新应用一遍
  apply.hue(localStorage.getItem(KEYS.hue) ?? DEFAULTS.hue, false);
  apply.layout(localStorage.getItem(KEYS.layout) ?? 'list', false);
  apply.sakura(readSwitch(KEYS.sakura, false), false);
  apply.fireworks(readSwitch(KEYS.fireworks, false), false);
  apply.proseSize(localStorage.getItem(KEYS.proseSize) ?? DEFAULTS.proseSize, false);
  apply.proseLeading(localStorage.getItem(KEYS.proseLeading) ?? DEFAULTS.proseLeading, false);
  apply.codeSize(localStorage.getItem(KEYS.codeSize) ?? DEFAULTS.codeSize, false);
}
