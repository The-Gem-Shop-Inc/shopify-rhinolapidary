"""Extract local policy/manual text and governed evidence. Never approve claims."""
import hashlib
import json
from pathlib import Path
from pypdf import PdfReader

root = Path(__file__).resolve().parent.parent
index = json.loads((root / 'data/epic-e-technical-source-index.json').read_text(encoding='utf-8'))
paths = {'docs/policy/Rhino Lapidary Policies - Warranty, Shipping, Returns.pdf': 'repo-policy-pdf'}
for source in index['sources']:
    path = source.get('repositorySourcePath')
    if path and path.endswith('.pdf'):
        paths.setdefault(path, source['sourceId'])
sources = []
for path, source_id in sorted(paths.items()):
    content = (root / path).read_bytes()
    pages = [{'page': i + 1, 'text': page.extract_text() or ''} for i, page in enumerate(PdfReader(root / path).pages)]
    sources.append({'sourceId': source_id, 'path': path, 'sha256': hashlib.sha256(content).hexdigest(),
                    'pages': pages, 'extractionState': 'text_extracted' if any(p['text'].strip() for p in pages) else 'no_extractable_text',
                    'decisionState': 'observed', 'currentPolicyApproved': False})
result = {'schemaVersion': 1, 'sources': sources, 'note': 'Text extraction is evidence only. Missing embedded text is an extraction gap, not absence of a claim. Local PDF identity is not assumed to equal a Shopify File.'}
(root / 'data/epic-e-batch-3c-source-extracts.json').write_text(json.dumps(result, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print(f'Extracted {len(sources)} local policy/manual/drawing PDFs; no claims approved.')
