#!/usr/bin/env python3
"""Fix English module index pages - replace Chinese link text with English frontmatter titles."""
import os
import re

en_dir = r"docs\en"

# Find all module index files
index_files = []
for f in os.listdir(en_dir):
    if f.endswith('.md') and ('索引' in f):
        index_files.append(os.path.join(en_dir, f))

print(f"Found {len(index_files)} index files")

def get_title(md_path):
    """Read frontmatter title or H1 from a markdown file."""
    with open(md_path, 'r', encoding='utf-8') as fh:
        content = fh.read()
    # Try frontmatter
    fm_match = re.match(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
    if fm_match:
        fm_block = fm_match.group(1)
        title_match = re.search(r'^title:\s*(.+)$', fm_block, re.MULTILINE)
        if title_match:
            title = title_match.group(1).strip().strip('"').strip("'")
            return title
    # Fallback to H1
    h1_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    if h1_match:
        return h1_match.group(1).strip()
    return None

for idx_path in index_files:
    fname = os.path.basename(idx_path)
    with open(idx_path, 'r', encoding='utf-8') as fh:
        content = fh.read()

    changes = [0]

    def replace_link(m):
        chinese_text = m.group(1)
        html_name = m.group(2)
        md_name = html_name.replace('.html', '.md')
        md_path = os.path.join(en_dir, md_name)
        if os.path.exists(md_path):
            title = get_title(md_path)
            if title and title != chinese_text:
                changes[0] += 1
                return f'[{title}](/en/{html_name})'
        return m.group(0)

    new_content = re.sub(r'\[([^\]]+)\]\(/en/([^)]+\.html)\)', replace_link, content)

    if changes[0] > 0:
        with open(idx_path, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(new_content)
        print(f"  {fname}: replaced {changes[0]} link texts")
    else:
        print(f"  {fname}: no changes")

print("\nDone.")
