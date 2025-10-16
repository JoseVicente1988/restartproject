python -m pip install git-filter-repo

REM Elimina todo node_modules y .next del historial
git filter-repo --path node_modules --path .next --invert-paths

REM Alternativa más fina: solo los binarios SWC y .next
REM git filter-repo --path-glob "node_modules/@next/swc-*/**" --path .next --invert-paths

git push origin --force