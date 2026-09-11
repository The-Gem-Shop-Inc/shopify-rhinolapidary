"""Offline, deterministic extraction; no identity or fact approval is inferred."""
import csv
import hashlib
import json
from pathlib import Path
import openpyxl

root = Path(__file__).resolve().parent.parent
index = json.loads((root / 'data/epic-e-technical-source-index.json').read_text(encoding='utf-8'))
rows = []
for source in index['sources']:
    relative = source.get('repositorySourcePath')
    if source['origin'] != 'repository' or not relative or not relative.endswith('.xlsx'):
        continue
    if hashlib.sha256((root / relative).read_bytes()).hexdigest() != source['contentHash']:
        raise ValueError(f'Source hash changed; refresh E-PBI-018A evidence before extraction: {relative}')
    book = openpyxl.load_workbook(root / relative, data_only=True, read_only=True)
    for sheet in book:
        for row_number, row in enumerate(sheet, 1):
            cells = [{'cell': cell.coordinate, 'value': str(cell.value)} for cell in row if cell.value is not None]
            if cells:
                rows.append({'sourceId': source['sourceId'], 'sheet': sheet.title, 'row': row_number, 'cells': cells})
    book.close()
csv_path = root / 'data/product-export/products.csv'
with csv_path.open(encoding='utf-8-sig', newline='') as file:
    products = [{'handle': r['Handle'], 'bodyHtml': r['Body (HTML)']} for r in csv.DictReader(file) if r.get('Body (HTML)')]
result = {'schemaVersion': 1, 'sourceIndexSha256': hashlib.sha256((root / 'data/epic-e-technical-source-index.json').read_bytes()).hexdigest(),
          'csvSha256': hashlib.sha256(csv_path.read_bytes()).hexdigest(), 'workbookRows': rows, 'productDescriptions': products,
          'authority': 'Extracted observations only; cached formula results and description HTML never approve facts or identities.'}
(root / 'data/epic-e-batch-3b-extracted-evidence.json').write_text(json.dumps(result, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print(f'Extracted {len(rows)} workbook rows and {len(products)} descriptions offline.')
