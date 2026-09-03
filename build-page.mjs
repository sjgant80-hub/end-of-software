// build-page.mjs — inline the gated seam law AND the generated shadow into index.html,
// verbatim, each between its own markers. CI diffs the rebuild so the live page can drift from
// neither the proven law nor the real index. Fixpoint by construction.
import { readFileSync, writeFileSync } from 'node:fs';

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const inject = (html, START, END, block) => {
  if (!html.includes(START)) { console.error('REFUSED: marker missing: ' + START); process.exit(1); }
  return html.replace(new RegExp(esc(START) + '[\\s\\S]*?' + esc(END)), () => START + '\n' + block + '\n' + END);
};

const src = readFileSync('render.mjs', 'utf8');
const exports = [...src.matchAll(/^export (?:function|const) ([A-Za-z0-9_]+)/gm)].map((m) => m[1]);
if (!exports.length) { console.error('REFUSED: the kernel exports nothing'); process.exit(1); }
const kernel = src.replace(/^export /gm, '').replace(/<\/script/g, '<\\/script') + '\nwindow.RENDER = { ' + exports.join(', ') + ' };';

const shadow = readFileSync('shadow.json', 'utf8');
if (!JSON.parse(shadow).folds?.length) { console.error('REFUSED: the shadow is empty'); process.exit(1); }
const shadowBlock = 'window.SHADOW = ' + shadow.replace(/<\/script/g, '<\\/script') + ';';

let html = readFileSync('page.template.html', 'utf8');
html = inject(html, '/*__KERNEL_START__*/', '/*__KERNEL_END__*/', kernel);
html = inject(html, '/*__SHADOW_START__*/', '/*__SHADOW_END__*/', shadowBlock);
writeFileSync('index.html', html);
console.log('inlined render.mjs (' + exports.join(', ') + ') + shadow (' + JSON.parse(shadow).folds.length + ' folds) → index.html');
