import { useState } from 'react';

export default function Home() {
  const [code, setCode] = useState('');
  const [file, setFile] = useState<File|null>(null);
  const [scanId, setScanId] = useState<string|null>(null);

  async function createScan() {
    const form = new FormData();
    if (file) form.append('file', file);
    else form.append('code', code);
    const res = await fetch('http://localhost:3001/scan', { method: 'POST', body: form });
    const data = await res.json();
    setScanId(data.scanId);
  }

  return (
    <main style={{maxWidth:800, margin:'40px auto', fontFamily:'system-ui'}}>
      <h1>Smart Contract Security Scanner</h1>
      <p>Upload a Solidity file or paste code, then run a scan.</p>

      <div style={{border:'1px solid #ddd', padding:16, borderRadius:8}}>
        <input type="file" accept=".sol,.zip" onChange={e=>setFile(e.target.files?.[0]||null)} />
        <p style={{textAlign:'center', margin:'8px 0'}}>— or —</p>
        <textarea value={code} onChange={e=>setCode(e.target.value)} rows={12} style={{width:'100%'}} placeholder='// Paste Solidity code here' />
        <button onClick={createScan} style={{marginTop:12}}>Scan</button>
      </div>

      {scanId && (
        <p style={{marginTop:16}}>Scan created. <a href={`/scan/${scanId}`}>View status/results</a></p>
      )}
    </main>
  );
}
