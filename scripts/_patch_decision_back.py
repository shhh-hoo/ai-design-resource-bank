from pathlib import Path
p=Path('web/board.js')
s=p.read_text()
old='''    if (hash.startsWith("subject:") || hash.startsWith("grammar:")) {\n      setView("decide");\n      return;\n    }'''
new='''    if (hash.startsWith("subject:") || hash.startsWith("grammar:")) {\n      if (state.openUid) closeDrawer(false);\n      setView("decide");\n      return;\n    }'''
if old not in s:
    raise SystemExit('decision hash target not found')
p.write_text(s.replace(old,new,1))
