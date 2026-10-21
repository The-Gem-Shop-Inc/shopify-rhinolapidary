"""Generate minimal historical summaries. Original archives are read-only; no payload export."""
import pathlib, json, hashlib, zipfile, collections, urllib.parse

root = pathlib.Path.cwd()
evidence = pathlib.Path('.git/epic-j-portability-evidence-path').read_text(encoding='utf8').strip()
prior = pathlib.Path('.git/epic-j-git-evidence-path').read_text(encoding='utf8').strip()
private = json.loads((root / prior / 'confirmed-sensitive-archives.json').read_text(encoding='utf8'))
before = json.loads((root / 'data/epic-j-j1-source-successor.json').read_text(encoding='utf8'))
identities = json.loads((root / before['before']['path']).read_text(encoding='utf8'))
target = root / evidence / 'public-summaries'
target.mkdir()
entries = []

def category(url):
    path = urllib.parse.urlparse(url).path
    if path == '/password': return 'AUTHENTICATION'
    if path.startswith('/cart/'): return 'CART_MUTATION_OR_READ'
    if path in ('/cart', '/cart.js', '/cart.json'): return 'CART_PAGE_OR_READ'
    if path.startswith('/products/'): return 'PRODUCT'
    return 'OTHER'

def cases(report):
    for suite in report.get('suites', []):
        for spec in suite.get('specs', []):
            for test in spec.get('tests', []):
                yield spec, test
        yield from cases(suite)

for n, row in enumerate(private, 1):
    path = row['path']
    sha = hashlib.sha256((root / path).read_bytes()).hexdigest()
    assert sha == identities[path]
    run = path.split('/artifacts/')[0]
    reportpath = run + '/playwright.json'
    report = json.loads((root / reportpath).read_text(encoding='utf8'))
    matched = []
    for spec, test in cases(report):
        for result in test.get('results', []):
            if any(a.get('path', '').replace('\\', '/').endswith(path.split('/artifacts/')[1]) for a in result.get('attachments', [])):
                # Only documented allowlisted historical test facts are copied.
                matched.append({'testIdentity': spec['title'], 'outcome': result['status'],
                                'durationMs': result['duration'], 'retry': result.get('retry', 0),
                                'assertionFailureCount': len(result.get('errors', []))})
    methods = collections.Counter()
    viewport = set()
    with zipfile.ZipFile(root / path) as archive:
        for member in archive.namelist():
            if member.endswith('.network'):
                for line in archive.read(member).decode('utf8', errors='replace').splitlines():
                    try: snap = json.loads(line).get('snapshot', {})
                    except ValueError: continue
                    request = snap.get('request', {})
                    method = request.get('method', 'UNKNOWN')
                    if method not in ('GET', 'POST', 'HEAD', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'): method = 'OTHER'
                    status = snap.get('response', {}).get('status', 0)
                    result = 'HTTP_' + str(status // 100) + 'XX' if isinstance(status, int) and 100 <= status < 600 else 'NO_HTTP_RESPONSE'
                    methods[(method, category(request.get('url', '')), result)] += 1
            elif member.endswith('.trace'):
                for line in archive.read(member).decode('utf8', errors='replace').splitlines():
                    try: item = json.loads(line)
                    except ValueError: continue
                    if item.get('type') == 'context-options':
                        size = item.get('options', {}).get('viewport') or {}
                        if isinstance(size.get('width'), int) and isinstance(size.get('height'), int): viewport.add((size['width'], size['height']))
    summary = {'schemaVersion': 1, 'governingSuccessor': 'J1-EVIDENCE-PORTABILITY-V1-2026-10-20',
               'kind': 'OBSERVED_HISTORICAL_METADATA_NOT_REGENERATED_MEASUREMENTS',
               'original': {'path': path, 'sha256': sha, 'runIdentifier': run.split('/')[-1]},
               'sourceReport': {'path': reportpath, 'sha256': hashlib.sha256((root / reportpath).read_bytes()).hexdigest()},
               'testResults': matched, 'browser': 'chromium',
               'viewports': [{'width': w, 'height': h} for w, h in sorted(viewport)],
               'requestCategories': [{'method': k[0], 'category': k[1], 'transportResult': k[2], 'count': v} for k, v in sorted(methods.items())],
               'limitations': 'No assertion is inferred from an HTTP result. Test outcomes come only from the immutable Playwright report. No URLs, queries, headers, bodies, cookies or tokens are exported. Raw traces may contain additional debugging context; summaries do not replace them or certify a passed historical run.'}
    dest = target / ('private-trace-%02d.json' % n)
    dest.write_text(json.dumps(summary, indent=2) + '\n', encoding='utf8')
    entries.append({'path': path, 'originalSha256': sha, 'historicalRunIdentifier': run.split('/')[-1],
                    'classification': 'PRIVATE_AUTHENTICATION_EVIDENCE',
                    'reason': 'Contains recorded authentication request bodies and session headers; never publish.',
                    'mustExistLocally': True, 'absencePermittedInPortableValidation': True,
                    'safeSummary': dest.relative_to(root).as_posix(), 'governingSuccessor': 'J1-EVIDENCE-PORTABILITY-V1-2026-10-20'})
out = {'schemaVersion': 1, 'id': 'J1-PRIVATE-EVIDENCE-V1-2026-10-20', 'successor': 'J1-EVIDENCE-PORTABILITY-V1-2026-10-20', 'entries': entries}
(root / 'data/epic-j-private-evidence-v1.json').write_text(json.dumps(out, indent=2) + '\n', encoding='utf8')
print(json.dumps({'summaries': len(entries), 'originalsChanged': 0, 'secretValuesExported': False}))
