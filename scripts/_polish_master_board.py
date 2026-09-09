from pathlib import Path

# 1) Keep decision CSS lazy instead of paying for it on ordinary board visits.
css_path = Path('web/board.css')
css = css_path.read_text()
marker = '/* Master decision board --------------------------------------------------- */'
if marker not in css:
    raise SystemExit('decision CSS marker not found')
base_css, decision_css = css.split(marker, 1)
css_path.write_text(base_css.rstrip() + '\n')
Path('web/decision-board.css').write_text(marker + decision_css)

# 2) Make Decide take over the page rather than sitting below the large hero.
board_path = Path('web/board.js')
board = board_path.read_text()
old = '''    search: document.getElementById("searchInput"),\n    globalSearch: document.getElementById("globalSearch"),'''
new = '''    search: document.getElementById("searchInput"),\n    intro: document.querySelector(".intro"),\n    globalSearch: document.getElementById("globalSearch"),'''
if old not in board:
    raise SystemExit('board intro target not found')
board = board.replace(old, new, 1)
old = '''    els.decide.hidden = view !== "decide";\n    els.globalSearch.hidden = view === "decide";'''
new = '''    els.decide.hidden = view !== "decide";\n    els.intro.hidden = view === "decide";\n    els.globalSearch.hidden = view === "decide";'''
if old not in board:
    raise SystemExit('setView intro target not found')
board = board.replace(old, new, 1)
board_path.write_text(board)

# 3) Human query matching, fewer recommendations, and lazy decision styles.
decision_path = Path('web/decision-board.js')
decision = decision_path.read_text()
insert_after = '''function titleCase(value = "") {\n  return String(value).split("-").map((part) => part ? part[0].toUpperCase() + part.slice(1) : part).join(" ");\n}\n'''
addition = '''\nfunction matchesQuery(value, query) {\n  const tokens = String(query || "").trim().toLowerCase().split(/\\s+/).filter(Boolean);\n  if (!tokens.length) return true;\n  const haystack = String(value || "").toLowerCase().replace(/[-_/]+/g, " ");\n  return tokens.every((token) => haystack.includes(token));\n}\n'''
if insert_after not in decision:
    raise SystemExit('titleCase insertion target not found')
decision = decision.replace(insert_after, insert_after + addition, 1)

old = '''async function loadAtlas() {\n  if (!atlasPromise) {'''
new = '''async function loadDecisionStyles() {\n  const id = "decision-board-styles";\n  if (document.getElementById(id)) return;\n  const href = new URL("./decision-board.css", import.meta.url).href;\n  await new Promise((resolve, reject) => {\n    const link = document.createElement("link");\n    link.id = id;\n    link.rel = "stylesheet";\n    link.href = href;\n    link.onload = resolve;\n    link.onerror = () => reject(new Error("Decision styles failed to load."));\n    document.head.append(link);\n  });\n}\n\nasync function loadAtlas() {\n  if (!atlasPromise) {'''
if old not in decision:
    raise SystemExit('loadAtlas target not found')
decision = decision.replace(old, new, 1)

decision = decision.replace(
'''    .filter((subject) => !query || [subject.name, subject.code, subject.family].filter(Boolean).join(" ").toLowerCase().includes(query))''',
'''    .filter((subject) => matchesQuery([subject.name, subject.code, subject.family].filter(Boolean).join(" "), query))''',
1)
decision = decision.replace(
'''    .filter((item) => !query || `${item.id} ${item.description}`.toLowerCase().includes(query))''',
'''    .filter((item) => matchesQuery(`${item.id} ${item.description}`, query))''',
1)

old = '''  const mechanisms = (family.mechanisms || []).map(mechanismById).filter(Boolean).slice(0, 6);\n  const routeTools = [...new Set(routes.flatMap((id) => grammarById(id)?.default_tools || []))]\n    .map(toolById).filter(Boolean).slice(0, 6);'''
new = '''  const mechanisms = (family.mechanisms || []).map(mechanismById).filter(Boolean).slice(0, 4);\n  const routeTools = (family.tools || []).map(toolById).filter(Boolean).slice(0, 4);'''
if old not in decision:
    raise SystemExit('subject recommendation target not found')
decision = decision.replace(old, new, 1)
decision = decision.replace('.map(mechanismById).filter(Boolean).slice(0, 8);', '.map(mechanismById).filter(Boolean).slice(0, 6);', 1)

old = '''export async function mountDecisionBoard(host) {\n  if (!host) return;\n  activeHost = host;'''
new = '''export async function mountDecisionBoard(host) {\n  if (!host) return;\n  activeHost = host;\n  await loadDecisionStyles();'''
if old not in decision:
    raise SystemExit('mount target not found')
decision = decision.replace(old, new, 1)
decision_path.write_text(decision)

