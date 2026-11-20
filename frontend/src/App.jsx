import React, { useEffect, useState } from 'react';
import {
  Sprout, LayoutDashboard, CloudSun, Droplets, Leaf, BarChart3, Settings,
  Search, Bell, MapPin, Thermometer, Waves, Wind, ArrowUpRight, CheckCircle2,
  Clock3, AlertTriangle, ChevronDown, Sun, CloudRain, Menu
} from 'lucide-react';

const API = 'http://127.0.0.1:5000/api';

function App() {
  const [data, setData] = useState(null);
  const [weather, setWeather] = useState(null);
  const [active, setActive] = useState('Overview');
  const [city, setCity] = useState('Hyderabad');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState('');
  const [cropForm, setCropForm] = useState({name:'',field:'',stage:'Seedling',health:80});
  const [irrigationForm, setIrrigationForm] = useState({field:'',date:new Date().toISOString().slice(0,10),time:'08:00',duration:20});
  const [message, setMessage] = useState('');
  const [analytics, setAnalytics] = useState(null);

  async function loadData() {
    setLoading(true);
    try {
      const [d, w] = await Promise.all([
        fetch(`${API}/dashboard`).then(r => r.json()),
        fetch(`${API}/weather?city=${encodeURIComponent(city)}`).then(r => r.json())
      ]);
      setData(d); setWeather(w);
    } catch (e) {
      setData(null); setWeather(null);
    } finally { setLoading(false); }
  }
  useEffect(() => { loadData(); }, []);

  async function api(path, options={}) {
    const response = await fetch(`${API}${path}`, {headers:{'Content-Type':'application/json'}, ...options});
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Request failed');
    return result;
  }
  async function saveCrop(e) { e.preventDefault(); try { await api('/crops',{method:'POST',body:JSON.stringify(cropForm)}); setModal(''); setCropForm({name:'',field:'',stage:'Seedling',health:80}); setMessage('Crop saved successfully'); await loadData(); } catch(err){setMessage(err.message);} }
  async function saveIrrigation(e) { e.preventDefault(); try { await api('/irrigation',{method:'POST',body:JSON.stringify(irrigationForm)}); setModal(''); setIrrigationForm({field:'',date:new Date().toISOString().slice(0,10),time:'08:00',duration:20}); setMessage('Irrigation schedule saved successfully'); await loadData(); } catch(err){setMessage(err.message);} }
  async function removeItem(path) { if(!confirm('Delete this record?')) return; try { await api(path,{method:'DELETE'}); setMessage('Record deleted'); await loadData(); if(active==='Analytics') setAnalytics(await api('/analytics')); } catch(err){setMessage(err.message);} }
  async function showAnalytics(){ setActive('Analytics'); try{setAnalytics(await api('/analytics'));}catch(err){setMessage(err.message);} }

  const nav = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'My Crops', icon: Sprout },
    { name: 'Irrigation', icon: Droplets },
    { name: 'Weather', icon: CloudSun },
    { name: 'Analytics', icon: BarChart3 }
  ];
  const crops = data?.crops || [];
  const recommendations = data?.recommendations || [];
  const irrigation = data?.irrigation || [];

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><Sprout size={23}/></div><div><b>AgriSense</b><small>SMART FARMING</small></div></div>
      <div className="farm-switch"><div className="farm-avatar">GV</div><div className="farm-label"><b>{data?.farm?.name || 'Green Valley Farm'}</b><small>{data?.farm?.location || 'Telangana, India'}</small></div><ChevronDown size={16}/></div>
      <span className="nav-caption">WORKSPACE</span>
      <nav>{nav.map(item => <button key={item.name} className={`nav-item ${active===item.name?'selected':''}`} onClick={()=>setActive(item.name)}><item.icon size={18}/><span>{item.name}</span>{item.name==='Irrigation'&&<i>{irrigation.length}</i>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><Sprout size={18}/></div><b>Growing better, together.</b><p>Small insights can make a big difference to your harvest.</p><button onClick={showAnalytics}>Explore insights <ArrowUpRight size={14}/></button></div><button className="nav-item"><Settings size={18}/><span>Settings</span></button><div className="profile"><div className="profile-avatar">RK</div><div><b>Ravi Kumar</b><small>Farm Manager</small></div><ChevronDown size={16}/></div></div>
    </aside>

    <main className="main">
      <header className="topbar"><div className="mobile-brand"><Sprout size={22}/> AgriSense</div><div className="breadcrumb">Farm Management <span>/</span> <b>{active}</b></div><div className="top-actions"><label className="search"><Search size={16}/><input placeholder="Search anything..." /></label><button className="icon-btn" aria-label="Notifications"><Bell size={19}/><em></em></button><div className="top-avatar">RK</div></div></header>
      <div className="content">
        <div className="welcome-row"><div><div className="eyebrow"><span className="live-dot"></span> YOUR FARM AT A GLANCE</div><h1>{active==='Overview'?'Good afternoon, Ravi':active}</h1><p className="subhead">Here’s what’s happening across your farm today.</p></div><button className="date-button"><Clock3 size={16}/> {new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})} <ChevronDown size={15}/></button></div>
        {loading && <div className="notice">Connecting to your farm dashboard…</div>}
        {!loading && !data && <div className="notice warning"><AlertTriangle size={18}/> Could not reach the backend. Start Flask at <code>127.0.0.1:5000</code> and refresh.</div>}

        <section className="stats-grid">
          <div className="stat-card"><div className="stat-top"><span>Total farm area</span><span className="stat-icon green"><Sprout size={18}/></span></div><div className="stat-value">{data?.farm?.area_acres ?? '—'} <small>acres</small></div><div className="stat-foot"><span className="positive"><ArrowUpRight size={14}/> Active farm</span><span>Across 3 fields</span></div></div>
          <div className="stat-card"><div className="stat-top"><span>Average crop health</span><span className="stat-icon mint"><Leaf size={18}/></span></div><div className="stat-value">{crops.length?Math.round(crops.reduce((s,c)=>s+c.health,0)/crops.length):'—'}<small>/100</small></div><div className="progress"><span style={{width:`${crops.length?Math.round(crops.reduce((s,c)=>s+c.health,0)/crops.length):0}%`}}/></div><div className="stat-foot"><span className="positive"><CheckCircle2 size={14}/> Looking healthy</span><span>Across listed crops</span></div></div>
          <div className="stat-card"><div className="stat-top"><span>Soil moisture</span><span className="stat-icon blue"><Droplets size={18}/></span></div><div className="stat-value">{data?.soil?.moisture_percent ?? '—'}<small>%</small></div><div className="progress blue-progress"><span style={{width:`${data?.soil?.moisture_percent||0}%`}}/></div><div className="stat-foot"><span className="muted">Latest reading</span><span>Sensor/demo data</span></div></div>
          <div className="stat-card weather-stat"><div className="stat-top"><span>Local weather</span><span className="stat-icon sun"><Sun size={18}/></span></div><div className="weather-line"><div className="stat-value">{weather?.temperature_c ?? '—'}<small>°C</small></div><CloudSun size={32} className="weather-large"/></div><div className="stat-foot"><span>{weather?.condition || 'Weather unavailable'}</span><span><MapPin size={12}/> {weather?.city || city}</span></div></div>
        </section>

        <section className="middle-grid">
          <div className="panel crop-panel"><div className="panel-heading"><div><h2>Crop overview</h2><p>Monitor the health of your growing crops.</p></div><button className="text-button" onClick={()=>setActive('My Crops')}>View all <ArrowUpRight size={15}/></button></div>
            <div className="crop-table"><div className="table-head"><span>CROP / FIELD</span><span>GROWTH STAGE</span><span>HEALTH SCORE</span></div>
              {crops.map((crop,i)=><div className="crop-row" key={crop.name}><div className="crop-name"><div className={`crop-symbol crop-${i}`}><Sprout size={19}/></div><div><b>{crop.name}</b><small>{crop.field}</small></div></div><span className="stage-pill">{crop.stage}</span><div className="health-cell"><div className="health-number">{crop.health}<small>/100</small></div><div className="mini-progress"><span style={{width:`${crop.health}%`}}/></div></div></div>)}
              {!crops.length&&<div className="empty">No crop records yet.</div>}
            </div>
          </div>
          <div className="panel weather-panel"><div className="panel-heading"><div><h2>Weather outlook</h2><p>Conditions for your farm location.</p></div><button className="dots">···</button></div>
            <div className="weather-hero"><div><span className="weather-condition">{weather?.condition || 'Partly cloudy'}</span><div className="hero-temp">{weather?.temperature_c ?? '—'}°<span>C</span></div><div className="weather-location"><MapPin size={13}/> {weather?.city || city}</div></div><div className="sun-art"><Sun size={58} strokeWidth={1.3}/><span></span></div></div>
            <div className="weather-details"><div><Thermometer size={16}/><span>Humidity</span><b>{weather?.humidity_percent ?? '—'}%</b></div><div><CloudRain size={16}/><span>Rain chance</span><b>{weather?.rain_chance_percent == null ? '—' : `${weather.rain_chance_percent}%`}</b></div><div><Wind size={16}/><span>Soil temp.</span><b>{data?.soil?.temperature_c ?? '—'}°C</b></div></div>
            <div className="weather-note"><span className="note-dot"></span>{weather?.source?.includes('Demo') ? 'Demo weather shown. Add an API key for live conditions.' : 'Check local forecasts before scheduling irrigation.'}</div>
          </div>
        </section>

        <section className="bottom-grid">
          <div className="panel irrigation-panel"><div className="panel-heading"><div><h2>Irrigation schedule</h2><p>Upcoming watering activities.</p></div><button className="text-button" onClick={()=>setActive('Irrigation')}>Manage <ArrowUpRight size={15}/></button></div>
            {irrigation.map((item,i)=><div className="irrigation-row" key={item.field}><div className={`irrigation-icon ${i===0?'water':'water-light'}`}><Droplets size={18}/></div><div className="irrigation-info"><b>{item.field}</b><small><Clock3 size={12}/> {item.date} · {item.time} · {item.duration} min</small></div><span className={`status ${item.status==='Scheduled'?'scheduled':'recommended'}`}>{item.status}</span></div>)}
            <button className="add-schedule" onClick={()=>setModal('irrigation')}>＋ Add irrigation schedule</button>
          </div>
          <div className="panel recommendations-panel"><div className="panel-heading"><div><h2>Smart recommendations</h2><p>Suggested actions for your farm.</p></div><span className="ai-badge"><SparkleIcon/> AI ASSIST</span></div>
            {recommendations.map((r,i)=><div className="recommendation" key={r.title}><div className={`recommend-icon rec-${i}`}><CheckCircle2 size={17}/></div><div className="recommend-copy"><div className="recommend-title">{r.title}<span className={`priority ${r.priority.toLowerCase()}`}>{r.priority}</span></div><p>{r.detail}</p></div></div>)}
          </div>
        </section>
        {active==='My Crops' && <section className="panel management-panel"><div className="panel-heading"><div><h2>Manage crops</h2><p>Add crops and remove records stored in your local SQLite database.</p></div><button className="primary-action" onClick={()=>setModal('crop')}>＋ Add crop</button></div>{crops.map(c=><div className="manage-row" key={c.id}><div><b>{c.name}</b><small>{c.field} · {c.stage} · Health {c.health}/100</small></div><button className="danger-action" onClick={()=>removeItem(`/crops/${c.id}`)}>Delete</button></div>)}</section>}
        {active==='Irrigation' && <section className="panel management-panel"><div className="panel-heading"><div><h2>Manage irrigation</h2><p>Create and delete watering schedules.</p></div><button className="primary-action" onClick={()=>setModal('irrigation')}>＋ Add schedule</button></div>{irrigation.map(x=><div className="manage-row" key={x.id}><div><b>{x.field}</b><small>{x.date} at {x.time} · {x.duration} minutes · {x.status}</small></div><button className="danger-action" onClick={()=>removeItem(`/irrigation/${x.id}`)}>Delete</button></div>)}</section>}
        {active==='Weather' && <section className="panel management-panel"><div className="panel-heading"><div><h2>Farm weather</h2><p>Enter a city to refresh weather. Without an API key, clearly labelled demo readings are shown.</p></div></div><form className="inline-form" onSubmit={e=>{e.preventDefault();loadData();}}><input value={city} onChange={e=>setCity(e.target.value)} placeholder="City"/><button className="primary-action">Refresh weather</button></form><p>{weather?.source}</p></section>}
        {active==='Analytics' && <section className="panel management-panel"><div className="panel-heading"><div><h2>Farm analytics</h2><p>Live summaries calculated from your saved SQLite records.</p></div><button className="primary-action" onClick={showAnalytics}>Refresh</button></div><div className="analytics-grid"><div><b>{analytics?.crop_count ?? crops.length}</b><small>Total crops</small></div><div><b>{analytics?.average_health ?? (crops.length?Math.round(crops.reduce((a,c)=>a+c.health,0)/crops.length):0)}%</b><small>Average crop health</small></div><div><b>{analytics?.schedule_count ?? irrigation.length}</b><small>Irrigation schedules</small></div><div><b>{analytics?.scheduled_minutes ?? irrigation.reduce((a,x)=>a+x.duration,0)}</b><small>Watering minutes</small></div></div></section>}
        {message && <div className="toast-message" onClick={()=>setMessage('')}>{message}　×</div>}
        {modal && <div className="modal-backdrop" onClick={()=>setModal('')}><div className="modal-card" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setModal('')}>×</button>{modal==='crop' ? <><h2>Add crop</h2><form onSubmit={saveCrop}><label>Crop name<input required value={cropForm.name} onChange={e=>setCropForm({...cropForm,name:e.target.value})}/></label><label>Field<input required value={cropForm.field} onChange={e=>setCropForm({...cropForm,field:e.target.value})}/></label><label>Growth stage<select value={cropForm.stage} onChange={e=>setCropForm({...cropForm,stage:e.target.value})}><option>Seedling</option><option>Vegetative</option><option>Flowering</option><option>Fruiting</option><option>Harvesting</option></select></label><label>Health score (0–100)<input type="number" min="0" max="100" value={cropForm.health} onChange={e=>setCropForm({...cropForm,health:e.target.value})}/></label><button className="primary-action">Save crop</button></form></> : <><h2>Add irrigation schedule</h2><form onSubmit={saveIrrigation}><label>Field / crop<input required placeholder="Field A · Rice" value={irrigationForm.field} onChange={e=>setIrrigationForm({...irrigationForm,field:e.target.value})}/></label><label>Date<input required type="date" value={irrigationForm.date} onChange={e=>setIrrigationForm({...irrigationForm,date:e.target.value})}/></label><label>Time<input required type="time" value={irrigationForm.time} onChange={e=>setIrrigationForm({...irrigationForm,time:e.target.value})}/></label><label>Duration (minutes)<input required type="number" min="1" max="600" value={irrigationForm.duration} onChange={e=>setIrrigationForm({...irrigationForm,duration:e.target.value})}/></label><button className="primary-action">Save schedule</button></form></>}</div></div>}
        <footer>AgriSense <span>·</span> Smart decisions for a healthier harvest <span className="footer-right">Data shown may include demo values</span></footer>
      </div>
    </main>
  </div>;
}
function SparkleIcon(){return <span className="sparkle">✦</span>}
export default App;
