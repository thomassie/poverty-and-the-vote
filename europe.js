/* Europe's Divides: Poverty and the Vote (D3 v7), drawn into one element:

     <div id="europes-divides" data-base="https://<data host>/"></div>

   data-base       where data/*.json live (default: next to the page)
   data-header     "false" leaves out the built-in title (when the host page has its own)
   data-layout     "standalone" adds the page's own width and side gutters

   Reads data/*.json, written by pipeline/run.py from mart.eu_* (MotherDuck). No database access here.
   Styles: europe.css (scoped under .edv); colours come from the host's tokens or theme.css.
   Colours carry one meaning each: ink = poverty risk, blue = turnout, red = far right. */
(function () {
  'use strict';

  const root = document.getElementById('europes-divides');
  if (!root || typeof d3 === 'undefined') return;
  const BASE = root.dataset.base ? root.dataset.base.replace(/\/?$/, '/') : '';
  const SWISS_PAGE = 'https://thomassie.me/projects/people-vs-parliament/';
  root.classList.add('edv');
  if (root.dataset.layout === 'standalone') root.classList.add('edv--standalone');
  root.innerHTML = `<svg class="edv-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>
  <pattern id="edv-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect class="edv-hatch-bg" width="5" height="5"/><line class="edv-hatch-line" x1="0" y1="0" x2="0" y2="5"/></pattern>
</defs></svg>
<div class="masthead wrap">
  <div class="masthead__text">
    <p class="eyebrow">Europe&rsquo;s Divides</p>
    <h1>Poverty and the Vote<svg class="title-dot" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><circle cx="5" cy="5" r="5"/></svg></h1>
    <p class="lede">Do people in poorer regions vote less, and do they vote more for the far right? The European Parliament election of June 2024, region by region, set against the share of people at risk of poverty.</p>
  </div>
  <div class="mark" aria-hidden="true"><span class="mark__square"></span><span class="mark__circle"></span><span class="mark__half"></span></div>
</div>

<div class="edv__main">
  <section class="hero wrap" aria-label="Headline figures">
    <div class="hero__switch">
      <div class="seg" role="group" aria-label="How poorer regions are measured" id="edv-pov"></div>
      <p class="hero__pov" id="edv-pov-note"></p>
    </div>
    <div class="hero__item">
      <p class="hero__label"><i class="edv-sw edv-sw--blue"></i>Turnout</p>
      <p class="hero__figure" id="edv-hero-t">&nbsp;</p>
      <p class="hero__text" id="edv-hero-t-text">Loading the regions&hellip;</p>
    </div>
    <div class="hero__item">
      <p class="hero__label"><i class="edv-sw edv-sw--red"></i>Far right</p>
      <p class="hero__figure" id="edv-hero-f">&nbsp;</p>
      <p class="hero__text" id="edv-hero-f-text"></p>
    </div>
  </section>

  <section class="block wrap" aria-labelledby="edv-h-map">
    <div class="block__rail">
      <h2 id="edv-h-map">Region by region</h2>
      <p id="edv-map-intro">The regions of the 27 member states.</p>
      <p>Poverty risk is the share of people at risk of poverty or social exclusion: with an income below 60% of their country&rsquo;s median, unable to afford basic things, or in a household where hardly anyone works. <a href="#edv-glossary">What the terms mean</a>.</p>
    </div>
    <div class="block__body">
      <div class="seg" role="group" aria-label="Measure shown on the map" id="edv-measure"></div>
      <div class="seg" role="group" aria-label="Map level" id="edv-level"></div>
      <div class="edv-tools">
        <label class="edv-find" for="edv-find">Find a region</label>
        <input type="search" id="edv-find" list="edv-find-list" placeholder="e.g. Sicilia" autocomplete="off" spellcheck="false">
        <datalist id="edv-find-list"></datalist>
      </div>
      <div class="edv-legend" id="edv-legend"></div>
      <div class="chart edv-map" id="edv-map"><p class="note">Loading the map&hellip;</p></div>
      <p class="note" id="edv-map-status" aria-live="polite">Hover or tap the map for details; tap again to let go.</p>
      <p class="summary" id="edv-eu"></p>
      <details class="tableview" id="edv-table">
        <summary>Show all regions as a table</summary>
        <div class="tablewrap">
          <table>
            <thead><tr><th>Region</th><th>Country</th><th class="num">Poverty risk</th><th class="num">Income (country = 100)</th><th class="num">Turnout 2019</th><th class="num">Turnout 2024</th><th class="num">Far right 2019</th><th class="num">Far right 2024</th></tr></thead>
            <tbody></tbody>
          </table>
        </div>
      </details>
    </div>
  </section>

  <section class="block wrap" aria-labelledby="edv-h-all">
    <div class="block__rail">
      <h2 id="edv-h-all">All countries together</h2>
      <p>Every member state in one picture, its regions faint behind it. Each square is a country as a whole, and the line is the trend across countries (least squares).</p>
      <p>Between countries more than poverty differs: turnout habits, electoral rules and party landscapes too. With household income, the axis is income in purchasing power, EU&nbsp;=&nbsp;100, so that countries can be compared. The next section compares regions within each country instead.</p>
    </div>
    <div class="block__body">
      <div class="seg" role="group" aria-label="Vote measure" id="edv-ameasure"></div>
      <p class="edv-axes" id="edv-all-axes"></p>
      <div class="chart edv-all" id="edv-all"></div>
      <p class="note" id="edv-all-note"></p>
    </div>
  </section>

  <section class="block wrap" aria-labelledby="edv-h-countries">
    <div class="block__rail">
      <h2 id="edv-h-countries">Country by country</h2>
      <p>Turnout and the far right&rsquo;s strength differ far more between countries than inside them: compulsory voting, national elections held the same day, each country&rsquo;s own parties. So each region is compared with the other regions of its own country.</p>
      <p>The two change views ask the same question of how turnout and the far right&rsquo;s share moved between the European elections of 2019 and 2024, in percentage points: did poorer regions fall further behind, or catch up?</p>
      <p>Hollow dots are shown but not counted. France&rsquo;s overseas regions, in the Caribbean, South America and the Indian Ocean, differ from mainland France in too many other ways. In Belgium the lists counted as far right stand only in the Dutch-speaking electoral college, so for the far right only the five Flemish provinces are compared.</p>
      <p>Each circle is a region, its area the number of registered voters. Every region counts once, whatever its size, in &rho;, its range and the line. The line follows the trend. &rho; (rho) ranks the regions by poverty risk and by the vote and measures how well the two rankings agree, from &minus;1 to +1; from &plusmn;0.2 we call it a difference. Most countries have few regions, so &rho; is uncertain: below it, the range within which it lies with 90% confidence. Where that range crosses zero, the label is grey and the line dashed: the country on its own cannot tell.</p>
    </div>
    <div class="block__body">
      <div class="seg" role="group" aria-label="Vote measure" id="edv-pmeasure"></div>
      <p class="edv-axes" id="edv-axes"></p>
      <div class="chart edv-panels" id="edv-panels"></div>
      <p class="note" id="edv-panels-note"></p>
    </div>
  </section>

  <section class="block wrap" aria-labelledby="edv-h-far">
    <div class="block__rail">
      <h2 id="edv-h-far">What counts as far right</h2>
      <p>We follow the PopuList, a classification of European parties by a team of political scientists, as it stands, without changes of our own. It counts a party as far right when it is nativist (the state should belong to the native group) and authoritarian (a strictly ordered society).</p>
      <p>A list counts when the PopuList has its party as far right in the year of the election; a joint list counts by its first-named party. Some of these choices are open to debate, so here is every list counted, with its share of the vote.</p>
    </div>
    <div class="block__body">
      <div class="edv-lists" id="edv-lists"></div>
      <p class="note" id="edv-groups"></p>
    </div>
  </section>
</div>

<section class="foot glossary wrap" id="edv-glossary" aria-labelledby="edv-h-glossary">
  <h2 id="edv-h-glossary">Terms used here</h2>
  <dl>
    <dt>Poverty risk</dt>
    <dd>Short for &ldquo;at risk of poverty or social exclusion&rdquo;, the EU&rsquo;s headline measure of poverty (Eurostat, AROPE). A person counts if at least one of three things applies, and is counted once even if several do:
      <ul>
        <li><b>Low income:</b> the household&rsquo;s disposable income, after taxes and social benefits and adjusted for household size, is below 60% of the national median. The line is relative: it is far higher in euros in Luxembourg than in Bulgaria.</li>
        <li><b>Severe material and social deprivation:</b> the household cannot afford at least 7 of 13 everyday items, such as an unexpected expense, a week&rsquo;s holiday away, keeping the home warm, replacing worn-out clothes or meeting friends for a drink or meal once a month.</li>
        <li><b>Very low work intensity:</b> the adults of working age in the household (18&ndash;64) worked no more than a fifth of the time they could have in the past year.</li>
      </ul>
      It is a survey estimate (EU-SILC), so for small regions it can be several points off. It is not the same as being poor in the everyday sense, nor as receiving welfare.</dd>
    <dt>Region</dt>
    <dd>A NUTS&nbsp;2 region, the EU&rsquo;s standard middle level of statistical regions, usually between 0.8 and 3 million people: a German <i>Regierungsbezirk</i> or small <i>Land</i>, an Italian or Spanish region, a French region as drawn before 2016.</dd>
    <dt>Turnout</dt>
    <dd>Ballots cast as a share of registered voters. Where voting is compulsory (Belgium, Luxembourg) it says little about willingness to vote.</dd>
    <dt>Valid votes</dt>
    <dd>Ballots that count for a list, without blank and spoiled ballots. Party shares are shares of valid votes.</dd>
    <dt>Far right</dt>
    <dd>Parties the PopuList classifies as nativist (the state should belong to the native group, and outsiders threaten it) and authoritarian (a strictly ordered society, with crime and disorder punished severely). It includes both radical-right parties that accept democracy and extreme-right ones that reject it.</dd>
    <dt>Rank correlation (&rho;)</dt>
    <dd>Sort a country&rsquo;s regions by poverty risk and again by turnout (or the far right), then compare the two orders. +1: the poorer the region, the higher the vote, always; &minus;1: always lower; 0: no relation. It uses only the order, so one extreme region cannot dominate it.</dd>
    <dt>90% range</dt>
    <dd>With few regions, &rho; could have come out quite differently by chance. The range shows the values it plausibly takes: if it crosses zero, the country on its own cannot tell whether poorer regions vote more or less.</dd>
    <dt>Trend line</dt>
    <dd>In the country panels, the median of the slopes between every pair of regions (Theil&ndash;Sen), which one unusual region cannot tip. In &ldquo;All countries together&rdquo;, an ordinary least-squares line across the member states.</dd>
    <dt>By chance</dt>
    <dd>If poverty made no difference, each country would lean one way or the other like a coin toss. When far more countries lean the same way than coin tosses would plausibly give (less than a 5% chance), we say it would hardly happen by chance.</dd>
  </dl>
</section>

<section class="foot wrap" aria-label="How this is counted">
  <h2>How this is counted</h2>
  <div>
    <ul>
      <li>Regions are the NUTS&nbsp;2 regions of 2024. Results come by municipality and are added up by region through Eurostat&rsquo;s list of which municipality lies in which region; where a municipality could not be matched, through its district (NUTS&nbsp;3). Votes from abroad belong to no region.</li>
      <li>Turnout is ballots cast divided by registered voters. Voting is compulsory in Belgium and Luxembourg. For Belgium the source cannot place registered voters in regions, so regional turnout is not shown; for Saarland in 2024 the source lists too few registered voters, so its turnout is left out.</li>
      <li>Ireland counts European votes by constituency, which do not match its regions, so it has national figures only. Malta, Cyprus, Estonia, Latvia and Luxembourg are one region each.</li>
      <li>Far right: lists whose party the PopuList&nbsp;4.0 marks as far right in the year of the election, as a share of valid votes. Joint lists count by their first-named party. Parties are matched through Party Facts numbers, and by hand where the numbers are missing or differ; every hand match is listed in the project&rsquo;s data notes.</li>
      <li>Poverty risk (at risk of poverty or social exclusion) is a Eurostat survey estimate for 2024, or the nearest year; for small regions its margin of error is several points. Its income line is 60% of each country&rsquo;s median, so it is best compared within a country.</li>
      <li>Within each country, &rho; is the rank correlation (Spearman) over its regions, each region counted once whatever its size. The line is the median of the slopes between every pair of regions, so one unusual region cannot tip it. Only countries with at least three regions are counted in the figures at the top. Weighting each region by its registered voters instead changes these counts by one or two countries, not what they show. The 90% range of &rho; uses Fisher&rsquo;s z with the Bonett&ndash;Wright standard error; with three regions no range is given. Circle area shows the region&rsquo;s registered voters in 2024 (for Antwerp, where the source has none by region, ballots cast); it is only for reading the charts, and every region still counts once in &rho;, the ranges and the lines. Whether the countries together lean one way more often than chance would give is a two-sided sign test on the direction of &rho;, at 5%. France&rsquo;s overseas regions (Guadeloupe, Martinique, Guyane, La R&eacute;union, Mayotte) are left out of these comparisons; the Canary Islands, the Azores, Madeira, Ceuta and Melilla are counted with Spain and Portugal. Belgium elects its members in separate electoral colleges by language, and the lists counted as far right (Vlaams Belang, N-VA) stand only in the Dutch-speaking one; for the far right, only its five Flemish provinces are compared, not Wallonia and Brussels.</li>
      <li>Poorer regions can be measured two ways (switch at the top). Poverty risk counts the people below a poverty line or unable to afford basic things. Household income is the average net disposable income per inhabitant: all household income after taxes and transfers divided by the population, not a median (Eurostat regional accounts, the latest year with figures for nearly all regions), relative to the region&rsquo;s own country, country&nbsp;=&nbsp;100. The two agree only in part: poverty risk is often highest in big cities, where incomes are high on average.</li>
      <li>Change 2019 to 2024 is the difference in percentage points between the two elections, both counted on the regions of 2024. Far right follows the PopuList&rsquo;s classification in each year, so a party counts from the year it is classified as far right. Turnout changes also reflect other elections held the same day in part of a country.</li>
      <li>The trend in &ldquo;All countries together&rdquo; is a least-squares line across the member states, each counted once; for turnout, Belgium and Luxembourg (compulsory voting) are left out of the line. With household income, regions and countries are placed by income per inhabitant in purchasing power standards, EU27&nbsp;=&nbsp;100 (Eurostat).</li>
      <li>This shows how voting and poverty go together, not that one causes the other: poorer regions also differ in age, in how rural they are, in language and in their regional parties.</li>
      <li>Switzerland is not in the EU and has no European election; its regions show poverty risk only. Swiss votes: <a href="${SWISS_PAGE}">People vs Parliament</a>.</li>
    </ul>
    <p class="credit">Election results: F.&nbsp;Hublet (2024), <a href="https://doi.org/10.5281/zenodo.14569325">BLUE_EP: municipality-level results of European Parliament elections</a>, Groupe d&rsquo;&eacute;tudes g&eacute;opolitiques (CC BY 4.0). Far right: <a href="https://popu-list.org">The PopuList</a> 4.0, M.&nbsp;Rooduijn, A.&nbsp;L.&nbsp;P.&nbsp;Pirro, D.&nbsp;Halikiopoulou, C.&nbsp;Froio, S.&nbsp;van Kessel, S.&nbsp;L.&nbsp;de Lange, C.&nbsp;Mudde and P.&nbsp;Taggart; see <a href="https://doi.org/10.1017/S0007123423000431">British Journal of Political Science 54(3), 2024</a>. Poverty risk: Eurostat, ilc_peps11n. Household income: Eurostat, nama_10r_2hhinc. Municipalities to regions: Eurostat, LAU 2024. Boundaries: &copy; EuroGeographics (GISCO, NUTS 2024). <span id="edv-freshness"></span></p>
  </div>
</section>`;
  // data-header="false": the host page shows its own title, so drop ours (title, label, mark) but keep the intro question
  if (root.dataset.header === 'false') root.querySelectorAll('.masthead h1, .masthead .eyebrow, .masthead .mark').forEach((n) => n.remove());

  // ---------- settings ----------
  // map shading: fixed steps, shared by all regions; opacity steps of one colour per measure
  const MEASURES = {
    p: { key: 'p', ckey: 'cp', short: 'Poverty risk', title: 'At risk of poverty or social exclusion, % of people', cls: 'ink', bins: [12, 16, 20, 25, 30, 40] },
    t: { key: 't24', ckey: 'ct', short: 'Turnout 2024', title: 'Turnout, European election 2024, % of registered voters', cls: 'blue', bins: [30, 40, 50, 60, 70] },
    f: { key: 'f24', ckey: 'cf', short: 'Far right 2024', title: 'Far right, European election 2024, % of valid votes', cls: 'red', bins: [5, 10, 20, 30, 40, 50] },
    // relative to each country, so regions only; darker = poorer, as on the poverty map (title gets the year at load)
    i: { key: 'ii', ckey: null, short: 'Income', title: 'Household income relative to the country, country = 100 (darker: poorer)', cls: 'ink',
      bins: [80, 90, 100, 110, 125], reverse: true, regionsOnly: true },
  };
  // small multiples: the vote measure against poverty risk; dir = the direction the question asks about
  const PMEASURES = {
    t: { key: 't24', ckey: 'ct', noun: 'turnout', short: 'Turnout', cls: 'blue', ymax: 90, ticks: [0, 30, 60, 90], dir: -1,
      axis: 'up: turnout 2024, % of registered voters',
      say: { '-1': 'Poorer regions voted less', 1: 'Poorer regions voted more', 0: 'Little difference' } },
    f: { key: 'f24', ckey: 'cf', noun: 'far-right share', short: 'Far right', cls: 'red', ymax: 75, ticks: [0, 25, 50, 75], dir: 1,
      axis: 'up: far right 2024, % of valid votes',
      say: { 1: 'Poorer regions: more far right', '-1': 'Poorer regions: less far right', 0: 'Little difference' } },
    // change between the two elections, percentage points (regions as of NUTS 2024 for both years)
    dt: { key: 'dt', noun: 'change in turnout', short: 'Turnout change', cls: 'blue', change: true, ymin: -30, ymax: 30, ticks: [-30, -15, 0, 15, 30], dir: -1,
      axis: 'up: change in turnout 2019 to 2024, percentage points',
      say: { '-1': 'Poorer regions fell behind', 1: 'Poorer regions caught up', 0: 'Little difference' } },
    df: { key: 'df', noun: 'change in far-right share', short: 'Far-right change', cls: 'red', change: true, ymin: -15, ymax: 25, ticks: [-10, 0, 10, 20], dir: 1,
      axis: 'up: change in far-right share 2019 to 2024, percentage points',
      say: { 1: 'Far right grew more in poorer regions', '-1': 'Far right grew less in poorer regions', 0: 'Little difference' } },
  };
  // two ways to say which regions are poorer; score: higher = poorer, so rho keeps one meaning
  const POVS = {
    p: { short: 'Poverty risk', axis: 'Across: poverty risk, % of people', sign: 1, val: (r) => r.p, domain: [0, 60],
      ticks: [0, 20, 40, 60], allTicks: [0, 10, 20, 30, 40, 50, 60], last: '%', per: 'points more poverty risk',
      note: 'Poorer regions by poverty risk: the share of people at risk of poverty or social exclusion (Eurostat, 2024).' },
    i: { short: 'Household income', axis: 'Across: household income, country = 100 (poorer to the right)', sign: -1, val: (r) => (r.ii == null ? null : Math.max(45, r.ii)), domain: [195, 45],   // Mayotte (35, overseas, not counted) sits at the edge
      ticks: [150, 100, 50], allTicks: [175, 150, 125, 100, 75, 50], last: '', per: 'points lower household income (country = 100)',
      note: 'Poorer regions by household income: average disposable income per inhabitant (all household income divided by the population), relative to the region’s own country (Eurostat, ' },
  };
  const POV = () => POVS[state.pov];
  const score = (r) => { const v = POV().val(r); return v == null ? null : POV().sign * v; };
  const CUT = 0.2;   // |rho| from which a country counts as showing a difference
  const X_MAX = 60;  // poverty risk axis of the small multiples (highest region: 59.5%)
  // outermost regions: drawn as insets under the map, so the map can stay on Europe
  const OUTER = ['PT20', 'PT30', 'ES70', 'FRY1', 'FRY2', 'FRY3', 'FRY4', 'FRY5'];
  const DROP = new Set(['NO0B']);   // Svalbard and Jan Mayen
  // Shown but not counted when regions are compared within their country (decisions of 6 Nov 2026):
  // France's overseas regions (Caribbean, South America, Indian Ocean), far from Europe and different from
  // the mainland in too many other ways; Spain's and Portugal's islands, Ceuta and Melilla stay in.
  // For the far right in Belgium, Wallonia and Brussels: the lists counted as far right (VB, N-VA) stand
  // only in the Dutch-speaking electoral college, so only the Flemish provinces (BE2x) are compared.
  const OVERSEAS = new Set(['FRY1', 'FRY2', 'FRY3', 'FRY4', 'FRY5']);
  const asideOf = (r, key) => (OVERSEAS.has(r.id) ? 'overseas'
    : (key === 'f24' || key === 'df') && r.cc === 'BE' && !r.id.startsWith('BE2') ? 'college' : null);
  const ASIDE_KEY = { overseas: 'France&rsquo;s overseas regions', college: 'Wallonia and Brussels (far right)' };
  const SHOW_CODE = { EL: 'GR' };   // Eurostat writes Greece EL
  // map extent in ETRS89 / LAEA Europe (EPSG:3035) metres: Iceland and Portugal to Cyprus, Crete to Lapland
  const EXTENT = { type: 'Polygon', coordinates: [[[2560000, 1380000], [6560000, 1380000], [6560000, 5340000], [2560000, 5340000], [2560000, 1380000]]] };
  const OTHER = { NO: 'Norway', IS: 'Iceland', LI: 'Liechtenstein', AL: 'Albania', BA: 'Bosnia and Herzegovina', ME: 'Montenegro',
    MK: 'North Macedonia', RS: 'Serbia', TR: 'Türkiye', XK: 'Kosovo', UA: 'Ukraine', CH: 'Switzerland' };
  const GROUP = { ID: 'Identity and Democracy (to 2024)', PfE: 'Patriots for Europe', ECR: 'European Conservatives and Reformists',
    ESN: 'Europe of Sovereign Nations', EPP: "European People's Party", 'S&D': 'Socialists and Democrats' };
  const NOTE = {
    BE: 'Voting is compulsory in Belgium. The source cannot place registered voters in regions, so regional turnout is not shown.',
    LU: 'Voting is compulsory in Luxembourg.',
    IE: 'Ireland counts European votes by constituency, which do not match its regions: national figures only.',
    CH: 'Not in the EU, so no European election.',
    DEC0: 'Turnout 2024 left out: the source lists too few registered voters for Saarland.',
  };
  const FLAG = { b: 'break in the series', p: 'provisional', e: 'estimated', u: 'low reliability' };

  const f1 = d3.format('.1f');
  const pct = (v) => (v == null ? '–' : f1(v) + '%');
  const num = (v) => (v == null ? '–' : f1(v));
  const signed = (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + d3.format('.2f')(Math.abs(v));
  const WORDS = ['none', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  const words = (n) => WORDS[n] || String(n);
  const state = { measure: 'p', level: 'r', pm: 't', am: 't', pov: 'p', focus: null, pinned: null };
  const STORE = { measure: 'edv-measure', level: 'edv-level', pm: 'edv-pmeasure', am: 'edv-ameasure', pov: 'edv-pov' };
  try {
    const m = localStorage.getItem(STORE.measure); if (MEASURES[m]) state.measure = m;
    const l = localStorage.getItem(STORE.level); if (l === 'r' || l === 'c') state.level = l;
    const p = localStorage.getItem(STORE.pm); if (PMEASURES[p]) state.pm = p;
    const a = localStorage.getItem(STORE.am); if (a === 't' || a === 'f') state.am = a;
    const v = localStorage.getItem(STORE.pov); if (POVS[v]) state.pov = v;
  } catch (e) { /* storage unavailable */ }

  let REGIONS = [], BY_ID = new Map(), COUNT = new Map(), CTRY = new Map(), MAP = null, MAPV = null, ALLV = null;
  const PANELS = new Map();

  // ---------- helpers ----------
  const $ = (sel) => root.querySelector(sel.replace(/#([\w-]+)/g, '#edv-$1'));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  async function getJSON(path, optional) {
    try {
      // GitHub Pages lets caches keep files for 10 minutes; a per-minute marker keeps data fresh
      const r = await fetch(BASE + path + '?m=' + Math.floor(Date.now() / 60000), { cache: 'no-cache' });
      if (!r.ok) throw new Error(r.status + ' ' + r.statusText);
      return await r.json();
    } catch (e) {
      if (optional) return null;
      throw new Error('Could not load ' + BASE + path + ' (' + e.message + ').');
    }
  }

  function onWidth(el, draw) {
    let last = -1;
    const run = () => {
      const w = Math.round(el.clientWidth);
      if (w && w !== last) { last = w; draw(); }
    };
    if ('ResizeObserver' in window) new ResizeObserver(() => requestAnimationFrame(run)).observe(el);
    else window.addEventListener('resize', run);
    run();
    return () => { last = -1; run(); };
  }

  function tooltip(container) {
    const tip = document.createElement('div');
    tip.className = 'tooltip';
    tip.hidden = true;
    tip.setAttribute('role', 'status');
    container.appendChild(tip);
    return {
      show(html, x, y) {
        tip.innerHTML = html;
        tip.hidden = false;
        const cw = container.clientWidth, tw = tip.offsetWidth, th = tip.offsetHeight;
        let left = x + 14;
        if (left + tw > cw) left = Math.max(0, x - tw - 14);
        let top = y - th - 12;
        if (top < 0) top = y + 16;
        tip.style.left = left + 'px';
        tip.style.top = top + 'px';
      },
      hide() { tip.hidden = true; },
    };
  }

  function topoDecode(topo) {
    const t = topo.transform;
    const arcs = topo.arcs.map((arc) => {
      let x = 0, y = 0;
      return arc.map((p) => (t ? [(x += p[0]) * t.scale[0] + t.translate[0], (y += p[1]) * t.scale[1] + t.translate[1]] : p));
    });
    const ring = (ids) => ids.reduce((pts, i, k) => {
      const a = i < 0 ? arcs[~i].slice().reverse() : arcs[i];
      return pts.concat(k ? a.slice(1) : a);
    }, []);
    const geom = (g) => (g.type === 'Polygon' ? { type: 'Polygon', coordinates: g.arcs.map(ring) }
      : g.type === 'MultiPolygon' ? { type: 'MultiPolygon', coordinates: g.arcs.map((p) => p.map(ring)) } : null);
    return (name) => (topo.objects[name] ? topo.objects[name].geometries : [])
      .map((g) => ({ type: 'Feature', id: g.id || (g.properties || {}).id, properties: g.properties || {}, geometry: geom(g) }))
      .filter((f) => f.geometry);
  }
  const fc = (features) => ({ type: 'FeatureCollection', features });

  // seg switch ("bar index"), as on People vs Parliament
  function buildSeg(el, items, key, onPick) {
    el.innerHTML = '';
    items.forEach(([val, label]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.setAttribute('aria-pressed', String(state[key] === val));
      b.addEventListener('click', () => {
        if (state[key] === val) return;
        state[key] = val;
        el.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        try { localStorage.setItem(STORE[key], val); } catch (e) { /* storage unavailable */ }
        onPick();
      });
      el.appendChild(b);
    });
  }

  // ---------- statistics ----------
  function ranks(v) {   // average ranks for ties
    const idx = v.map((x, i) => i).sort((a, b) => v[a] - v[b]);
    const r = new Array(v.length);
    for (let i = 0; i < idx.length;) {
      let j = i;
      while (j + 1 < idx.length && v[idx[j + 1]] === v[idx[i]]) j++;
      for (let k = i; k <= j; k++) r[idx[k]] = (i + j) / 2 + 1;
      i = j + 1;
    }
    return r;
  }
  function spearman(xs, ys) {
    if (xs.length < 3) return null;
    const a = ranks(xs), b = ranks(ys), ma = d3.mean(a), mb = d3.mean(b);
    let n = 0, da = 0, db = 0;
    a.forEach((x, i) => { n += (x - ma) * (b[i] - mb); da += (x - ma) ** 2; db += (b[i] - mb) ** 2; });
    return da && db ? n / Math.sqrt(da * db) : null;
  }
  function theilSen(xs, ys) {   // median of pairwise slopes; robust against one unusual region
    const s = [];
    for (let i = 0; i < xs.length; i++) for (let j = i + 1; j < xs.length; j++) if (xs[j] !== xs[i]) s.push((ys[j] - ys[i]) / (xs[j] - xs[i]));
    if (!s.length) return null;
    const b = d3.median(s);
    return { b, a: d3.median(xs.map((x, i) => ys[i] - b * x)) };
  }
  // 90% range of rho (Fisher z, Bonett-Wright standard error); none with three regions or fewer
  function rhoInterval(rho, n) {
    if (rho == null || n <= 3 || Math.abs(rho) >= 1) return null;
    const z = Math.atanh(rho), se = Math.sqrt((1 + rho * rho / 2) / (n - 3));
    return [Math.tanh(z - 1.645 * se), Math.tanh(z + 1.645 * se)];
  }
  // two-sided sign test: chance of k or more of n countries leaning one way if each were a coin toss
  function signTest(k, n) {
    if (!n) return 1;
    const m = Math.max(k, n - k);
    let p = 0, c = 1;
    for (let i = 0; i <= n; i++) { if (i >= m) p += c; c = c * (n - i) / (i + 1); }
    return Math.min(1, 2 * p / 2 ** n);
  }
  // circle area = registered voters 2024 (ballots cast where the source has no registered voters); every region still counts once in the statistics
  const voters = (r) => r.r ?? r.b ?? null;
  let VMAX = 1;   // largest electorate of any EU region, set once the data is in
  const radiusFor = (rmax) => { const s = d3.scaleSqrt().domain([0, VMAX]).range([0, rmax]); return (r) => Math.max(1.6, s(voters(r) || 0)); };
  const bySize = (a, b) => (voters(b) || 0) - (voters(a) || 0);   // big first, so small circles stay on top
  function sizeKey(rmax, cls) {   // three nested circles: 0.5, 2 and 6 million registered voters
    const r = radiusFor(rmax), vals = [6e6, 2e6, 5e5].map((v) => r({ r: v })), W = 2 * vals[0] + 2;
    return '<svg class="edv-sizekey" width="' + W.toFixed(0) + '" height="' + W.toFixed(0) + '" viewBox="0 0 ' + W.toFixed(1) + ' ' + W.toFixed(1) + '" aria-hidden="true">' +
      vals.map((v) => '<circle class="edv-dot edv-dot--bubble edv-dot--' + cls + '" cx="' + (W / 2).toFixed(1) + '" cy="' + (W - 1 - v).toFixed(1) + '" r="' + v.toFixed(1) + '"/>').join('') +
      '</svg>Area: registered voters (0.5, 2 and 6 million)';
  }
  // judged on rho as shown (two decimals), so the label and the printed value always agree
  const verdict = (rho) => { if (rho == null) return null; const r = Math.round(rho * 100) / 100; return r <= -CUT ? -1 : r >= CUT ? 1 : 0; };

  // per country: its regions with poverty risk and the vote measure
  function countryStats(key) {
    return d3.groups(REGIONS.filter((r) => r.eu), (r) => r.cc).map(([cc, rows]) => {
      const X = POV().val;
      const all = rows.filter((r) => X(r) != null && r[key] != null);
      const pts = all.filter((r) => !asideOf(r, key)), aside = all.filter((r) => asideOf(r, key));
      const rho = spearman(pts.map(score), pts.map((r) => r[key]));
      return { cc, name: rows[0].country, regions: rows.filter((r) => !asideOf(r, key)).length, compulsory: rows[0].compulsory,
        pts, aside, rho, v: verdict(rho), ci: rhoInterval(rho, pts.length),
        get clear() { return !!this.ci && (this.ci[0] > 0 || this.ci[1] < 0); },
        line: pts.length >= 3 ? theilSen(pts.map(X), pts.map((r) => r[key])) : null };
    });
  }

  // ---------- headline ----------
  function renderHero() {
    const tally = (key) => {
      const s = countryStats(key).filter((c) => c.pts.length >= 3 && !(key === 't24' && c.compulsory));
      const signs = s.filter((c) => c.rho != null && c.rho !== 0), neg = signs.filter((c) => c.rho < 0).length;
      return { n: s.length, less: s.filter((c) => c.v === -1).length, more: s.filter((c) => c.v === 1).length, flat: s.filter((c) => c.v === 0).length,
        clear: s.filter((c) => c.clear).length, chance: signTest(neg, signs.length) >= 0.05 };
    };
    const certainty = (c) => ' Clear on its own in ' + (c.clear ? words(c.clear) : 'none') + ' of the ' + words(c.n) + '; most countries have too few regions to tell. ' +
      (c.chance ? 'Taken together, they lean one way no more often than chance would give.' : 'Together, though, so many pointing the same way would hardly happen by chance.');
    const t = tally('t24'), f = tally('f24');
    $('#hero-t').innerHTML = t.less + '<small> of ' + t.n + '</small>';
    $('#hero-t-text').textContent = 'countries where the poorer regions turned out less in the 2024 European election. ' +
      (t.more ? 'In ' + words(t.more) + ' they turned out more.' : 'In none did they turn out more.') + certainty(t);
    $('#hero-f').innerHTML = f.more + '<small> of ' + f.n + '</small>';
    const common = f.more >= 0.75 * f.n;
    $('#hero-f-text').textContent = 'countries where the poorer regions gave the far right more of their votes. ' +
      'In ' + words(f.less) + ' they gave it less' + (f.flat ? ', in ' + words(f.flat) + ' there was little difference' : '') +
      (common ? '.' : ': no common pattern.') + certainty(f);
  }

  // ---------- map ----------
  const nBins = (M) => M.bins.length + 1;
  const binOf = (v, M) => d3.bisectRight(M.bins, v);
  const opOf = (i, M) => +(0.16 + (0.84 * (M.reverse ? nBins(M) - 1 - i : i)) / (nBins(M) - 1)).toFixed(3);

  function drawLegend() {
    const M = MEASURES[state.measure], el = $('#legend'), n = nBins(M);
    const W = Math.max(220, Math.min(el.clientWidth || 360, 420)), bw = (W - 2) / n, h = 12;
    let svg = '<svg width="' + W + '" height="' + (h + 18) + '" viewBox="0 0 ' + W + ' ' + (h + 18) + '" aria-hidden="true">';
    for (let i = 0; i < n; i++) {
      svg += '<rect class="edv-c--' + M.cls + '" x="' + (1 + i * bw).toFixed(1) + '" y="0" width="' + (bw - 1.5).toFixed(1) +
        '" height="' + h + '" fill-opacity="' + opOf(i, M) + '"/>';
    }
    M.bins.forEach((b, i) => { svg += '<text x="' + (1 + (i + 1) * bw - 0.75).toFixed(1) + '" y="' + (h + 14) + '" text-anchor="middle">' + b + '</text>'; });
    svg += '</svg>';
    el.innerHTML = '<p class="edv-legend__title">' + esc(M.title) + '</p>' + svg +
      '<p class="edv-key"><span><i class="edv-sw edv-sw--none"></i>No figure</span><span><i class="edv-sw edv-sw--out"></i>Not in the EU' +
      (state.measure === 'p' ? ' (Switzerland: poverty risk only)' : '') + '</span></p>';
    el.setAttribute('aria-label', M.title + ': steps ' + M.bins.join(', ') + '.');
  }

  // a region (level 'r') or a whole country (level 'c', its national figures)
  function valueOf(f, M, level) {
    const d = level === 'c' ? CTRY.get(f.properties.id) : BY_ID.get(f.properties.id);
    return d ? { d, v: d[level === 'c' ? M.ckey : M.key] } : null;
  }
  function shade(sel, level) {
    const M = MEASURES[state.measure];
    sel.attr('class', (f) => {
      const o = valueOf(f, M, level);
      if (!o) return 'edv-rg edv-rg--out';
      if (o.v == null) return o.d.eu || M.key === 'p' ? 'edv-rg edv-rg--none' : 'edv-rg edv-rg--out';
      return 'edv-rg edv-c--' + M.cls;
    }).attr('fill-opacity', (f) => {
      const o = valueOf(f, M, level);
      return o && o.v != null ? opOf(binOf(o.v, M), M) : null;
    });
  }

  function trow(label, v, c, single) {
    return '<tr><th>' + label + '</th><td>' + pct(v) + '</td>' + (single ? '' : '<td>' + pct(c) + '</td>') + '</tr>';
  }
  function regionTip(id) {
    const r = BY_ID.get(id);
    if (!r) {
      const f = MAP.byId.get(id), cc = f ? f.properties.cc : '';
      return '<p class="tt__meta">' + esc(OTHER[cc] || cc) + '</p><p class="tt__title">' + esc(f ? f.properties.name : id) +
        '</p><p class="tt__note">Not in the EU: no European election, no figures here.</p>';
    }
    const single = COUNT.get(r.cc) === 1;
    let html = '<p class="tt__meta">' + esc(r.country) + ' · ' + esc(r.id) + '</p><p class="tt__title">' + esc(r.name) + '</p>' +
      '<table class="tt__tab"><thead><tr><th></th><th>Region</th>' + (single ? '' : '<th>' + esc(r.country) + '</th>') + '</tr></thead><tbody>' +
      trow('Poverty risk' + (r.py && r.py !== 2024 ? ' ' + r.py : ''), r.p, r.cp, single);
    if (r.ii != null) {
      html += '<tr><th>Income ' + r.iy + ', country = 100</th><td>' + f1(r.ii).replace('.0', '') + '</td>' + (single ? '' : '<td>100</td>') + '</tr>';
    }
    if (r.eu) {
      html += trow('Turnout 2024', r.t24, r.ct, single) + trow('Far right 2024', r.f24, r.cf, single) +
        '<tr class="tt__sub"><th>2019: turnout</th><td>' + pct(r.t19) + '</td>' + (single ? '' : '<td></td>') + '</tr>' +
        '<tr class="tt__sub"><th>2019: far right</th><td>' + pct(r.f19) + '</td>' + (single ? '' : '<td></td>') + '</tr>';
    }
    html += '</tbody></table>';
    const notes = [];
    if (r.b) notes.push(d3.format(',')(r.b) + ' ballots cast in 2024.');
    if (r.pflag && FLAG[r.pflag]) notes.push('Poverty risk: ' + FLAG[r.pflag] + '.');
    if (r.p == null) notes.push('No poverty figure for this region.');
    if (asideOf(r, 't24') === 'overseas') notes.push('Overseas region: not counted when the regions of ' + r.country + ' are compared.');
    if (asideOf(r, 'f24') === 'college') notes.push('Not counted when Belgium’s regions are compared for the far right: the lists counted as far right stand only in the Dutch-speaking electoral college.');
    [r.id, r.cc].forEach((k) => { if (NOTE[k]) notes.push(NOTE[k]); });
    if (notes.length) html += '<p class="tt__note">' + notes.map(esc).join(' ') + '</p>';
    return html;
  }
  function countryTip(cc) {
    const c = CTRY.get(cc);
    if (!c) {
      return '<p class="tt__meta">Not in the EU</p><p class="tt__title">' + esc(OTHER[cc] || cc) +
        '</p><p class="tt__note">No European election, no figures here.</p>';
    }
    // beside each national figure, the lowest and highest of its regions
    const regs = REGIONS.filter((r) => r.cc === cc), many = c.eu && regs.length > 1;
    const span = (k, fmt, unit) => {
      const v = regs.map((r) => r[k]).filter((x) => x != null);
      return v.length > 1 ? fmt(d3.min(v)) + '–' + fmt(d3.max(v)) + unit : '–';
    };
    const whole = (v) => (v == null ? '–' : String(Math.round(v)));
    const rows = [['Poverty risk', pct(c.cp), span('p', f1, '%')]];
    if (c.cie != null) rows.push(['Income, EU = 100', whole(c.cie), span('ie', whole, '')]);
    if (c.eu) rows.push(['Turnout 2024', pct(c.ct), span('t24', f1, '%')], ['Far right 2024', pct(c.cf), span('f24', f1, '%')]);
    let html = '<p class="tt__meta">' + (c.eu ? 'Country' + (many ? '' : ' · 1 region') : 'Not in the EU') + '</p>' +
      '<p class="tt__title">' + esc(c.name) + '</p><table class="tt__tab">' +
      (many ? '<thead><tr><th></th><th>Country</th><th>' + regs.length + ' regions</th></tr></thead>' : '') + '<tbody>' +
      rows.map((r) => '<tr><th>' + r[0] + '</th><td>' + r[1] + '</td>' + (many ? '<td>' + r[2] + '</td>' : '') + '</tr>').join('') +
      '</tbody></table>';
    const notes = [];
    if (c.cc === 'BE' || c.cc === 'IE') notes.push(NOTE[c.cc]);
    else if (c.compulsory) notes.push('Voting is compulsory in ' + c.name + '.');
    if (!c.eu) notes.push(NOTE.CH);
    if (c.eu && c.cp == null) notes.push('No national poverty figure for the survey year.');
    if (c.eu && c.ct == null) notes.push('National results not available here yet.');
    if (notes.length) html += '<p class="tt__note">' + notes.map(esc).join(' ') + '</p>';
    return html;
  }
  function statusText(id) {
    const r = BY_ID.get(id), c = CTRY.get(id);
    if (!r && c) {
      return c.name + ': poverty risk ' + pct(c.cp) + (c.eu ? ', turnout ' + pct(c.ct) + ', far right ' + pct(c.cf) + ' in 2024.' : '.');
    }
    if (!r) return 'Hover or tap the map for details; tap again to let go.';
    return r.name + ' (' + r.country + '): poverty risk ' + pct(r.p) + (r.ii != null ? ', income ' + f1(r.ii) + ' (country = 100)' : '') +
      (r.eu ? ', turnout ' + pct(r.t24) + ', far right ' + pct(r.f24) + ' in 2024.' : '.');
  }

  // fit an inset to the islands that matter: drop specks under 3% of the largest island's area
  function mainIslands(f) {
    if (f.geometry.type !== 'MultiPolygon') return f;
    const area = d3.geoPath(d3.geoIdentity()).area;
    const parts = f.geometry.coordinates.map((c) => ({ c, a: area({ type: 'Polygon', coordinates: c }) }));
    const big = d3.max(parts, (p) => p.a);
    return { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: parts.filter((p) => p.a >= 0.03 * big).map((p) => p.c) } };
  }

  function drawMap(el) {
    const W = Math.round(el.clientWidth);
    if (!W || !MAP) return;
    el.querySelectorAll('svg, .edv-insets, p.note').forEach((x) => x.remove());
    const tip = el._tip || (el._tip = tooltip(el));
    tip.hide();
    const proj = d3.geoIdentity().reflectY(true).fitWidth(W, EXTENT);
    const path = d3.geoPath(proj);
    const H = Math.round(path.bounds(EXTENT)[1][1]);
    const M = MEASURES[state.measure], level = M.regionsOnly ? 'r' : state.level;
    const svg = d3.select(el).insert('svg', ':first-child')
      .attr('width', W).attr('height', H).attr('viewBox', '0 0 ' + W + ' ' + H)
      .attr('class', W < 600 ? 'edv-mapsvg edv-mapsvg--small' : 'edv-mapsvg')
      .attr('role', 'img')
      .attr('aria-label', (level === 'c' ? 'Map of the EU member states' : 'Map of ' + MAP.dataCount + ' European regions') +
        ', shaded by ' + M.title.toLowerCase() + '. Darker means more. Use the search box above or the table below to read one region.');
    svg.append('clipPath').attr('id', 'edv-clip').append('rect').attr('width', W).attr('height', H);
    const g = svg.append('g').attr('clip-path', 'url(#edv-clip)');
    const regs = g.append('g').selectAll('path').data(level === 'c' ? MAP.countryFeats : MAP.main).join('path').attr('d', path);
    shade(regs, level);
    g.append('path').datum(MAP.countries).attr('class', 'edv-border').attr('d', path);
    const hl = g.append('path').attr('class', 'edv-hl');

    // outermost regions, each fitted into its own small box (regions only)
    const box = W < 520 ? 54 : 70;
    const ins = d3.select(el).append('div').attr('class', 'edv-insets');
    const insets = new Map();
    (level === 'r' ? MAP.outer : []).forEach((f) => {
      const fig = ins.append('figure').attr('class', 'edv-inset');
      const p = d3.geoPath(d3.geoIdentity().reflectY(true).fitExtent([[5, 5], [box - 5, box - 5]], mainIslands(f)));
      const s = fig.append('svg').attr('width', box).attr('height', box).attr('viewBox', '0 0 ' + box + ' ' + box).attr('aria-hidden', 'true');
      const rp = s.append('path').datum(f).attr('d', p);
      shade(rp, 'r');
      rp.attr('stroke-opacity', rp.attr('fill-opacity'));   // a hairline in the fill colour keeps small islands visible
      fig.append('figcaption').text(f.properties.name.replace(/^Região Autónoma dos /, '').replace(/^Região Autónoma da /, ''));
      insets.set(f.properties.id, { fig: fig.node(), path: rp, p });
    });

    MAPV = {
      mark(id, xy) {
        // on the country map a region marks its country
        const key = id == null ? null : level === 'c' && BY_ID.has(id) ? BY_ID.get(id).cc : id;
        const f = key == null ? null : level === 'c' ? MAP.countryById.get(key) : MAP.byId.get(key);
        const inMain = f && !insets.has(key);
        hl.attr('d', inMain ? path(f) : null);
        insets.forEach((v, k) => v.path.classed('edv-hl-in', k === key));
        if (!f) { tip.hide(); return; }
        let pos = xy;
        if (!pos) {
          if (inMain) {
            pos = path.centroid(level === 'c' && MAP.byId.has(id) ? MAP.byId.get(id) : f);
            pos = [Math.max(0, Math.min(W, pos[0])), Math.max(0, Math.min(H, pos[1]))];
          } else {
            const v = insets.get(key), a = el.getBoundingClientRect(), b = v.fig.getBoundingClientRect();
            pos = [b.left - a.left + box / 2, b.top - a.top + box / 2];
          }
        }
        tip.show(level === 'c' ? countryTip(key) : regionTip(key), pos[0], pos[1]);
      },
    };
    const idOf = (ev) => { const f = d3.select(ev.target).datum(); return f && f.properties ? f.properties.id : null; };
    const bind = (sel) => sel
      .on('pointermove', (ev) => { if (state.pinned == null) { const id = idOf(ev); if (id) focus(id, d3.pointer(ev, el)); } })
      .on('pointerleave', () => { if (state.pinned == null) focus(null); })
      .on('click', (ev) => {
        const id = idOf(ev);
        if (!id) return;
        state.pinned = state.pinned === id ? null : id;
        focus(state.pinned, d3.pointer(ev, el));
      });
    bind(regs);
    insets.forEach((v) => bind(v.path));
    if (state.focus != null) focus(state.focus);
  }

  function focus(id, xy) {
    state.focus = id;
    if (MAPV) MAPV.mark(id, xy);
    if (ALLV) ALLV.mark(id);
    PANELS.forEach((p) => p.mark(id));
    $('#map-status').textContent = statusText(id);
  }

  function initFind() {
    const input = $('#find'), list = $('#find-list');
    const label = (r) => r.name + ', ' + r.country;
    const byLabel = new Map(REGIONS.map((r) => [label(r).toLowerCase(), r]));
    const byName = d3.group(REGIONS, (r) => r.name.toLowerCase());
    list.innerHTML = REGIONS.slice().sort((a, b) => d3.ascending(a.name, b.name)).map((r) => '<option value="' + esc(label(r)) + '"></option>').join('');
    const pick = () => {
      const q = input.value.trim().toLowerCase();
      const r = byLabel.get(q) || ((byName.get(q) || []).length === 1 ? byName.get(q)[0] : null);
      if (!r) return;
      state.pinned = r.id;
      focus(r.id);
    };
    input.addEventListener('change', pick);
    input.addEventListener('input', pick);
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') { input.value = ''; state.pinned = null; focus(null); }
    });
  }

  function renderTable() {
    const d = $('#table');
    if (!d.open) return;
    d.querySelector('tbody').innerHTML = REGIONS.slice()
      .sort((a, b) => d3.ascending(a.country, b.country) || d3.ascending(a.name, b.name))
      .map((r) => '<tr><td>' + esc(r.name) + '</td><td>' + esc(r.country) + '</td><td class="num">' + num(r.p) + '</td><td class="num">' + num(r.ii) + '</td><td class="num">' +
        num(r.t19) + '</td><td class="num">' + num(r.t24) + '</td><td class="num">' + num(r.f19) + '</td><td class="num">' + num(r.f24) + '</td></tr>')
      .join('');
  }

  // ---------- all countries together ----------
  function ols(xs, ys) {
    const mx = d3.mean(xs), my = d3.mean(ys);
    let n = 0, d = 0;
    xs.forEach((x, i) => { n += (x - mx) * (ys[i] - my); d += (x - mx) ** 2; });
    const b = d ? n / d : 0;
    return { b, a: my - b * mx };
  }

  // all EU regions faintly in the background; the countries carry the picture and the trend line.
  // x must be comparable across countries: poverty risk (%), or income in purchasing power, EU27 = 100.
  const ALLX = {
    p: { region: (r) => r.p, country: (c) => c.cp, sign: 1, domain: [0, 60], ticks: [0, 10, 20, 30, 40, 50, 60], last: '%',
      axis: 'Across: poverty risk, % of people', per: 'points more poverty risk' },
    i: { region: (r) => (r.ie == null ? null : Math.max(30, r.ie)), country: (c) => c.cie, sign: -1, domain: [160, 30],
      ticks: [150, 125, 100, 75, 50], last: '', axis: 'Across: household income in purchasing power, EU = 100 (poorer to the right)',
      per: 'points lower household income (EU = 100)' },
  };
  function drawAll(el) {
    const W = Math.round(el.clientWidth);
    if (!W) return;
    el.querySelectorAll('svg').forEach((n) => n.remove());
    const tip = el._tip || (el._tip = tooltip(el));
    tip.hide();
    const P = PMEASURES[state.am], small = W < 520, turnout = P.key === 't24';
    const A = ALLX[state.pov], XR = A.region, XC = A.country;
    const H = Math.round(Math.max(260, Math.min(W * 0.62, 520)));
    const m = { t: 12, r: 14, b: 30, l: small ? 28 : 34 };
    const x = d3.scaleLinear().domain(A.domain).range([m.l, W - m.r]);
    const y = d3.scaleLinear().domain([0, P.ymax]).range([H - m.b, m.t]);
    const regs = REGIONS.filter((r) => r.eu && XR(r) != null && r[P.key] != null);
    const ctry = [...CTRY.values()].filter((c) => c.eu && XC(c) != null && c[P.ckey] != null);
    const counted = ctry.filter((c) => !(turnout && c.compulsory));   // compulsory voting: not in the turnout line
    const line = ols(counted.map(XC), counted.map((c) => c[P.ckey]));
    const rhoC = spearman(counted.map((c) => A.sign * XC(c)), counted.map((c) => c[P.ckey]));

    const svg = d3.select(el).insert('svg', ':first-child').attr('width', W).attr('height', H).attr('viewBox', '0 0 ' + W + ' ' + H)
      .attr('role', 'img').attr('aria-label', 'Scatter of ' + ctry.length + ' EU countries, with their regions faintly behind: ' +
        A.axis.replace('Across: ', '').toLowerCase() + ' across, ' + P.noun + ' up. Trend across countries: ' +
        (A.sign * line.b < 0 ? 'poorer countries lower' : 'poorer countries higher') + ', rank correlation ' + signed(rhoC) + '.');
    const g = svg.append('g').attr('class', 'grid');
    g.selectAll('line.h').data(P.ticks).join('line').attr('class', 'h')
      .attr('x1', m.l).attr('x2', W - m.r).attr('y1', (d) => Math.round(y(d)) + 0.5).attr('y2', (d) => Math.round(y(d)) + 0.5);
    g.selectAll('line.v').data(A.ticks).join('line').attr('class', 'v')
      .attr('y1', m.t).attr('y2', H - m.b).attr('x1', (d) => Math.round(x(d)) + 0.5).attr('x2', (d) => Math.round(x(d)) + 0.5);
    svg.append('g').selectAll('text').data(P.ticks).join('text').attr('class', 'tick')
      .attr('x', m.l - 6).attr('y', (d) => y(d)).attr('dy', '0.32em').attr('text-anchor', 'end').text((d) => d);
    svg.append('g').selectAll('text').data(A.ticks).join('text').attr('class', 'tick')
      .attr('x', (d) => x(d)).attr('y', H - m.b + 16).attr('text-anchor', (d, i) => (i === A.ticks.length - 1 ? 'end' : 'middle'))
      .text((d, i) => (i === A.ticks.length - 1 ? d + A.last : d));

    // regions: small, faint, behind everything
    const rr = small ? 2 : 2.6;
    svg.append('g').selectAll('circle').data(regs).join('circle').attr('class', 'edv-dot edv-dot--bg edv-dot--' + P.cls)
      .attr('r', rr).attr('cx', (r) => x(XR(r))).attr('cy', (r) => y(r[P.key]));

    const [x0, x1] = d3.extent(counted, XC);
    svg.append('line').attr('class', 'edv-trend')
      .attr('x1', x(x0)).attr('x2', x(x1)).attr('y1', y(line.a + line.b * x0)).attr('y2', y(line.a + line.b * x1));

    // countries: squares in the vote colour, labelled where a label fits
    const sq = small ? 9 : 12;
    const sqClass = (c) => 'edv-ctry edv-ctry--' + P.cls + (turnout && c.compulsory ? ' edv-ctry--aside' : '');
    svg.append('g').selectAll('rect').data(ctry).join('rect').attr('class', sqClass)
      .attr('width', sq).attr('height', sq).attr('rx', 1.5).attr('x', (c) => x(XC(c)) - sq / 2).attr('y', (c) => y(c[P.ckey]) - sq / 2);
    const taken = ctry.map((c) => ({ x0: x(XC(c)) - sq / 2, x1: x(XC(c)) + sq / 2, y0: y(c[P.ckey]) - sq / 2, y1: y(c[P.ckey]) + sq / 2 }));
    const labels = [];
    ctry.slice().sort((a, b) => a[P.ckey] - b[P.ckey]).forEach((c) => {
      const code = SHOW_CODE[c.cc] || c.cc, w = code.length * 7 + 2, h = 12;
      const cx = x(XC(c)), cy = y(c[P.ckey]);
      const cands = [[cx + sq / 2 + 3, cy - h / 2], [cx - sq / 2 - 3 - w, cy - h / 2], [cx - w / 2, cy - sq / 2 - 2 - h], [cx - w / 2, cy + sq / 2 + 2]];
      for (const [bx, by] of cands) {
        const b = { x0: bx, x1: bx + w, y0: by, y1: by + h };
        if (b.x0 < m.l || b.x1 > W - m.r || b.y0 < 0 || b.y1 > H - m.b) continue;
        if (taken.some((t) => !(b.x1 < t.x0 || b.x0 > t.x1 || b.y1 < t.y0 || b.y0 > t.y1))) continue;
        taken.push(b);
        labels.push({ cc: c.cc, code, x: bx + w / 2, y: by + h - 2 });
        break;
      }
    });
    svg.append('g').selectAll('text').data(labels).join('text').attr('class', 'edv-ctry-label')
      .attr('x', (l) => l.x).attr('y', (l) => l.y).attr('text-anchor', 'middle').text((l) => l.code);

    // hovering a country: its regions and its square are redrawn on top, everything else steps back
    const front = svg.append('g').attr('class', 'edv-front');
    const frontDots = front.append('g'), frontSq = front.append('g');
    const ring = svg.append('circle').attr('class', 'focus-ring').attr('r', rr + 3).attr('visibility', 'hidden');
    const ringSq = svg.append('rect').attr('class', 'focus-ring').attr('width', sq + 6).attr('height', sq + 6).attr('visibility', 'hidden');
    const show = (d, isCountry) => {
      const a = el.getBoundingClientRect(), b = svg.node().getBoundingClientRect();
      const px = isCountry ? x(XC(d)) : x(XR(d)), py = isCountry ? y(d[P.ckey]) : y(d[P.key]);
      tip.show(isCountry ? countryTip(d.cc) : regionTip(d.id), b.left - a.left + px, b.top - a.top + py);
    };
    const mark = (id) => {
      const r = regs.find((d) => d.id === id), c = !r && id ? ctry.find((d) => d.cc === id) : null;
      ring.attr('visibility', r ? 'visible' : 'hidden');
      if (r) ring.attr('cx', x(XR(r))).attr('cy', y(r[P.key]));
      ringSq.attr('visibility', c ? 'visible' : 'hidden');
      if (c) ringSq.attr('x', x(XC(c)) - sq / 2 - 3).attr('y', y(c[P.ckey]) - sq / 2 - 3);
      svg.classed('has-ctry', !!c);
      frontDots.selectAll('circle').data(c ? regs.filter((d) => d.cc === c.cc) : []).join('circle')
        .attr('class', 'edv-dot edv-dot--' + P.cls).attr('r', rr + 1).attr('cx', (d) => x(XR(d))).attr('cy', (d) => y(d[P.key]));
      frontSq.selectAll('rect').data(c ? [c] : []).join('rect').attr('class', sqClass).attr('width', sq).attr('height', sq).attr('rx', 1.5)
        .attr('x', (d) => x(XC(d)) - sq / 2).attr('y', (d) => y(d[P.ckey]) - sq / 2);
      const l = c && labels.find((d) => d.cc === c.cc), code = c && (SHOW_CODE[c.cc] || c.cc);
      const lx = c && (l ? l.x : x(XC(c)) + sq / 2 + 3 + code.length * 3.5 + 1), ly = c && (l ? l.y : y(c[P.ckey]) + 4);
      frontSq.selectAll('text').data(c ? [code] : []).join('text').attr('class', 'edv-ctry-label').attr('text-anchor', 'middle')
        .attr('x', lx).attr('y', ly).text((d) => d);
    };
    ALLV = { mark };
    svg.append('rect').attr('class', 'overlay').attr('width', W).attr('height', H).attr('aria-hidden', 'true')
      .on('pointermove pointerdown', (ev) => {
        const [px, py] = d3.pointer(ev);
        let best = null, bd = 16, isC = false;
        ctry.forEach((c) => { const dd = Math.hypot(x(XC(c)) - px, y(c[P.ckey]) - py); if (dd < bd) { bd = dd; best = c; isC = true; } });
        if (!best) { bd = 8; regs.forEach((r) => { const dd = Math.hypot(x(XR(r)) - px, y(r[P.key]) - py); if (dd < bd) { bd = dd; best = r; } }); }
        if (best) { mark(isC ? best.cc : best.id); show(best, isC); } else { tip.hide(); mark(state.focus); }
      })
      .on('pointerleave', () => { tip.hide(); mark(state.focus); });
    if (state.focus != null) mark(state.focus);

    $('#all-axes').innerHTML = '<span>' + esc(A.axis) + '</span><span>' + esc(P.axis[0].toUpperCase() + P.axis.slice(1)) + '</span>' +
      '<span><i class="edv-sw edv-sw--ctry edv-sw--ctry-' + P.cls + '"></i>Country</span><span><i class="edv-sw edv-sw--bg edv-sw--' + P.cls + '"></i>Its regions, in the background</span>';
    const effect = A.sign * line.b * 10;   // per 10 points poorer
    const missing = [...CTRY.values()].filter((c) => c.eu && !ctry.includes(c)).map((c) => c.name).sort();
    $('#all-note').textContent = 'Trend across ' + counted.length + ' countries: 10 ' + A.per + ' go with ' +
      f1(Math.abs(effect)) + ' points ' + (effect < 0 ? 'lower ' : 'higher ') + P.noun + '. Rank correlation across countries: ρ ' + signed(rhoC) + '.' +
      (turnout ? ' Belgium and Luxembourg (compulsory voting, hollow) are not counted in the line.' : '') +
      (missing.length ? ' Without a national figure: ' + missing.join(', ') + '.' : '');
  }

  // ---------- small multiples ----------
  function drawPanels(el) {
    const W = Math.round(el.clientWidth);
    if (!W) return;
    const tip = el._tip || (el._tip = tooltip(el));
    tip.hide();
    const P = PMEASURES[state.pm];
    const cols = W >= 860 ? 4 : W >= 560 ? 3 : 2, gap = W < 480 ? 14 : 22;
    el.style.gridTemplateColumns = 'repeat(' + cols + ', minmax(0, 1fr))';
    el.style.columnGap = gap + 'px';
    const pw = Math.floor((W - gap * (cols - 1)) / cols), small = pw < 200;
    const ph = Math.round(pw * 0.68);
    const m = { t: 8, r: 8, b: 18, l: small ? 20 : 24 };
    const V = POV(), X = V.val;
    const x = d3.scaleLinear().domain(V.domain).range([m.l, pw - m.r]);
    const ymin = P.ymin || 0;
    const y = d3.scaleLinear().domain([ymin, P.ymax]).range([ph - m.b, m.t]);
    const tickText = (d) => (P.change && d > 0 ? '+' + d : d < 0 ? '−' + Math.abs(d) : String(d));
    const order = (a, b) => (a.rho == null) - (b.rho == null) || (P.dir < 0 ? a.rho - b.rho : b.rho - a.rho) || d3.ascending(a.name, b.name);
    const list = countryStats(P.key).filter((c) => c.pts.length >= 2).sort(order);
    el.querySelectorAll('.edv-panel').forEach((n) => n.remove());
    PANELS.clear();
    const RMAX_PANEL = small ? 7 : 9, rad = radiusFor(RMAX_PANEL);
    list.forEach((c) => {
      const div = document.createElement('div');
      div.className = 'edv-panel';
      const say = c.rho == null ? 'Two regions only' : P.say[c.v];
      const range = c.rho == null ? '' : '<span>' + c.pts.length + ' regions</span> · <span>' + (c.ci ? '90%: ' + signed(c.ci[0]) + ' to ' + signed(c.ci[1]) : 'too few to tell') + '</span>';
      div.innerHTML = '<p class="edv-panel__name">' + esc(c.name) + '</p><p class="edv-panel__say' + (c.v === P.dir && c.clear ? ' is-dir' : '') +
        (c.rho != null && !c.clear ? ' is-unsure' : '') + '">' +
        esc(say) + (c.rho == null ? '' : ' <span>ρ ' + signed(c.rho) + '</span>') + '</p>' +
        (range ? '<p class="edv-panel__range">' + range + '</p>' : '');
      el.appendChild(div);
      const svg = d3.select(div).append('svg').attr('width', pw).attr('height', ph).attr('viewBox', '0 0 ' + pw + ' ' + ph)
        .attr('role', 'img').attr('aria-label', c.name + ', ' + c.pts.length + ' regions: ' + say + (c.rho == null ? '' : ' (rho ' + signed(c.rho) + ', ' + (c.ci ? '90% range ' + signed(c.ci[0]) + ' to ' + signed(c.ci[1]) + (c.clear ? '' : ', not clear on its own') : 'too few regions to tell') + ')') + '.' +
          (c.aside.length ? ' Not counted: ' + c.aside.map((r) => r.name).join(', ') + '.' : ''));
      const g = svg.append('g').attr('class', 'grid');
      g.selectAll('line.h').data(P.ticks).join('line').attr('class', (d) => (P.change && d === 0 ? 'h edv-zero' : 'h'))
        .attr('x1', m.l).attr('x2', pw - m.r).attr('y1', (d) => Math.round(y(d)) + 0.5).attr('y2', (d) => Math.round(y(d)) + 0.5);
      g.selectAll('line.v').data(V.ticks).join('line').attr('class', 'v')
        .attr('y1', m.t).attr('y2', ph - m.b).attr('x1', (d) => Math.round(x(d)) + 0.5).attr('x2', (d) => Math.round(x(d)) + 0.5);
      svg.append('g').selectAll('text').data(P.ticks).join('text').attr('class', 'tick')
        .attr('x', m.l - 5).attr('y', (d) => y(d)).attr('dy', '0.32em').attr('text-anchor', 'end').text(tickText);
      svg.append('g').selectAll('text').data(V.ticks).join('text').attr('class', 'tick')
        .attr('x', (d) => x(d)).attr('y', ph - m.b + 13).attr('text-anchor', (d, i) => (i === V.ticks.length - 1 ? 'end' : 'middle'))
        .text((d, i) => (i === V.ticks.length - 1 ? d + V.last : d));
      if (c.line) {
        const [x0, x1] = d3.extent(c.pts, X);
        const clampY = (v) => Math.max(ymin, Math.min(P.ymax, v));
        svg.append('line').attr('class', 'edv-trend' + (c.clear ? '' : ' edv-trend--unsure'))
          .attr('x1', x(x0)).attr('x2', x(x1)).attr('y1', y(clampY(c.line.a + c.line.b * x0))).attr('y2', y(clampY(c.line.a + c.line.b * x1)));
      }
      svg.append('g').selectAll('circle').data(c.aside.slice().sort(bySize)).join('circle')   // shown, not counted
        .attr('class', 'edv-dot edv-dot--aside edv-dot--' + P.cls).attr('r', rad).attr('cx', (r) => x(X(r))).attr('cy', (r) => y(r[P.key]));
      svg.append('g').selectAll('circle').data(c.pts.slice().sort(bySize)).join('circle')
        .attr('class', 'edv-dot edv-dot--bubble edv-dot--' + P.cls).attr('r', rad).attr('cx', (r) => x(X(r))).attr('cy', (r) => y(r[P.key]));
      const ring = svg.append('circle').attr('class', 'focus-ring').attr('visibility', 'hidden');
      const mark = (id, show) => {
        const r = c.pts.find((d) => d.id === id) || c.aside.find((d) => d.id === id);
        if (!r) { ring.attr('visibility', 'hidden'); return; }
        ring.attr('cx', x(X(r))).attr('cy', y(r[P.key])).attr('r', rad(r) + 3).attr('visibility', 'visible');
        if (show) {
          const a = el.getBoundingClientRect(), b = svg.node().getBoundingClientRect();
          tip.show(regionTip(r.id), b.left - a.left + x(X(r)), b.top - a.top + y(r[P.key]));
        }
      };
      PANELS.set(c.cc, { mark: (id) => mark(id, false) });
      svg.append('rect').attr('class', 'overlay').attr('width', pw).attr('height', ph).attr('aria-hidden', 'true')
        .on('pointermove pointerdown', (ev) => {
          const [px, py] = d3.pointer(ev);
          let best = null, bd = 16;
          c.pts.concat(c.aside).forEach((r) => { const dd = Math.max(0, Math.hypot(x(X(r)) - px, y(r[P.key]) - py) - rad(r)) + rad(r) / 100; if (dd < bd) { bd = dd; best = r; } });
          if (best) mark(best.id, true); else { tip.hide(); mark(state.focus, false); }
        })
        .on('pointerleave', () => { tip.hide(); mark(state.focus, false); });
      if (state.focus != null) mark(state.focus, false);
    });
    const reasons = [...new Set(list.flatMap((c) => c.aside.map((r) => asideOf(r, P.key))))].map((k) => ASIDE_KEY[k]);
    $('#axes').innerHTML = '<span>' + esc(V.axis) + '</span><span>' + esc(P.axis[0].toUpperCase() + P.axis.slice(1)) + '</span>' +
      '<span>' + sizeKey(RMAX_PANEL, P.cls) + '</span>' +
      (reasons.length ? '<span><i class="edv-sw edv-sw--hollow edv-sw--hollow-' + P.cls + '"></i>Not counted: ' + reasons.join('; ') + '</span>' : '');
    const single = d3.groups(REGIONS.filter((r) => r.eu), (r) => r.cc).filter(([, rows]) => rows.length === 1).map(([, rows]) => rows[0].country).sort();
    const without = countryStats(P.key).filter((c) => c.regions > 1 && c.pts.length < 2).map((c) => c.name).sort();
    const first = { t: 'turned out least', f: 'voted most for the far right', dt: 'fell furthest behind in turnout', df: 'saw the far right grow most' }[state.pm];
    $('#panels-note').textContent = 'Ordered by ρ: first the countries where the poorer regions ' + first + '. ' +
      'One region only: ' + single.join(', ') + '. ' + (without.length ? 'No regional results: ' + without.join(', ') + '. ' : '') +
      (state.pm === 't' || state.pm === 'dt' ? 'Belgium and Luxembourg have compulsory voting. ' : '') +
      (state.pm === 'dt' ? 'Turnout changes also reflect other elections held the same day in part of a country, such as regional elections in 12 Spanish regions in 2019 and local elections in eight German states in 2024. ' : '') +
      (state.pm === 'dt' || state.pm === 'df' ? 'Saarland has no turnout for 2024.' : '');
  }

  // ---------- far-right lists ----------
  function renderLists(lists) {
    const countries = d3.groups(REGIONS.filter((r) => r.eu), (r) => r.cc).map(([cc, rows]) => ({ cc, name: rows[0].country }))
      .sort((a, b) => d3.ascending(a.name, b.name));
    const byCc = d3.group(lists, (l) => l.cc);
    const used = new Set();
    $('#lists').innerHTML = countries.map((c) => {
      const rows = byCc.get(c.cc) || [];
      const tot = (y) => { const ls = rows.filter((l) => l.y === y); return ls.length ? f1(d3.sum(ls, (l) => l.pct)) + '%' : 'none'; };
      const parties = d3.groups(rows, (l) => l.party).map(([party, ls]) => {
        const y19 = ls.filter((l) => l.y === 2019), y24 = ls.filter((l) => l.y === 2024);
        const grp = [...new Set(ls.sort((a, b) => a.y - b.y).map((l) => l.grp).filter((g) => GROUP[g]))];
        grp.forEach((g) => used.add(g));
        return { party, name: ls[0].name, grp, p19: y19.length ? d3.sum(y19, (l) => l.pct) : null, p24: y24.length ? d3.sum(y24, (l) => l.pct) : null,
          lists: [...new Set(ls.map((l) => l.list))].filter((l) => l !== party) };
      }).sort((a, b) => (b.p24 || 0) - (a.p24 || 0) || (b.p19 || 0) - (a.p19 || 0));
      return '<article class="edv-list"><h3>' + esc(c.name) + '</h3>' + (rows.length
        ? '<p class="edv-list__tot">2019 ' + tot(2019) + ' <span aria-hidden="true">→</span> 2024 <b>' + tot(2024) + '</b></p>' +
          '<table><thead><tr><th>Party</th><th class="num">2019</th><th class="num">2024</th></tr></thead><tbody>' +
          parties.map((p) => '<tr><td><span class="edv-list__party">' + esc(p.party) + '</span>' +
            (p.name && p.name !== p.party ? ' <span class="edv-list__en">' + esc(p.name) + '</span>' : '') +
            ((p.grp.length || p.lists.length) ? '<span class="edv-list__meta">' + esc([p.lists.length ? 'list ' + p.lists.join(', ') : '', p.grp.join(' → ')].filter(Boolean).join(' · ')) + '</span>' : '') +
            '</td><td class="num">' + (p.p19 == null ? '–' : f1(p.p19)) + '</td><td class="num">' + (p.p24 == null ? '–' : f1(p.p24)) + '</td></tr>').join('') +
          '</tbody></table>'
        : '<p class="edv-list__none">No list counted as far right.</p>') + '</article>';
    }).join('');
    $('#groups').textContent = 'Share of valid votes in the European election, %. Groups in the European Parliament after each election: ' +
      [...used].map((g) => g + ' ' + GROUP[g]).join('; ') + '. No group shown: no seats or no group.';
  }

  function showError(err) {
    $('#hero-t-text').innerHTML = '<span class="error" role="alert">' + esc(err.message) +
      ' If you opened this file directly, serve the folder instead, e.g. <code>python3 -m http.server</code> in <code>site/europe</code>.</span>';
  }

  // ---------- boot ----------
  Promise.all([getJSON('data/regions.json'), getJSON('data/summary.json', true), getJSON('data/far_right_lists.json', true),
               getJSON('data/regions.topo.json')])
    .then(([regions, sumRows, lists, topo]) => {
      // change 2019 to 2024 in percentage points, where both elections have a figure
      regions.forEach((r) => {
        r.dt = r.t19 != null && r.t24 != null ? Math.round((r.t24 - r.t19) * 10) / 10 : null;
        r.df = r.f19 != null && r.f24 != null ? Math.round((r.f24 - r.f19) * 10) / 10 : null;
      });
      REGIONS = regions;
      VMAX = d3.max(regions.filter((r) => r.eu), voters) || 1;
      BY_ID = new Map(regions.map((r) => [r.id, r]));
      COUNT = d3.rollup(regions, (v) => v.length, (r) => r.cc);
      const sum = Array.isArray(sumRows) ? sumRows[0] : sumRows;
      const layer = topoDecode(topo);
      const feats = layer('regions').filter((f) => !DROP.has(f.properties.id));
      const outerSet = new Set(OUTER);
      MAP = {
        main: feats.filter((f) => !outerSet.has(f.properties.id)),
        outer: OUTER.map((id) => feats.find((f) => f.properties.id === id)).filter(Boolean),
        countries: fc(layer('countries')),
        countryFeats: layer('countries'),
        countryById: new Map(layer('countries').map((f) => [f.properties.id, f])),
        byId: new Map(feats.map((f) => [f.properties.id, f])),
        dataCount: regions.filter((r) => r.eu).length,
      };

      // national figures, one entry per country (from the first of its regions that has them)
      const first = (rows, k) => { const r = rows.find((x) => x[k] != null); return r ? r[k] : null; };
      CTRY = new Map(d3.groups(regions, (r) => r.cc).map(([cc, rows]) => [cc, {
        cc, name: rows[0].country, eu: rows[0].eu, compulsory: rows[0].compulsory, n: rows.length,
        cp: first(rows, 'cp'), ct: first(rows, 'ct'), cf: first(rows, 'cf'), cie: first(rows, 'cie') }]));
      renderHero();
      const eu = regions.filter((r) => r.eu);
      $('#map-intro').textContent = 'The ' + eu.length + ' regions of the 27 member states, with Switzerland for poverty risk. ' +
        'Regions are the EU’s statistical regions (NUTS 2): in Germany the Regierungsbezirke, or the whole Land where there are none; ' +
        'in Italy the regioni; in France the former régions. ' +
        'Switch between poverty risk, household income, turnout and the far right’s share of the vote in June 2024.';
      if (sum) {
        $('#eu').innerHTML = 'Across the EU: turnout <strong>' + pct(sum.eu_turnout_2024) + '</strong> in 2024 (' + pct(sum.eu_turnout_2019) +
          ' in 2019); far right <strong>' + pct(sum.eu_far_right_2024) + '</strong> of valid votes (' + pct(sum.eu_far_right_2019) + ').';
        const d = sum.poverty_updated ? d3.timeParse('%d/%m/%y %H:%M:%S')(sum.poverty_updated) : null;
        $('#freshness').textContent = d ? 'Poverty figures as updated by Eurostat on ' + d3.timeFormat('%-d %b %Y')(d) + '.' : '';
      }

      const mapEl = $('#map');
      const incYear = (regions.find((r) => r.iy) || {}).iy;
      if (incYear) MEASURES.i.title = 'Household income ' + incYear + ' relative to the country, country = 100 (darker: poorer)';
      const levelSeg = () => { $('#level').hidden = !!MEASURES[state.measure].regionsOnly; };
      const redrawMap = () => { levelSeg(); drawLegend(); drawMap(mapEl); };
      buildSeg($('#measure'), [['p', 'Poverty risk'], ['i', 'Income'], ['t', 'Turnout'], ['f', 'Far right']], 'measure', redrawMap);
      levelSeg();
      buildSeg($('#level'), [['r', 'Regions'], ['c', 'Countries']], 'level', () => { state.pinned = null; state.focus = null; focus(null); drawMap(mapEl); });
      drawLegend();
      onWidth(mapEl, () => drawMap(mapEl));
      onWidth($('#legend'), drawLegend);
      initFind();
      $('#table').addEventListener('toggle', renderTable);

      const allEl = $('#all');
      buildSeg($('#ameasure'), [['t', 'Turnout'], ['f', 'Far right']], 'am', () => drawAll(allEl));
      onWidth(allEl, () => drawAll(allEl));

      const panEl = $('#panels');
      const povNote = () => {
        const yr = (REGIONS.find((r) => r.iy) || {}).iy;
        $('#pov-note').textContent = state.pov === 'i' ? POVS.i.note + (yr || '') + ').' : POVS.p.note;
      };
      buildSeg($('#pov'), [['p', 'Poorer by poverty risk'], ['i', 'Poorer by household income']], 'pov', () => {
        povNote(); renderHero(); drawAll(allEl); drawPanels(panEl);
      });
      povNote();
      buildSeg($('#pmeasure'), [['t', 'Turnout'], ['f', 'Far right'], ['dt', 'Turnout change'], ['df', 'Far-right change']], 'pm', () => drawPanels(panEl));
      onWidth(panEl, () => drawPanels(panEl));

      if (lists) renderLists(lists);
    })
    .catch(showError);
})();
