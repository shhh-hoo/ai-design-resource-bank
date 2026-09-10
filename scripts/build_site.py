#!/usr/bin/env python3
"""Stage the current resource-bank projection plus preserved interactive examples for Pages."""
import shutil
import subprocess
import sys
from atlas_core import ROOT
from build_catalog import build

build(check=True)
out=ROOT/'_site'
if out.exists(): shutil.rmtree(out)
out.mkdir()
for filename in ['index.html','legacy.html','catalog.yaml']:
    shutil.copy2(ROOT/filename,out/filename)
for dirname in ['app','catalog','resources','web','registries']:
    shutil.copytree(ROOT/dirname,out/dirname)
subprocess.run([sys.executable,str(ROOT/'scripts/build_board_data.py'),'--output',str(out/'data/board.json')],check=True)
(out/'.nojekyll').touch()
print('AIDRB staged in _site with the current bank UI and preserved pre-Atlas interactive examples.')
