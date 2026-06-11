/* ============================================================
   Mario stats-bar stage
   - Pixel-art sprites built from text grids (no external assets)
   - MarioStage: lifecycle, ticker, collision, respawn
   - MarioCharacter: walk / face / jump / tease / drag / vanish
   ============================================================ */

(() => {
  'use strict';

  /* -------------------- Sprite atlas -------------------- */
  const PALETTE = {
    r: '#E52521', // Mario red / Toad cap
    g: '#43B047', // Luigi green / Koopa shell
    b: '#5C2C0A', // brown hair/hat shadow / shoe
    f: '#FCC89D', // skin
    k: '#1A0E04', // pupils / outlines
    y: '#FFD400', // overall buttons
    B: '#0B5BB6', // overall blue / Toad vest
    K: '#8B4513', // goomba body
    w: '#FFFFFF', // eye whites / Toad face / cap spots
    t: '#D2B48C', // goomba feet tan
    d: '#2A6D2A', // dark green (Koopa shell pattern)
    Y: '#FFD96E', // yellow (Koopa body / skin)
  };

  const SPRITES = {
    mario_a: [
      '....rrrr....',
      '...rrrrrr...',
      '..rrrrrrrr..',
      '..bbbffffb..',
      '..bffkfkfb..',
      '..bffffffb..',
      '..bbffbffb..',
      '...ffffff...',
      '....rrrr....',
      '...rrrrrr...',
      '..rryyyyrr..',
      '.rrryyyyrrr.',
      '.BBBBBBBBBB.',
      '.BBBBBBBBBB.',
      '..BB...BB...',
      '..bb...bb...',
    ],
    mario_b: [
      '....rrrr....',
      '...rrrrrr...',
      '..rrrrrrrr..',
      '..bbbffffb..',
      '..bffkfkfb..',
      '..bffffffb..',
      '..bbffbffb..',
      '...ffffff...',
      '....rrrr....',
      '...rrrrrr...',
      '..rryyyyrr..',
      '.rrryyyyrrr.',
      '.BBBBBBBBBB.',
      '.BBBBBBBBBB.',
      '...BB...BB..',
      '...bb...bb..',
    ],
    luigi_a: [
      '....gggg....',
      '...gggggg...',
      '..gggggggg..',
      '..bbbffffb..',
      '..bffkfkfb..',
      '..bffffffb..',
      '..bbffbffb..',
      '...ffffff...',
      '....gggg....',
      '...gggggg...',
      '..ggyyyygg..',
      '.gggyyyyggg.',
      '.BBBBBBBBBB.',
      '.BBBBBBBBBB.',
      '..BB...BB...',
      '..bb...bb...',
    ],
    luigi_b: [
      '....gggg....',
      '...gggggg...',
      '..gggggggg..',
      '..bbbffffb..',
      '..bffkfkfb..',
      '..bffffffb..',
      '..bbffbffb..',
      '...ffffff...',
      '....gggg....',
      '...gggggg...',
      '..ggyyyygg..',
      '.gggyyyyggg.',
      '.BBBBBBBBBB.',
      '.BBBBBBBBBB.',
      '...BB...BB..',
      '...bb...bb..',
    ],
    goomba_a: [
      '....KKKK....',
      '...KKKKKK...',
      '..KKKKKKKK..',
      '..KwwKKwwK..',
      '..KwBKKwBK..',
      '..KwwKKwwK..',
      '.KKKKKKKKKK.',
      '.KKkkkkkkKK.',
      '.KkKKKKKKkK.',
      '..KKKKKKKK..',
      '..tt....tt..',
      '..tt....tt..',
    ],
    goomba_b: [
      '....KKKK....',
      '...KKKKKK...',
      '..KKKKKKKK..',
      '..KwwKKwwK..',
      '..KwBKKwBK..',
      '..KwwKKwwK..',
      '.KKKKKKKKKK.',
      '.KKkkkkkkKK.',
      '.KkKKKKKKkK.',
      '..KKKKKKKK..',
      '...tttttt...',
      '...tttttt...',
    ],
    toad_a: [
      '....rrrr....',
      '...rrrrrr...',
      '..rwwrrwwr..',
      '..rwwrrwwr..',
      '.rrrwwwwrrr.',
      '.rrrwwwwrrr.',
      '.rrwwwwwwrr.',
      '..wwwwwwww..',
      '..wkffffkw..',
      '..wffffffw..',
      '...wfffw....',
      '....BBBB....',
      '...wwBBww...',
      '...ww..ww...',
      '...ww..ww...',
      '...bb..bb...',
    ],
    toad_b: [
      '....rrrr....',
      '...rrrrrr...',
      '..rwwrrwwr..',
      '..rwwrrwwr..',
      '.rrrwwwwrrr.',
      '.rrrwwwwrrr.',
      '.rrwwwwwwrr.',
      '..wwwwwwww..',
      '..wkffffkw..',
      '..wffffffw..',
      '...wfffw....',
      '....BBBB....',
      '...wwBBww...',
      '....wwww....',
      '....ww.ww...',
      '....bb.bb...',
    ],
    koopa_a: [
      '....gggg....',
      '...gggggg...',
      '..ggdggdgg..',
      '..gggggggg..',
      '.gdggggggdg.',
      '.gggggggggg.',
      '.YYkffYYYYY.',
      '.YYffffYYYY.',
      '..YYffYYY...',
      '..YYYYYYY...',
      '..YY..YY....',
      '..YY..YY....',
      '..gg..gg....',
      '..gg..gg....',
    ],
    koopa_b: [
      '....gggg....',
      '...gggggg...',
      '..ggdggdgg..',
      '..gggggggg..',
      '.gdggggggdg.',
      '.gggggggggg.',
      '.YYkffYYYYY.',
      '.YYffffYYYY.',
      '..YYffYYY...',
      '..YYYYYYY...',
      '...YYYY.....',
      '...YYYY.....',
      '...gggg.....',
      '...gggg.....',
    ],
  };

  function gridToSVG(grid) {
    const w = grid[0].length;
    const h = grid.length;
    let rects = '';
    for (let y = 0; y < h; y++) {
      const row = grid[y];
      for (let x = 0; x < row.length; x++) {
        const c = row[x];
        const color = PALETTE[c];
        if (!color) continue;
        rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`;
      }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" `
         + `shape-rendering="crispEdges" preserveAspectRatio="xMidYMax meet">${rects}</svg>`;
  }

  // Pre-render SVG strings once
  const SPRITE_SVG = Object.fromEntries(
    Object.entries(SPRITES).map(([k, g]) => [k, gridToSVG(g)])
  );

  /* -------------------- Character types --------------------
     Heroes never die. Villains die on contact with a hero and respawn
     as the next type in VILLAIN_ROTATION. */
  const TYPES = {
    mario:  { hero: true,  speed: 42, w: 26, h: 34,
              lines: ['Wahoo!', "Let's-a go!", "Mamma mia!", "Yahoo!"],
              victory: ['Got him!', 'Yahoo!', 'Wahoo!', "Mamma mia!"] },
    luigi:  { hero: true,  speed: 28, w: 26, h: 34,
              lines: ['Hey hey!', "Oh-kee!", "Let's go!", "Whee!"],
              victory: ['Got him!', 'Oh yeah!', 'Whee!', 'Easy!'] },
    goomba: { hero: false, speed: 18, w: 26, h: 26,
              lines: ['Grr!', '...', '!?', 'Hmph!'] },
    toad:   { hero: false, speed: 24, w: 26, h: 34,
              lines: ['Eep!', 'Uh oh!', '?!', 'Hey!'] },
    koopa:  { hero: false, speed: 22, w: 26, h: 30,
              lines: ['Shell up!', 'Grr.', '...', 'Hmph!'] },
  };

  const VILLAIN_ROTATION = ['goomba', 'toad', 'koopa'];
  const isHero = (type) => !!TYPES[type] && TYPES[type].hero;

  /* -------------------- Character -------------------- */
  class MarioCharacter {
    constructor(stage, type, opts = {}) {
      const cfg = TYPES[type];
      this.stage = stage;
      this.type = type;
      this.width = cfg.w;
      this.height = cfg.h;
      this.speed = opts.speed ?? cfg.speed;
      this.dx = opts.dir ?? (Math.random() < 0.5 ? 1 : -1);
      this.x = opts.x ?? Math.random() * Math.max(0, stage.width - this.width);
      this.stepTimer = 0;
      this.stepFrame = 'a';
      this.state = 'walk'; // walk | teased | dragging | falling | dead
      this.cooldown = 0;
      this._bubbleTimer = null;
      this._build();
      this._attachInteractions();
      this._applyTransform();
    }

    _build() {
      const el = document.createElement('div');
      el.className = 'mario-character spawning';
      el.dataset.type = this.type;
      el.style.width = this.width + 'px';
      el.style.height = this.height + 'px';
      el.setAttribute('aria-label', this.type);
      el.setAttribute('role', 'img');
      el.innerHTML = `
        <div class="mario-sprite">
          <div class="mario-frame mario-frame-a">${SPRITE_SVG[this.type + '_a']}</div>
          <div class="mario-frame mario-frame-b">${SPRITE_SVG[this.type + '_b']}</div>
        </div>
        <div class="mario-bubble" hidden></div>
      `;
      this.element = el;
      this.spriteEl = el.querySelector('.mario-sprite');
      this.bubbleEl = el.querySelector('.mario-bubble');
      this.stage.element.appendChild(el);
      // clear spawning class after the intro plays
      setTimeout(() => el.classList.remove('spawning'), 500);
    }

    _applyTransform() {
      this.element.style.transform = `translate3d(${this.x}px, 0, 0)`;
      this.element.classList.toggle('face-left', this.dx < 0);
    }

    update(dt) {
      if (this.state !== 'walk') return;
      this.x += this.dx * this.speed * dt;
      const maxX = this.stage.width - this.width;
      if (this.x >= maxX) { this.x = maxX; this.dx = -1; }
      else if (this.x <= 0) { this.x = 0; this.dx = 1; }

      // step frame swap — faster characters step faster
      this.stepTimer += dt;
      const interval = Math.max(0.12, 0.45 - this.speed / 220);
      if (this.stepTimer >= interval) {
        this.stepTimer = 0;
        this.stepFrame = this.stepFrame === 'a' ? 'b' : 'a';
        this.element.classList.toggle('step-b', this.stepFrame === 'b');
      }
      if (this.cooldown > 0) this.cooldown -= dt;
      this._applyTransform();
    }

    collidesWith(other) {
      const ax = this.x, bx = other.x;
      const aw = this.width, bw = other.width;
      return ax < bx + bw - 4 && ax + aw - 4 > bx;
    }

    interact(other) {
      if (this.cooldown > 0) return;
      this.cooldown = 1.6;
      // bounce away
      this.dx = this.x < other.x ? -1 : 1;
      this.element.classList.add('jump');
      setTimeout(() => this.element.classList.remove('jump'), 500);
      this.showBubble(this._line());
    }

    /* Hero stomps a villain — small triumph jump, no direction change. */
    victoryJump() {
      this.cooldown = 1.2;
      this.element.classList.add('jump');
      setTimeout(() => this.element.classList.remove('jump'), 500);
      const lines = TYPES[this.type].victory || TYPES[this.type].lines;
      this.showBubble(lines[Math.floor(Math.random() * lines.length)]);
    }

    /* Villain dies; squish + vanish, stage queues the next villain type. */
    defeated() {
      if (this.state === 'dead' || this.state === 'falling') return;
      this.state = 'falling'; // reuse "no-update" state
      const el = this.element;
      el.classList.remove('grabbing', 'dragging', 'teased', 'jump');
      el.classList.add('squished');
      this.showBubble('×_×');
      const delay = 2000 + Math.random() * 1000;
      setTimeout(() => {
        el.classList.add('vanishing');
        setTimeout(() => {
          el.remove();
          this.state = 'dead';
          this.stage.scheduleVillainRespawn(delay - 600);
        }, 280);
      }, 320);
    }

    _line() {
      const lines = TYPES[this.type].lines;
      return lines[Math.floor(Math.random() * lines.length)];
    }

    showBubble(text) {
      this.bubbleEl.textContent = text;
      this.bubbleEl.hidden = false;
      clearTimeout(this._bubbleTimer);
      this._bubbleTimer = setTimeout(() => { this.bubbleEl.hidden = true; }, 900);
    }

    tease() {
      if (this.state !== 'walk') return;
      this.state = 'teased';
      this.element.classList.add('teased');
      this.showBubble('!');
      this._emitSparks(4);
      setTimeout(() => {
        this.element.classList.remove('teased');
        if (this.state === 'teased') this.state = 'walk';
      }, 620);
    }

    _emitSparks(n) {
      const rect = this.element.getBoundingClientRect();
      const stageRect = this.stage.element.getBoundingClientRect();
      const cx = rect.left + rect.width / 2 - stageRect.left;
      const cy = rect.top - stageRect.top + 4;
      for (let i = 0; i < n; i++) {
        const s = document.createElement('span');
        s.className = 'mario-spark';
        s.style.left = (cx - 2) + 'px';
        s.style.top = cy + 'px';
        const angle = (Math.PI / n) * i - Math.PI / 2 + (Math.random() - 0.5) * 0.6;
        const dist = 18 + Math.random() * 14;
        s.style.setProperty(
          '--spark-end',
          `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0.3)`
        );
        this.stage.element.appendChild(s);
        setTimeout(() => s.remove(), 720);
      }
    }

    /* ---------- Input: click vs drag ----------
       Listeners live on `document` while a drag is active. We cannot use
       setPointerCapture on the character because re-parenting it to <body>
       in _beginDrag releases capture, so pointerup never fires back. */
    _attachInteractions() {
      const el = this.element;
      let activeId = null;
      let startX = 0, startY = 0, moved = false;
      let docMove = null, docUp = null;

      const cleanup = () => {
        if (docMove) document.removeEventListener('pointermove', docMove);
        if (docUp) {
          document.removeEventListener('pointerup', docUp);
          document.removeEventListener('pointercancel', docUp);
        }
        docMove = docUp = null;
        activeId = null;
        el.classList.remove('grabbing');
      };

      const onDown = (e) => {
        if (this.state === 'dead' || this.state === 'falling') return;
        if (activeId !== null) return; // already tracking a pointer
        e.preventDefault();
        activeId = e.pointerId;
        moved = false;
        startX = e.clientX;
        startY = e.clientY;
        el.classList.add('grabbing');

        docMove = (ev) => {
          if (ev.pointerId !== activeId) return;
          if (!moved) {
            const d = Math.hypot(ev.clientX - startX, ev.clientY - startY);
            if (d > 6) { moved = true; this._beginDrag(ev); }
          }
          if (moved && this.state === 'dragging') this._dragTo(ev.clientX, ev.clientY);
        };
        docUp = (ev) => {
          if (ev.pointerId !== activeId) return;
          const wasDragging = moved && this.state === 'dragging';
          const endX = ev.clientX, endY = ev.clientY;
          cleanup();
          if (wasDragging) this._endDrag(endX, endY);
          else this.tease();
        };
        document.addEventListener('pointermove', docMove);
        document.addEventListener('pointerup', docUp);
        document.addEventListener('pointercancel', docUp);
      };

      el.addEventListener('pointerdown', onDown);
      this._detachInteractions = cleanup; // surface for forced cleanup if needed
    }

    _beginDrag(e) {
      this.state = 'dragging';
      this.element.classList.add('dragging');
      const rect = this.element.getBoundingClientRect();
      this._dragOffset = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      // lift to <body> so it can leave the stats-bar (which clips overflow)
      document.body.appendChild(this.element);
      this.element.style.position = 'fixed';
      this.element.style.transform = 'none';
      this.element.style.left = rect.left + 'px';
      this.element.style.top = rect.top + 'px';
      this.element.classList.toggle('face-left', false);
    }

    _dragTo(cx, cy) {
      this.element.style.left = (cx - this._dragOffset.x) + 'px';
      this.element.style.top = (cy - this._dragOffset.y) + 'px';
    }

    _endDrag(cx, cy) {
      const sr = this.stage.element.getBoundingClientRect();
      // generous return zone — anywhere inside the stats bar (plus small slack)
      const insideStage = cx >= sr.left - 10 && cx <= sr.right + 10
                       && cy >= sr.top - 20  && cy <= sr.bottom + 40;
      if (insideStage) this._returnToStage(cx);
      else this._fallAndVanish();
    }

    _returnToStage(cx) {
      const sr = this.stage.element.getBoundingClientRect();
      this.element.classList.remove('dragging');
      this.element.style.position = '';
      this.element.style.left = '';
      this.element.style.top = '';
      this.stage.element.appendChild(this.element);
      this.x = Math.max(0, Math.min(this.stage.width - this.width, cx - sr.left - this.width / 2));
      this._applyTransform();
      this.state = 'walk';
    }

    _fallAndVanish() {
      this.state = 'falling';
      const el = this.element;
      el.classList.remove('dragging');
      const startTs = performance.now();
      const startX = parseFloat(el.style.left) || 0;
      const startY = parseFloat(el.style.top) || 0;
      const targetY = window.innerHeight + 80;
      const drift = (Math.random() - 0.5) * 120;
      const spin = (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 360);
      const duration = 720;
      const step = (ts) => {
        const t = Math.min(1, (ts - startTs) / duration);
        const y = startY + (targetY - startY) * t * t;
        const x = startX + drift * t;
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.transform = `rotate(${spin * t}deg)`;
        if (t < 1) requestAnimationFrame(step);
        else this._vanish();
      };
      requestAnimationFrame(step);
    }

    _vanish() {
      this.element.classList.add('vanishing');
      const delay = 2000 + Math.random() * 1000;
      setTimeout(() => {
        this.element.remove();
        this.state = 'dead';
        this.stage.scheduleRespawn(this.type, delay - 320);
      }, 320);
    }
  }

  /* -------------------- Stage -------------------- */
  class MarioStage {
    constructor(element) {
      this.element = element;
      this.characters = [];
      this.width = 0;
      this.height = 0;
      this.lastTs = 0;
      this._villainIdx = 0; // pointer into VILLAIN_ROTATION
      this._roHandler = () => this._measure();
      this._measure();
      window.addEventListener('resize', this._roHandler);
      // Heroes always; one villain at a time (rotates on death)
      this.spawn('mario', { x: this.width * 0.12, dir:  1 });
      this.spawn('luigi', { x: this.width * 0.42, dir: -1 });
      this.spawn(this._currentVillainType(), { x: this.width * 0.78, dir: -1 });
      this._loop = (ts) => this._tick(ts);
      requestAnimationFrame(this._loop);
    }

    _currentVillainType() {
      return VILLAIN_ROTATION[this._villainIdx % VILLAIN_ROTATION.length];
    }
    _advanceVillain() {
      this._villainIdx = (this._villainIdx + 1) % VILLAIN_ROTATION.length;
      return this._currentVillainType();
    }

    _measure() {
      const r = this.element.getBoundingClientRect();
      this.width = r.width;
      this.height = r.height;
      for (const c of this.characters) {
        if (c.state === 'walk') {
          c.x = Math.min(c.x, Math.max(0, this.width - c.width));
        }
      }
    }

    spawn(type, opts) {
      const c = new MarioCharacter(this, type, opts);
      this.characters.push(c);
      return c;
    }

    scheduleRespawn(type, delayMs) {
      const wait = Math.max(0, delayMs);
      setTimeout(() => {
        const dir = Math.random() < 0.5 ? 1 : -1;
        const x = dir === 1 ? -TYPES[type].w : this.width + 4;
        const baseSpeed = TYPES[type].speed;
        const speed = baseSpeed + (Math.random() * 16 - 8);
        this.spawn(type, { x, dir, speed });
      }, wait);
    }

    /* Villain death (by hero stomp) → respawn next type in rotation. */
    scheduleVillainRespawn(delayMs) {
      const nextType = this._advanceVillain();
      this.scheduleRespawn(nextType, delayMs);
    }

    _tick(ts) {
      const dt = this.lastTs ? Math.min(0.05, (ts - this.lastTs) / 1000) : 0;
      this.lastTs = ts;
      for (const c of this.characters) c.update(dt);
      this._collide();
      // sweep dead refs
      this.characters = this.characters.filter(c => c.state !== 'dead');
      requestAnimationFrame(this._loop);
    }

    _collide() {
      const live = this.characters.filter(c => c.state === 'walk');
      for (let i = 0; i < live.length; i++) {
        for (let j = i + 1; j < live.length; j++) {
          const a = live[i], b = live[j];
          if (!a.collidesWith(b)) continue;
          const aHero = isHero(a.type), bHero = isHero(b.type);
          if (aHero && !bHero)       { a.victoryJump(); b.defeated(); }
          else if (bHero && !aHero)  { b.victoryJump(); a.defeated(); }
          else                       { a.interact(b);   b.interact(a); }
        }
      }
    }
  }

  /* -------------------- Boot -------------------- */
  function boot() {
    const el = document.getElementById('marioStage');
    if (!el) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // skip on very small screens to keep stats clean
    if (window.innerWidth < 380) return;
    new MarioStage(el);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
