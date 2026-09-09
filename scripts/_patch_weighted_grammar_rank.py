from pathlib import Path
p=Path('web/decision-board.js')
s=p.read_text()
old='''      const score = signals.reduce((total, signal) => total + (text.includes(signal) ? 1 : 0), 0);'''
new='''      const score = signals.reduce((total, signal, signalIndex) =>\n        total + (text.includes(signal) ? signals.length - signalIndex : 0), 0);'''
if old not in s:
    raise SystemExit('grammar score target not found')
s=s.replace(old,new,1)
s=s.replace('''  const mechanisms = rankMechanismsForGrammar(grammarId, 5);''','''  const mechanisms = rankMechanismsForGrammar(grammarId, 3);''',1)
p.write_text(s)
