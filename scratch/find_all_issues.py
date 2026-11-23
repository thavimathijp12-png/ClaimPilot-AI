import os
import re

def check_file(path):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
        lines = content.splitlines()

    issues = []
    
    # 1. Unused imports
    for i, line in enumerate(lines):
        line_s = line.strip()
        if line_s.startswith("import ") and line_s.endswith(";") and not line_s.startswith("import static") and not ".*" in line_s:
            class_name = line_s.rstrip(";").split(".")[-1].strip()
            # check how many times class_name appears in content
            matches = list(re.finditer(r'\b' + re.escape(class_name) + r'\b', content))
            if len(matches) <= 1:
                issues.append(("UNUSED_IMPORT", i + 1, f"Unused import: {class_name}"))

    # 2. Unused private fields/methods
    for i, line in enumerate(lines):
        line_s = line.strip()
        if line_s.startswith("private ") and "(" not in line_s and "=" in line_s and ";" in line_s:
            # private field declaration
            parts = line_s.replace(";", "").split("=")[0].strip().split()
            if len(parts) >= 3:
                field_name = parts[-1]
                matches = list(re.finditer(r'\b' + re.escape(field_name) + r'\b', content))
                if len(matches) <= 1:
                    issues.append(("UNUSED_FIELD", i + 1, f"Unused private field: {field_name}"))

    return issues

all_issues = {}
for root_dir in ["backend/src/main/java", "backend/src/test/java"]:
    for root, dirs, files in os.walk(root_dir):
        for f in files:
            if f.endswith(".java"):
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, ".").replace("\\", "/")
                file_issues = check_file(full_path)
                if file_issues:
                    all_issues[rel_path] = file_issues

total = sum(len(v) for v in all_issues.values())
print(f"Total issues found: {total}")
for f, issues in all_issues.items():
    print(f"\n{f}:")
    for kind, line, desc in issues:
        print(f"  Line {line} [{kind}]: {desc}")
