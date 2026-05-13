import { sampleCRs } from '../data/sampleCRs';
export default function SampleLibraryPage(){return <div className='space-y-2'>{sampleCRs.map(s=><div className='card' key={s.id}><b>{s.name}</b><div>{s.intake.crNumber} | {s.intake.assetNumber}</div></div>)}</div>}
