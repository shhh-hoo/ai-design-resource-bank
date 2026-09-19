#!/usr/bin/env python3
"""Stage the static Atlas and its public retrieval projection for GitHub Pages."""
import shutil
from atlas_core import ROOT
from build_catalog import build
build(check=True)
out=ROOT/'_site'
if out.exists():shutil.rmtree(out)
out.mkdir()
for filename in ['index.html','catalog.yaml']:
    shutil.copy2(ROOT/filename,out/filename)
for dirname in ['app','catalog','resources']:
    shutil.copytree(ROOT/dirname,out/dirname)
(out/'.nojekyll').touch()
print('Atlas staged in _site; legacy board is retained in Git but excluded from Pages startup/deployment.')
