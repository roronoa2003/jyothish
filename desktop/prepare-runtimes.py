import json,urllib.request,hashlib,pathlib,subprocess,concurrent.futures,sys,tarfile
ROOT=pathlib.Path(__file__).resolve().parent
CACHE=ROOT/'runtimes';CACHE.mkdir(exist_ok=True)
PIN={
'mac-arm64':('cpython-3.13.16+20261009-aarch64-apple-darwin-install_only_stripped.tar.gz','11785155d0f70e634178219c20925d8f20be00a3da4684fc4f5019dd15602ef7','macosx_11_0_arm64'),
'mac-x64':('cpython-3.13.16+20261009-x86_64-apple-darwin-install_only_stripped.tar.gz','bd085c51e960f00ee33b630e2b13ac90fe90cdc3da25a0f0bc0719b1294920bf','macosx_10_13_x86_64'),
'win-x64':('cpython-3.13.16+20261009-x86_64-pc-windows-msvc-install_only_stripped.tar.gz','3a7adfb69e3ff02a41ed38ac637808532b438ab3c8619af46ca5dbec5c1f5190','win_amd64')}
versions=json.loads((ROOT/'runtime-lock.json').read_text())['packages']
def prepare(item):
 target,(name,digest,platform)=item;dest=CACHE/target;archive=CACHE/name
 if not archive.exists():
  print('Downloading Python for',target,flush=True)
  with urllib.request.urlopen('https://github.com/astral-sh/python-build-standalone/releases/download/20261009/'+urllib.parse.quote(name)) as r,open(archive,'wb') as f:
   while chunk:=r.read(1024*1024):f.write(chunk)
 if hashlib.sha256(archive.read_bytes()).hexdigest()!=digest:raise ValueError('Python archive checksum mismatch: '+target)
 dest.mkdir(exist_ok=True)
 with tarfile.open(archive) as tar:tar.extractall(dest,filter='data')
 libs=dest/'pdf-libs';libs.mkdir(exist_ok=True)
 subprocess.run([sys.executable,'-m','pip','install','--target',str(libs),'--platform',platform,'--python-version','3.13','--implementation','cp','--abi','cp313','--only-binary=:all:','--upgrade','--disable-pip-version-check',*[p+'=='+v for p,v in versions.items()]],check=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
 print('Python + PDF runtime ready:',target,flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:list(pool.map(prepare,PIN.items()))
