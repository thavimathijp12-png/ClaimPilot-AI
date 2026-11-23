import os
import re

SRC_DIR = "src"
print("=== AUDITING FRONTEND CODE QUALITY ===")

jsx_files = []
for root, dirs, files in os.walk(SRC_DIR):
    for f in files:
        if f.endswith((".js", ".jsx")):
            jsx_files.append(os.path.join(root, f))

unused_imports = []
for path in jsx_files:
    with open(path, "r", encoding="utf-8", errors="ignore") as file:
        content = file.read()
        lines = content.splitlines()
    
    rel_path = os.path.relpath(path, ".").replace("\\", "/")
    
    for i, line in enumerate(lines):
        line_clean = line.strip()
        # Look for import { a, b, c } from '...'
        if line_clean.startswith("import ") and "from" in line_clean and not line_clean.startswith("import type"):
            # extract inside { ... }
            match = re.search(r'import\s+\{([^}]+)\}\s+from', line_clean)
            if match:
                items = [x.strip() for x in match.group(1).split(",") if x.strip()]
                for item in items:
                    # check for alias "a as b"
                    actual_name = item.split(" as ")[-1].strip()
                    # count occurrences in rest of content
                    occurrences = len(re.findall(r'\b' + re.escape(actual_name) + r'\b', content))
                    if occurrences <= 1:
                        unused_imports.append((rel_path, i + 1, actual_name, line_clean))
            else:
                # default import e.g. import React from 'react'
                match_def = re.search(r'import\s+([A-Za-z0-9_$]+)\s+from', line_clean)
                if match_def:
                    name = match_def.group(1).strip()
                    if name != "React":
                        occurrences = len(re.findall(r'\b' + re.escape(name) + r'\b', content))
                        if occurrences <= 1:
                            unused_imports.append((rel_path, i + 1, name, line_clean))

print(f"Total frontend JS/JSX files scanned: {len(jsx_files)}")
print(f"Frontend unused imports found: {len(unused_imports)}")
for f, l, name, code in unused_imports:
    print(f"  {f}:{l} -> Unused import '{name}'")
