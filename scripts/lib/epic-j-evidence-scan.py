"""Metadata-only credential scan; never serialize matched strings or input bodies."""
import sys, json, pathlib, re, zipfile

PATTERNS = [
    ('PRIVATE_KEY', re.compile(rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----')),
    ('SHOPIFY_ACCESS_TOKEN', re.compile(rb'\bshp(?:at|ca|pa|ua|ss)_[A-Za-z0-9]{20,}\b')),
    ('GITHUB_ACCESS_TOKEN', re.compile(rb'\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b')),
    ('JWT_VALUE', re.compile(rb'\beyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b')),
    ('BEARER_VALUE', re.compile(rb'(?i)bearer\s+[A-Za-z0-9._~+/-]{24,}')),
]

def trace_fields(value, findings, context=''):
    if isinstance(value, list):
        for item in value: trace_fields(item, findings, context)
    elif isinstance(value, dict):
        # HAR header objects; only field names and presence leave this process.
        name = str(value.get('name', '')).lower()
        if name in ('cookie', 'set-cookie', 'authorization', 'x-shopify-access-token'):
            v = value.get('value')
            if isinstance(v, str) and v and not re.fullmatch(r'(?i)[\[<]?(?:redacted|removed)[\]>]?', v):
                findings.add('AUTH_OR_SESSION_HEADER_VALUE')
        if name == 'password' and value.get('value'):
            findings.add('PASSWORD_FIELD_VALUE')
        for key, v in value.items():
            # Request/config form dictionaries in Playwright traces.
            lower = str(key).lower()
            sensitive_key = lower in ('access_token', 'accesstoken')
            if lower in ('authorization', 'cookie', 'set-cookie') and isinstance(v, str):
                sensitive_key = context.lower() in ('headers', 'requestheaders', 'responseheaders') or bool(re.match(r'(?i)^(?:Bearer|Basic)\s+', v)) or (lower != 'authorization' and '=' in v)
            password_context = str(key).lower() == 'password' and context in ('form', 'credentials', 'postData', 'params')
            if sensitive_key or password_context:
                if isinstance(v, str) and v and not re.fullmatch(r'(?i)(?:fixture|synthetic|example|<redacted>|\[REDACTED\]|\$\{.*\})', v):
                    findings.add('AUTH_FIELD_VALUE')
            trace_fields(v, findings, str(key))

def scan_bytes(data, suffix, findings):
    for name, pattern in PATTERNS:
        if pattern.search(data): findings.add(name)
    if suffix in ('.network', '.trace'):
        for line in data.decode('utf8', errors='replace').splitlines():
            try: trace_fields(json.loads(line), findings)
            except (ValueError, RecursionError): pass
    elif suffix == '.json':
        try: trace_fields(json.loads(data), findings)
        except (ValueError, RecursionError): pass
    if re.search(rb'(?i)(?:^|&)password=[^&\s]+', data): findings.add('PASSWORD_FORM_VALUE')

def scan(path):
    findings, review = set(), set()
    suffix = path.suffix.lower()
    if suffix in ('.zip', '.xlsx', '.docx'):
        try:
            with zipfile.ZipFile(path) as archive:
                total = 0
                for info in archive.infolist():
                    if info.is_dir(): continue
                    total += info.file_size
                    if info.file_size > 128*1024*1024 or total > 512*1024*1024:
                        review.add('ARCHIVE_SCAN_SIZE_LIMIT'); break
                    if info.flag_bits & 1: review.add('ENCRYPTED_ARCHIVE'); continue
                    body = archive.read(info)
                    scan_bytes(body, pathlib.PurePosixPath(info.filename).suffix.lower(), findings)
        except (zipfile.BadZipFile, RuntimeError, OSError): review.add('UNREADABLE_ARCHIVE')
    else:
        scan_bytes(path.read_bytes(), suffix, findings)
    if suffix in ('.pdf', '.psd', '.xlsx', '.xls', '.docx'):
        review.add('BUSINESS_BINARY_REQUIRES_HUMAN_REVIEW')
    return {'findings': sorted(findings), 'review': sorted(review),
            'status': 'REJECT' if findings else 'REVIEW' if review else 'PASS',
            'scope': 'Pattern/structured-field scan; no claim of image OCR or arbitrary encoded-secret detection'}

if __name__ == '__main__':
    sys.stdin.reconfigure(encoding='utf-8')
    sys.stdout.reconfigure(encoding='utf-8')
    request = json.load(sys.stdin)
    root = pathlib.Path(request['root']).resolve()
    out = []
    for name in request['paths']:
        p = (root / name).resolve()
        if root not in p.parents or not p.is_file():
            out.append({'path': name, 'status': 'REJECT', 'findings': ['INVALID_SCAN_PATH'], 'review': []})
            continue
        try: result = scan(p)
        except Exception: result = {'status': 'REVIEW', 'findings': [], 'review': ['SCANNER_UNREADABLE_INPUT']}
        out.append({'path': name, **result})
    json.dump({'schemaVersion': 1, 'results': out, 'secretValuesIncluded': False}, sys.stdout)