# 4) Validation must enforce that decision code, data, and CSS stay lazy.
validator = Path('scripts/validate_decision_board.py')
v = validator.read_text()
v = v.replace(
'''DECISION_JS = ROOT / "web" / "decision-board.js"\nCSS = ROOT / "web" / "board.css"''',
'''DECISION_JS = ROOT / "web" / "decision-board.js"\nDECISION_CSS = ROOT / "web" / "decision-board.css"\nCSS = ROOT / "web" / "board.css"''',
1)
v = v.replace('for path in (INDEX, BOARD_JS, DECISION_JS, CSS, BUILD_SCRIPT, data_path):', 'for path in (INDEX, BOARD_JS, DECISION_JS, DECISION_CSS, CSS, BUILD_SCRIPT, data_path):', 1)
v = v.replace(
'''        if 'modulepreload" href="./web/decision-board.js' in html:\n            errors.append("decision-board.js must remain lazy and must not be modulepreloaded")''',
'''        if 'modulepreload" href="./web/decision-board.js' in html:\n            errors.append("decision-board.js must remain lazy and must not be modulepreloaded")\n        if './web/decision-board.css' in html:\n            errors.append("decision-board.css must remain lazy and must not be linked from index.html")''',
1)
v = v.replace(
'''            'window.__BOARD_DATA__',\n        ):''',
'''            'window.__BOARD_DATA__',\n            'loadDecisionStyles',\n            'matchesQuery',\n        ):''',
1)
v = v.replace(
'''    if CSS.exists():\n        css = CSS.read_text(encoding="utf-8")\n        for required in (\n            '.decision-view',\n            '.decision-path',\n            '.decision-workspace',\n            '.decision-topic',\n            '.decision-route-row',\n            '.decision-bank-row',\n        ):\n            if required not in css:\n                errors.append(f"web/board.css missing decision style: {required}")''',
'''    if DECISION_CSS.exists():\n        decision_css = DECISION_CSS.read_text(encoding="utf-8")\n        for required in (\n            '.decision-view',\n            '.decision-path',\n            '.decision-workspace',\n            '.decision-topic',\n            '.decision-route-row',\n            '.decision-bank-row',\n        ):\n            if required not in decision_css:\n                errors.append(f"web/decision-board.css missing decision style: {required}")\n        if DECISION_CSS.stat().st_size > 16_000:\n            errors.append(f"decision-board.css exceeds 16 KB lazy-style budget: {DECISION_CSS.stat().st_size:,} bytes")\n\n    if CSS.exists() and '.decision-view' in CSS.read_text(encoding="utf-8"):\n        errors.append("web/board.css must not include lazy decision-board styles")''',
1)
v = v.replace(
'''    print(\n        "Master decision board validation passed: "\n        f"{DECISION_JS.stat().st_size:,} B lazy JS, {data_path.stat().st_size:,} B lazy data."\n    )''',
'''    lazy_total = DECISION_JS.stat().st_size + DECISION_CSS.stat().st_size + data_path.stat().st_size\n    if lazy_total > 90_000:\n        print(f"Master decision board lazy payload exceeds 90 KB: {lazy_total:,} bytes", file=sys.stderr)\n        return 1\n    print(\n        "Master decision board validation passed: "\n        f"{DECISION_JS.stat().st_size:,} B lazy JS, {DECISION_CSS.stat().st_size:,} B lazy CSS, "\n        f"{data_path.stat().st_size:,} B lazy data; {lazy_total:,} B total before compression."\n    )''',
1)
validator.write_text(v)

board_validator = Path('scripts/validate_board.py')
bv = board_validator.read_text()
bv = bv.replace(
'''DECISION_JS = ROOT / "web" / "decision-board.js"\nCSS = ROOT / "web" / "board.css"''',
'''DECISION_JS = ROOT / "web" / "decision-board.js"\nDECISION_CSS = ROOT / "web" / "decision-board.css"\nCSS = ROOT / "web" / "board.css"''',
1)
bv = bv.replace('for path in (INDEX, BOOT_JS, JS, WORKBENCH_JS, DECISION_JS, CSS):', 'for path in (INDEX, BOOT_JS, JS, WORKBENCH_JS, DECISION_JS, DECISION_CSS, CSS):', 1)
bv = bv.replace(
'''        '.decision-view',\n        '.decision-workspace',\n        '@media (max-width: 560px)',''',
'''        '@media (max-width: 560px)',\n        '@media (prefers-reduced-motion: reduce)',''',
1)
# remove duplicated reduced-motion entry if the replacement created one
bv = bv.replace("        '@media (prefers-reduced-motion: reduce)',\n        '@media (prefers-reduced-motion: reduce)',", "        '@media (prefers-reduced-motion: reduce)',", 1)
insert = '''\nif DECISION_CSS.exists():\n    decision_css = DECISION_CSS.read_text(encoding="utf-8")\n    for required in ('.decision-view', '.decision-workspace', '@media (max-width: 560px)'):\n        if required not in decision_css:\n            errors.append(f"web/decision-board.css missing required decision style: {required}")\n\n'''
needle = 'for data_path in (\n'
if needle not in bv:
    raise SystemExit('board validator insertion target not found')
bv = bv.replace(needle, insert + needle, 1)
board_validator.write_text(bv)
