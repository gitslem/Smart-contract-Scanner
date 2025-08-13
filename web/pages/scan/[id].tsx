import { useRouter } from 'next/router';
import useSWR from 'swr';

const fetcher = (url:string)=>fetch(url).then(r=>r.json());

export default function ScanPage(){
  const router = useRouter();
  const { id } = router.query;
  const { data } = useSWR(id ? `http://localhost:3001/scans/${id}` : null, fetcher, { refreshInterval: 2000 });

  if(!id) return null;
  if(!data) return <p>Loading…</p>;

  const { scan, findings } = data;

  return (
    <main style={{maxWidth:900, margin:'40px auto', fontFamily:'system-ui'}}>
      <h1>Scan {scan.id}</h1>
      <p>Status: <strong>{scan.status}</strong></p>
      {scan.report_url && <p><a href={scan.report_url} target="_blank">Open HTML Report</a></p>}

      <table style={{borderCollapse:'collapse', width:'100%'}}>
        <thead><tr><th>Severity</th><th>Tool</th><th>Rule</th><th>Title</th><th>File:Line</th></tr></thead>
        <tbody>
          {findings?.map((f:any)=>(
            <tr key={f.id}>
              <td>{f.severity}</td>
              <td>{f.tool}</td>
              <td>{f.rule_id}</td>
              <td>{f.title}</td>
              <td>{f.file_path}:{f.line_start}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
