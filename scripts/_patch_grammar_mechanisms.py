from pathlib import Path

p = Path('web/decision-board.js')
s = p.read_text()
needle = '''function familyIdsForGrammar(grammarId) {\n  return Object.entries(data?.atlas?.families || {})\n    .filter(([, family]) => (family.grammars || []).includes(grammarId))\n    .map(([id]) => id);\n}\n'''
addition = '''\nfunction rankMechanismsForGrammar(grammarId, limit = 5) {\n  const signals = GRAMMAR_SIGNALS[grammarId] || [];\n  return (rawBank().mechanisms?.mechanisms || [])\n    .map((item, index) => {\n      const text = [item.id, item.name, item.summary, item.use_when, ...(item.primitives || [])]\n        .filter(Boolean).join(" ").toLowerCase().replace(/[-_/]+/g, " ");\n      const score = signals.reduce((total, signal) => total + (text.includes(signal) ? 1 : 0), 0);\n      return { item, score, index };\n    })\n    .filter(({ score }) => score > 0)\n    .sort((a, b) => b.score - a.score || a.index - b.index)\n    .slice(0, limit)\n    .map(({ item }) => item);\n}\n'''
if needle not in s:
    raise SystemExit('familyIdsForGrammar target not found')
s = s.replace(needle, needle + addition, 1)
old = '''  const mechanisms = [...new Set(familyIds.flatMap((id) => familyById(id)?.mechanisms || []))]\n    .map(mechanismById).filter(Boolean).slice(0, 6);'''
new = '''  const mechanisms = rankMechanismsForGrammar(grammarId, 5);'''
if old not in s:
    raise SystemExit('grammar mechanism target not found')
s = s.replace(old, new, 1)
p.write_text(s)

css_path = Path('web/decision-board.css')
css = css_path.read_text()
old_css = '''  .decision-detail h2 { font-size: 40px; }\n  .decision-bank-row { grid-template-columns: 1fr 14px; }'''
new_css = '''  .decision-detail h2 { font-size: 40px; }\n  .decision-list { max-height: 180px; }\n  .decision-bank-row { grid-template-columns: 1fr 14px; }'''
if old_css not in css:
    raise SystemExit('mobile decision list target not found')
css_path.write_text(css.replace(old_css, new_css, 1))
