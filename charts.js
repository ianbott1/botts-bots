// Charts for "I Gave 11 AIs Fantasy Sports Teams". Data through 9 Nov 2026.
(function () {
  const BASE = (document.currentScript && document.currentScript.src || '').replace(/charts\.js.*$/, '') + 'logos/';
  const LOGO = {'Claude Fable':'anthropic','Claude Sonnet':'anthropic','Muse':'muse','Qwen':'qwen','Grok':'grok','Kimi':'kimi','ChatGPT':'chatgpt','DeepSeek':'deepseek','Gemini':'gemini','Spreadsheet':'espn'};
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}"${o.cls ? ` class="${o.cls}"` : ' class="t1"'}${o.size ? ` font-size="${o.size}"` : ''}${o.weight ? ` font-weight="${o.weight}"` : ''}${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.fill ? ` style="fill:${o.fill}"` : ''}>${esc(s)}</text>`;
  const svg = (w, h, label, inner, size = 12) => `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}" font-size="${size}">${inner}</svg>`;
  const SHEET = 'var(--sheet)', MUTED = 'var(--muted)';

  const charts = {};

  // 1. League records vs the spreadsheet
  charts.records = () => {
    const rows = [
      ['Football','Muse',55,17],['Football','Spreadsheet',51,21],['Football','Grok',48,24],['Football','Claude Fable',46,26],['Football','Qwen',40,32],['Football','ChatGPT',37,35],['Football','Kimi',36,36],['Football','DeepSeek',22,50],['Football','Claude Sonnet',18,54],['Football','Gemini',7,65],
      ['Hockey','Grok',41,4],['Hockey','Claude Fable',27,18],['Hockey','Muse',25,19],['Hockey','Qwen',24,21],['Hockey','Spreadsheet',23,22],['Hockey','ChatGPT',19,26],['Hockey','Claude Sonnet',19,26],['Hockey','DeepSeek',18,27],['Hockey','Kimi',16,29],['Hockey','Gemini',12,32],
      ['Basketball','DeepSeek',29,4],['Basketball','Spreadsheet',23,10],['Basketball','Mistral',23,10],['Basketball','Instinct',22,11],['Basketball','Qwen',18,15],['Basketball','Claude Sonnet',18,15],['Basketball','Grok',18,15],['Basketball','Kimi',16,17],['Basketball','Claude Fable',13,20],['Basketball','Muse',11,22],['Basketball','Gemini',5,28],['Basketball','ChatGPT',2,31]
    ].map(([sport, team, w, l]) => ({ sport, team, w, l, p: w / (w + l) }));
    const sports = [['Football', 8], ['Hockey', 5], ['Basketball', 3]];
    const pw = 250, y0 = 118, rh = 24, lab = 96, bw = 100;
    let inner = '', summary = [];
    sports.forEach(([sport, weeks], i) => {
      const list = rows.filter(r => r.sport === sport), sheet = list.find(r => r.team === 'Spreadsheet');
      const ais = list.filter(r => r !== sheet), beat = ais.filter(r => r.p > sheet.p).length;
      summary.push(`${sport.toLowerCase()} ${beat} of ${ais.length}`);
      const x0 = 10 + i * pw, xs = v => x0 + lab + v * bw;
      inner += T(x0, y0 - 16, `${sport} (${weeks} weeks)`, { weight: 600 });
      list.forEach((r, j) => {
        const on = r === sheet || r.p > sheet.p, y = y0 + j * rh;
        inner += T(x0 + lab - 6, y + 12, r.team, { anchor: 'end', cls: on ? 't1' : 't2', weight: r === sheet ? 600 : null });
        inner += `<rect x="${xs(0)}" y="${y}" width="${r.p * bw}" height="16" rx="2" fill="${r === sheet ? SHEET : MUTED}" fill-opacity="${on ? 1 : 0.45}"><title>${r.sport}, ${esc(r.team)}: ${r.w}-${r.l} against the field (${Math.round(r.p * 100)}%)</title></rect>`;
        inner += T(xs(r.p) + 4, y + 12, `${Math.round(r.p * 100)}%`, { cls: 't2', size: 11 });
      });
    });
    const head = T(10, 28, "Where ESPN's projections are best, they're hardest to beat", { size: 17, weight: 600 })
      + T(10, 52, `AIs that beat the spreadsheet: ${summary.join(', ')}`, { cls: 't2' })
      + T(10, 72, "Win rate against the whole field: each week, every team's score compared with every other team's.", { cls: 't2' })
      + T(10, 430, 'Blue: the spreadsheet. Darker grey: AIs ahead of it.', { cls: 't2', size: 11 });
    return svg(760, 440, 'Where ESPN projections are best, they are hardest to beat', head + inner);
  };

  // 2. Football vs hockey scatter
  charts.scatter = () => {
    const rows = [
      ['Claude Fable',46,26,27,18,-9,-6,'end'],['Muse',55,17,25,19,9,4,'start'],['Qwen',40,32,24,21,9,4,'start'],['Grok',48,24,41,4,9,4,'start'],['Kimi',36,36,16,29,9,9,'start'],['ChatGPT',37,35,19,26,9,-2,'start'],['Claude Sonnet',18,54,19,26,0,-10,'middle'],['DeepSeek',22,50,18,27,0,20,'middle'],['Gemini',7,65,12,32,9,4,'start'],['Spreadsheet',51,21,23,22,9,22,'start',true]
    ].map(([team, fw, fl, hw, hl, dx, dy, anchor, control]) => ({ team, fw, fl, hw, hl, dx, dy, anchor, control: !!control, f: 100 * fw / (fw + fl), h: 100 * hw / (hw + hl) }));
    const X = v => 100 + v * 6, Y = v => 400 - (v - 20) * 3.75;
    const ai = rows.filter(r => !r.control);
    const rk = vals => vals.map(v => vals.filter(u => u < v).length + (vals.filter(u => u === v).length + 1) / 2);
    const rf = rk(ai.map(r => r.f)), rh = rk(ai.map(r => r.h)), m = (ai.length + 1) / 2;
    const cov = rf.reduce((s, v, i) => s + (v - m) * (rh[i] - m), 0), vf = rf.reduce((s, v) => s + (v - m) ** 2, 0), vh = rh.reduce((s, v) => s + (v - m) ** 2, 0);
    const rho = cov / Math.sqrt(vf * vh);
    let g = `<line x1="100" x2="700" y1="400" y2="400" class="axis"/><line x1="100" x2="100" y1="100" y2="400" class="axis"/><line x1="${X(50)}" x2="${X(50)}" y1="100" y2="400" class="ref"/><line x1="100" x2="700" y1="${Y(50)}" y2="${Y(50)}" class="ref"/>`;
    g += T(X(0), 418, '0%', { anchor: 'middle', cls: 't2' }) + T(X(50), 418, '50%', { anchor: 'middle', cls: 't2' }) + T(X(100), 418, '100%', { anchor: 'middle', cls: 't2' });
    g += T(92, Y(25) + 4, '25%', { anchor: 'end', cls: 't2' }) + T(92, Y(50) + 4, '50%', { anchor: 'end', cls: 't2' }) + T(92, Y(100) + 4, '100%', { anchor: 'end', cls: 't2' });
    g += T(400, 446, 'Football', { anchor: 'middle' }) + T(100, 88, 'Hockey');
    rows.forEach(r => {
      const sz = 24, sx = r.anchor === 'start' ? 1.6 : r.anchor === 'end' ? 1.6 : 1, sy = r.anchor === 'middle' ? 1.7 : 1;
      g += `<g><title>${esc(r.team)}: football ${r.fw}-${r.fl} (${r.f.toFixed(0)}%), hockey ${r.hw}-${r.hl} (${r.h.toFixed(0)}%)</title><rect x="${X(r.f) - sz / 2 - 1}" y="${Y(r.h) - sz / 2 - 1}" width="${sz + 2}" height="${sz + 2}" rx="6" fill="#fff" stroke="${r.control ? SHEET : '#d6d8dc'}"/><image href="${BASE}${LOGO[r.team]}.png" x="${X(r.f) - sz / 2}" y="${Y(r.h) - sz / 2}" width="${sz}" height="${sz}" preserveAspectRatio="xMidYMid meet" style="clip-path: inset(0 round 5px)"/></g>`;
      g += T(X(r.f) + r.dx * sx, Y(r.h) + r.dy * sy, r.team, { anchor: r.anchor, weight: r.control ? 600 : null, fill: r.control ? SHEET : null });
    });
    const head = T(20, 30, 'AIs that manage well in football also manage well in hockey', { size: 18, weight: 600 })
      + T(20, 54, `Share of weekly matchups won against the whole field. Rank correlation across the ${ai.length} AIs: ${rho.toFixed(2)}`, { cls: 't2' });
    return svg(760, 470, 'AIs that manage well in football also manage well in hockey', head + g, 13);
  };

  // 3. Brier scores vs coin flip
  charts.brier = () => {
    const rows = [
      ['Football','Claude Fable',.210],['Football','Spreadsheet',.223],['Football','Claude Sonnet',.237],['Football','Muse',.252],['Football','Kimi',.263],['Football','Grok',.266],['Football','ChatGPT',.268],['Football','DeepSeek',.282],['Football','Qwen',.290],['Football','Gemini',.331],
      ['Hockey','Spreadsheet',.242],['Hockey','DeepSeek',.246],['Hockey','ChatGPT',.248],['Hockey','Claude Sonnet',.254],['Hockey','Claude Fable',.257],['Hockey','Kimi',.268],['Hockey','Grok',.269],['Hockey','Muse',.281],['Hockey','Qwen',.281],['Hockey','Gemini',.300],
      ['Basketball','Muse',.254],['Basketball','Claude Fable',.259],['Basketball','Qwen',.259],['Basketball','ChatGPT',.259],['Basketball','DeepSeek',.289],['Basketball','Gemini',.296],['Basketball','Mistral',.306],['Basketball','Claude Sonnet',.308],['Basketball','Instinct',.312],['Basketball','Grok',.329],['Basketball','Kimi',.348],['Basketball','Spreadsheet',.383]
    ].map(([sport, team, b]) => ({ sport, team, b }));
    const coin = 0.25, sports = [['Football', 35], ['Hockey', 25], ['Basketball', 18]];
    const pw = 250, y0 = 118, rh = 24, lab = 96, scale = 100 / 0.4;
    let inner = '', summary = [], beatAll = 0, nAll = 0;
    sports.forEach(([sport, games], i) => {
      const list = rows.filter(r => r.sport === sport), ais = list.filter(r => r.team !== 'Spreadsheet');
      const beat = ais.filter(r => r.b < coin).length; beatAll += beat; nAll += ais.length;
      summary.push(`${sport.toLowerCase()} ${beat} of ${ais.length}`);
      const x0 = 10 + i * pw, xs = v => x0 + lab + v * scale;
      inner += T(x0, y0 - 16, `${sport} (${games} games)`, { weight: 600 });
      inner += `<line x1="${xs(coin)}" x2="${xs(coin)}" y1="${y0 - 6}" y2="${y0 + list.length * rh}" class="ref"/>`;
      list.forEach((r, j) => {
        const sheet = r.team === 'Spreadsheet', on = sheet || r.b < coin, y = y0 + j * rh;
        inner += T(x0 + lab - 6, y + 12, r.team, { anchor: 'end', cls: on ? 't1' : 't2', weight: sheet ? 600 : null });
        inner += `<rect x="${xs(0)}" y="${y}" width="${r.b * scale}" height="16" rx="2" fill="${sheet ? SHEET : MUTED}" fill-opacity="${on ? 1 : 0.45}"><title>${r.sport}, ${esc(r.team)}: ${r.b.toFixed(3)}</title></rect>`;
        inner += T(xs(0.4) + 36, y + 12, r.b.toFixed(3), { anchor: 'end', cls: 't2', size: 11 });
      });
    });
    const head = T(10, 28, `Only ${beatAll} of ${nAll} AI forecasting records beat a coin flip`, { size: 17, weight: 600 })
      + T(10, 52, "Brier score on every game's prediction. Lower is better; saying 50/50 every time scores 0.250.", { cls: 't2' })
      + T(10, 72, `Better than a coin flip: ${summary.join(', ')}`, { cls: 't2' })
      + T(10, 430, 'Dashed line: the coin flip. Blue: the spreadsheet. Darker grey: AIs better than a coin flip.', { cls: 't2', size: 11 });
    return svg(760, 440, 'Few AI forecasting records beat a coin flip', head + inner);
  };

  // 4. Confidence vs accuracy
  charts.confidence = () => {
    const rows = [['50-59%',56,51,266],['60-69%',64,53,318],['70-79%',73,44,104],['80%+',84,53,30]].map(([bucket, said, right, n]) => ({ bucket, said, right, n }));
    const total = rows.reduce((s, r) => s + r.n, 0), band = 150, left = 110, base = 330, sc = 2.2;
    const y = v => base - v * sc, xc = i => left + i * band + band / 2;
    let g = `<rect x="20" y="70" width="12" height="12" fill="${MUTED}"/>` + T(38, 81, 'How often it was right')
      + `<line x1="220" y1="76" x2="244" y2="76" stroke="var(--accent)" stroke-width="3"/>` + T(250, 81, 'How confident it said it was (average)')
      + `<line x1="${left}" x2="730" y1="${y(50)}" y2="${y(50)}" class="ref"/>` + T(left - 8, y(50) + 4, 'coin flip', { anchor: 'end', cls: 't2' })
      + `<line x1="${left}" x2="730" y1="${base}" y2="${base}" class="axis"/>`;
    rows.forEach((r, i) => {
      g += `<rect x="${xc(i) - 35}" y="${y(r.right)}" width="70" height="${base - y(r.right)}" fill="${MUTED}"><title>Said ${r.bucket} (average ${r.said}%): right ${r.right}% of ${r.n} picks</title></rect>`;
      g += T(xc(i), y(r.right) + 20, `${r.right}%`, { anchor: 'middle', weight: 600 });
      g += `<line x1="${xc(i) - 48}" x2="${xc(i) + 48}" y1="${y(r.said)}" y2="${y(r.said)}" stroke="var(--accent)" stroke-width="3"/>`;
      g += T(xc(i) + 52, y(r.said) + 4, `${r.said}%`, { fill: 'var(--accent)' });
      g += T(xc(i), base + 22, `Said ${r.bucket}`, { anchor: 'middle' }) + T(xc(i), base + 40, `${r.n} picks`, { anchor: 'middle', cls: 't2' });
    });
    const head = T(20, 30, 'When the AIs say they are sure, they are no more often right', { size: 18, weight: 600 })
      + T(20, 54, `${total.toLocaleString('en-US')} AI predictions across three leagues, grouped by the confidence the AI gave`, { cls: 't2' });
    return svg(760, 390, 'When the AIs say they are sure, they are no more often right', head + g, 13);
  };

  // 5. Inattention vs judgment
  charts.ledger = () => {
    const rows = [['Football',222.5,88.6],['Hockey',102.1,25.3],['Basketball',88.2,-6.9]];
    const zero = 230, scale = 380 / 230, y0 = 110, gh = 86, xw = v => Math.abs(v) * scale;
    let g = `<rect x="20" y="68" width="12" height="12" rx="2" fill="var(--accent)"/>` + T(38, 79, 'Starting players who did not play')
      + `<rect x="300" y="68" width="12" height="12" rx="2" fill="${MUTED}"/>` + T(318, 79, 'Overruling the projections');
    rows.forEach(([sport, dead, calls], i) => {
      const gy = y0 + i * gh;
      g += T(20, gy + 26, sport, { weight: 600 }) + T(20, gy + 44, calls > 0 ? `${(dead / calls).toFixed(1)}x as costly` : 'calls gained points', { cls: 't2', size: 12 });
      g += `<rect x="${zero}" y="${gy + 8}" width="${xw(dead)}" height="20" rx="2" fill="var(--accent)"><title>${sport}: ${dead} points lost to starting players who did not play</title></rect>`;
      g += T(zero + xw(dead) + 6, gy + 23, `${dead} pts`);
      g += `<rect x="${calls >= 0 ? zero : zero - xw(calls)}" y="${gy + 34}" width="${xw(calls)}" height="20" rx="2" fill="${MUTED}"><title>${sport}: ${calls >= 0 ? calls + ' points lost' : -calls + ' points gained'} overruling the projections</title></rect>`;
      g += T(calls >= 0 ? zero + xw(calls) + 6 : zero + 6, gy + 49, calls >= 0 ? `${calls} pts` : `+${-calls} pts gained`, { cls: 't2' });
    });
    g += `<line x1="${zero}" x2="${zero}" y1="${y0}" y2="${y0 + rows.length * gh - 20}" class="axis"/>`;
    const head = T(20, 30, 'Not paying attention costs more than bad judgment, in every sport', { size: 17, weight: 600 })
      + T(20, 54, 'Points the AIs lost, all teams combined, by cause', { cls: 't2' });
    return svg(760, 370, 'Not paying attention costs more than bad judgment in every sport', head + g, 13);
  };

  // 6. Errors by AI
  charts.errors = () => {
    const rows = [['Gemini',3,20,3],['DeepSeek',10,4,3],['Kimi',7,4,3],['Qwen',8,0,3],['Grok',1,6,3],['ChatGPT',4,1,3],['Mistral',5,0,1],['Muse',3,0,3],['Claude Fable',1,0,3],['Claude Sonnet',0,0,3],['Instinct',0,0,1]].map(([team, facts, voids, leagues]) => ({ team, facts, voids, leagues, tot: facts + voids }));
    const left = 200, y0 = 104, rh = 28, scale = 440 / 24;
    const worst = rows.reduce((a, r) => r.tot > a.tot ? r : a, rows[0]);
    const anth = rows.filter(r => r.team.startsWith('Claude')).reduce((s, r) => s + r.tot, 0);
    let g = `<rect x="20" y="68" width="12" height="12" rx="2" fill="var(--cat-3)"/>` + T(38, 79, 'Stated something false as fact')
      + `<rect x="290" y="68" width="12" height="12" rx="2" fill="var(--cat-2)"/>` + T(308, 79, 'Bid on a player another team already owned');
    rows.forEach((r, i) => {
      const y = y0 + i * rh;
      g += T(left - 10, y + 15, r.leagues === 1 ? `${r.team} (basketball only)` : r.team, { anchor: 'end' });
      g += `<rect x="${left}" y="${y}" width="${r.facts * scale}" height="20" fill="var(--cat-3)"><title>${esc(r.team)}: ${r.facts} false statements of fact</title></rect>`;
      g += `<rect x="${left + r.facts * scale}" y="${y}" width="${r.voids * scale}" height="20" fill="var(--cat-2)"><title>${esc(r.team)}: ${r.voids} void waiver claims</title></rect>`;
      g += T(left + r.tot * scale + 6, y + 15, r.tot, { cls: 't2' });
    });
    const head = T(20, 30, `${worst.team} has made ${worst.tot} of these mistakes. The two Claude models have made ${anth} between them.`, { size: 17, weight: 600 })
      + T(20, 54, 'Logged errors across all three leagues, by AI', { cls: 't2' });
    return svg(760, 440, 'Invented facts and void claims by AI', head + g, 13);
  };

  document.querySelectorAll('[data-chart]').forEach(el => {
    const f = charts[el.dataset.chart];
    if (f) el.insertAdjacentHTML('afterbegin', f());
  });
})();
