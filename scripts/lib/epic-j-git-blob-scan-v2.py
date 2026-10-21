"""Local outgoing Git object scan. Raw blob bytes never leave this process or enter a checkout."""
import hashlib,importlib.util,io,json,pathlib,subprocess,sys,zipfile
sys.stdin.reconfigure(encoding='utf8');sys.stdout.reconfigure(encoding='utf8')
request=json.load(sys.stdin);root=pathlib.Path(request['root']);spec=importlib.util.spec_from_file_location('scanner',root/'scripts/lib/epic-j-evidence-scan.py');scanner=importlib.util.module_from_spec(spec);spec.loader.exec_module(scanner)
rows=[]
process=subprocess.Popen(['git','cat-file','--batch'],cwd=root,stdin=subprocess.PIPE,stdout=subprocess.PIPE)
for row in request['blobs']:
    process.stdin.write((row['oid']+'\n').encode('ascii'));process.stdin.flush();header=process.stdout.readline().split();assert len(header)==3 and header[1]==b'blob';size=int(header[2]);b=process.stdout.read(size);assert len(b)==size and process.stdout.read(1)==b'\n';suffix=pathlib.PurePosixPath(row['path']).suffix.lower();findings=set();review=set()
    if suffix in ['.zip','.xlsx','.docx']:
        try:
            with zipfile.ZipFile(io.BytesIO(b)) as z:
                total=0
                for info in z.infolist():
                    if info.is_dir():continue
                    total+=info.file_size
                    if total>512*1024*1024 or info.file_size>128*1024*1024:review.add('ARCHIVE_SCAN_SIZE_LIMIT');break
                    if info.flag_bits&1:review.add('ENCRYPTED_ARCHIVE');continue
                    scanner.scan_bytes(z.read(info),pathlib.PurePosixPath(info.filename).suffix.lower(),findings)
        except (zipfile.BadZipFile,RuntimeError,OSError):review.add('UNREADABLE_ARCHIVE')
    else:scanner.scan_bytes(b,suffix,findings)
    if suffix in ['.pdf','.psd','.xlsx','.xls','.docx']:review.add('BUSINESS_BINARY_REQUIRES_HUMAN_REVIEW')
    rows.append({'path':row['path'],'oid':row['oid'],'sha256':hashlib.sha256(b).hexdigest(),'status':'REJECT' if findings else 'REVIEW' if review else 'PASS','findings':sorted(findings),'review':sorted(review)})
process.stdin.close();assert process.wait()==0
json.dump({'results':rows,'secretValuesIncluded':False},sys.stdout)
