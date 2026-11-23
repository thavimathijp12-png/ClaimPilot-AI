import os
import re

JAVA_DIR = r"backend/src/main/java"
SRC_DIR = r"src"

print("=== AUDITING JAVA CODE QUALITY ===")

java_files = []
for root, dirs, files in os.walk(JAVA_DIR):
    for f in files:
        if f.endswith(".java"):
            java_files.append(os.path.join(root, f))

unused_imports = []
raw_types = []
missing_override = []

for path in java_files:
    with open(path, "r", encoding="utf-8", errors="ignore") as file:
        lines = file.readlines()
    
    content = "".join(lines)
    rel_path = os.path.relpath(path, ".").replace("\\", "/")
    
    # 1. Check unused imports
    for i, line in enumerate(lines):
        line_clean = line.strip()
        if line_clean.startswith("import ") and line_clean.endswith(";"):
            # skip static imports or wildcards
            if ".*" in line_clean:
                continue
            import_target = line_clean.replace("import ", "").replace(";", "").strip()
            if import_target.startswith("static "):
                class_or_method = import_target.split(" ")[-1].split(".")[-1]
            else:
                class_or_method = import_target.split(".")[-1]
            
            # Count occurrences in rest of file (excluding the import line itself)
            # Match word boundary
            occurrences = len(re.findall(r'\b' + re.escape(class_or_method) + r'\b', content))
            if occurrences <= 1:
                unused_imports.append((rel_path, i + 1, class_or_method, line_clean))

    # 2. Check raw types (ResponseEntity without generic, ApiResponse without generic, Optional without generic)
    for i, line in enumerate(lines):
        # ignore comments
        if line.strip().startswith("//") or line.strip().startswith("*"):
            continue
        for raw in ["ResponseEntity", "ApiResponse", "List", "Set", "Map", "Optional"]:
            # Pattern: raw type not followed by < and preceded by boundary
            matches = re.finditer(r'(?<!<)\b' + raw + r'\b(?!\s*<|\.class|\.ok|\.status|\.notFound|\.badRequest|\.builder|\.of|\.empty|\.copy|\.ofNullable)', line)
            for m in matches:
                # check context
                prefix = line[:m.start()].strip()
                if "import" not in line and "package" not in line:
                    raw_types.append((rel_path, i + 1, raw, line.strip()))

print(f"Total Java files scanned: {len(java_files)}")
print(f"Unused imports found: {len(unused_imports)}")
for f, l, name, code in unused_imports:
    print(f"  {f}:{l} -> Unused import '{name}': {code}")

print(f"\nPotential Raw types found: {len(raw_types)}")
for f, l, name, code in raw_types[:30]:
    print(f"  {f}:{l} -> Raw type '{name}': {code}")
