from pathlib import Path

p = Path('web/board.js')
s = p.read_text()
s = s.replace(
'''    search: document.getElementById("searchInput"),
    chapterNav: document.getElementById("chapterNav"),
    explore: document.getElementById("exploreView"),''',
'''    search: document.getElementById("searchInput"),
    globalSearch: document.getElementById("globalSearch"),
    chapterNav: document.getElementById("chapterNav"),
    decide: document.getElementById("decisionView"),
    decisionRoot: document.getElementById("decisionRoot"),
    explore: document.getElementById("exploreView"),''')

old = '''  function setView(view) {\n    state.view = view;\n    els.explore.hidden = view !== "explore";\n    els.index.hidden = view !== "index";\n    els.viewButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.view === view));\n    if (view === "index") renderIndex();\n    else renderExplore();\n  }\n'''
new = '''  function setView(view) {\n    state.view = view;\n    els.explore.hidden = view !== "explore";\n    els.index.hidden = view !== "index";\n    els.decide.hidden = view !== "decide";\n    els.globalSearch.hidden = view === "decide";\n    els.chapterNav.hidden = view !== "explore";\n    els.viewButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.view === view));\n    if (view === "index") renderIndex();\n    else if (view === "decide") {\n      import("./decision-board.js")\n        .then(({ mountDecisionBoard }) => mountDecisionBoard(els.decisionRoot))\n        .catch((error) => {\n          console.error("Decision board failed to load", error);\n          els.decisionRoot.innerHTML = `<div class="decision-empty"><p class="decision-kicker">Decision system unavailable</p><h2>The subject atlas could not load.</h2></div>`;\n        });\n    } else renderExplore();\n  }\n'''
if old not in s:
    raise SystemExit('setView patch target not found')
s = s.replace(old, new, 1)

old = '''  function handleHash() {\n    const hash = decodeURIComponent(location.hash.replace(/^#/, ""));\n    if (!hash || !hash.includes(":")) return;\n    if (getItem(hash)) openDrawer(hash, false);\n  }\n'''
new = '''  function handleHash() {\n    const hash = decodeURIComponent(location.hash.replace(/^#/, ""));\n    if (!hash || !hash.includes(":")) return;\n    if (hash.startsWith("subject:") || hash.startsWith("grammar:")) {\n      setView("decide");\n      return;\n    }\n    if (getItem(hash)) openDrawer(hash, false);\n  }\n'''
if old not in s:
    raise SystemExit('handleHash patch target not found')
s = s.replace(old, new, 1)

s = s.replace(
'''      if (state.view === "index") renderIndex(); else renderExplore();''',
'''      if (state.view === "index") renderIndex();\n      else if (state.view === "explore") renderExplore();''',
1)
s = s.replace(
'''      if (event.key === "/" && document.activeElement !== els.search && !state.openUid) { event.preventDefault(); els.search.focus(); }''',
'''      if (event.key === "/" && state.view !== "decide" && document.activeElement !== els.search && !state.openUid) { event.preventDefault(); els.search.focus(); }''',
1)
s = s.replace(
'''      els.explore.hidden = true;\n      els.index.hidden = true;''',
'''      els.explore.hidden = true;\n      els.index.hidden = true;\n      els.decide.hidden = true;''',
1)
p.write_text(s)

css = Path('web/board.css')
c = css.read_text()
c += '''\n\n/* Master decision board --------------------------------------------------- */\n'''
c += Path('scripts/_patch_master_board_styles.css').read_text()
css.write_text(c)
