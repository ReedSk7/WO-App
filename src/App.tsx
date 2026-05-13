import { Link, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import CRIntakePage from './pages/CRIntakePage';
import DraftReviewPage from './pages/DraftReviewPage';
import FieldBuilderPage from './pages/FieldBuilderPage';
import ChecklistPage from './pages/ChecklistPage';
import SampleLibraryPage from './pages/SampleLibraryPage';
import SettingsPage from './pages/SettingsPage';
import { loadTheme, saveTheme } from './storage/local';

export default function App(){
  const [theme,setTheme]=useState(loadTheme());
  useEffect(()=>{document.documentElement.classList.toggle('dark',theme==='dark'); saveTheme(theme);},[theme]);
  const nav=[['/','Dashboard'],['/intake','CR Intake'],['/draft','Draft Review'],['/fields','Maximo Field Builder'],['/checklist','Planning Checklist'],['/samples','Sample CR Library'],['/settings','Settings']];
  return <div className='min-h-screen md:flex'>
    <aside className='md:w-64 p-4 bg-slate-800 text-white'><h1 className='font-bold mb-4'>Work Order Agent Companion</h1>{nav.map(([to,label])=><Link key={to} to={to} className='block py-1'>{label}</Link>)}<button className='mt-4 btn' onClick={()=>setTheme(theme==='dark'?'light':'dark')}>{theme==='dark'?'Light':'Dark'} Mode</button></aside>
    <main className='flex-1 p-4'><Routes><Route path='/' element={<Dashboard/>}/><Route path='/intake' element={<CRIntakePage/>}/><Route path='/draft' element={<DraftReviewPage/>}/><Route path='/fields' element={<FieldBuilderPage/>}/><Route path='/checklist' element={<ChecklistPage/>}/><Route path='/samples' element={<SampleLibraryPage/>}/><Route path='/settings' element={<SettingsPage/>}/></Routes></main>
  </div>
}
