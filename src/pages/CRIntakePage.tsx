import { useState } from 'react';
import { sampleCRs } from '../data/sampleCRs';
import type { CRIntake } from '../types';
import { loadTemplates, upsertDraft } from '../storage/local';
import { makeDraft } from '../utils/draft';
const empty:CRIntake={crNumber:'',crTitle:'',assetNumber:'',componentDescription:'',location:'',problemStatement:'',discoveredCondition:'',requestedAction:'',discipline:'Generic',workType:'Generic Work',priority:'Normal',safetySignificance:false,requiresClearance:false,requiresEngineeringInput:false,requiresParts:false,requiresScaffoldOrLift:false,notes:''};
export default function CRIntakePage(){const [f,setF]=useState<CRIntake>(empty);
const set=(k:keyof CRIntake,v:string|boolean)=>setF({...f,[k]:v});
const save=()=>upsertDraft(makeDraft(f,loadTemplates()));
return <div className='space-y-3'><h2 className='text-xl font-semibold'>CR Intake</h2><div className='grid md:grid-cols-2 gap-2'>{Object.entries(f).filter(([k,v])=>typeof v==='string').map(([k,v])=><label key={k} className='text-sm'>{k}<input className='input' value={v as string} onChange={e=>set(k as keyof CRIntake,e.target.value)} /></label>)}</div><div className='grid md:grid-cols-3 gap-2'>{['safetySignificance','requiresClearance','requiresEngineeringInput','requiresParts','requiresScaffoldOrLift'].map(k=><label key={k}><input type='checkbox' checked={f[k as keyof CRIntake] as boolean} onChange={e=>set(k as keyof CRIntake,e.target.checked)}/> {k}</label>)}</div><div className='flex gap-2'><button className='btn' onClick={save}>Generate Draft Work Order</button><button className='btn' onClick={save}>Save Draft</button><button className='btn' onClick={()=>setF(sampleCRs[0].intake)}>Load Sample CR</button><button className='btn' onClick={()=>setF(empty)}>Clear Form</button></div></div>}
