from pathlib import Path
p=Path('web/decision-board.js')
s=p.read_text()
start=s.index('function rankMechanismsForGrammar(')
end=s.index('\n\nasync function loadDecisionStyles()', start)
replacement='''function curatedMechanismsForGrammar(grammarId) {\n  const ids = data?.grammar_mechanisms?.grammar_mechanisms?.[grammarId] || [];\n  return ids.map(mechanismById).filter(Boolean);\n}'''
s=s[:start]+replacement+s[end:]
s=s.replace('''  const mechanisms = rankMechanismsForGrammar(grammarId, 3);''','''  const mechanisms = curatedMechanismsForGrammar(grammarId);''',1)
p.write_text(s)
