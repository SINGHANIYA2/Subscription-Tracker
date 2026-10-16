import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  isSameMonth, isSameDay, addMonths, parseISO, differenceInCalendarDays } from 'date-fns';
import './styles.css';

export const Button = ({ variant = '', small, ...p }) =>
  <button className={`btn ${variant} ${small ? 'small' : ''}`} {...p} />;

export const Card = ({ className = '', children }) =>
  <div className={`card ${className}`}>{children}</div>;

export const Modal = ({ title, onClose, children }) => (
  <div className="overlay" onClick={onClose}>
    <Card className="modal" >
      <div onClick={e => e.stopPropagation()} style={{ display: 'contents' }}>
        <h2>{title}</h2>{children}
      </div>
    </Card>
  </div>
);

export const Navbar = ({ page, go, dark, toggleDark, logout }) => (
  <nav className="nav">
    <div className="logo">subtrack</div>
    {[['dash', 'Home'], ['subs', 'Subscriptions'], ['cal', 'Calendar'], ['me', 'Profile']].map(([k, l]) =>
      <button key={k} className={`item ${page === k ? 'on' : ''}`} onClick={() => go(k)}>{l}</button>)}
    <div className="spacer" />
    <button className="item" onClick={toggleDark}>{dark ? 'Light mode' : 'Dark mode'}</button>
    <button className="item" onClick={logout}>Log out</button>
  </nav>
);

const Field = ({ label, error, ...p }) => (
  <div className={`field ${error ? 'bad' : ''}`}>
    <label>{label}</label>
    {p.options
      ? <select {...p}>{p.options.map(o => <option key={o}>{o}</option>)}</select>
      : <input {...p} />}
    {error && <span className="err">{error}</span>}
  </div>
);

const emailOk = v => /^\S+@\S+\.\S+$/.test(v);
const validateAuth = (f, isRegister) => {
  const e = {};
  if (isRegister && f.name.trim().length < 2) e.name = 'Tell us your name (at least 2 letters).';
  if (!emailOk(f.email)) e.email = 'That email doesn\u2019t look right.';
  if (f.password.length < 8) e.password = 'Use at least 8 characters.';
  if (isRegister && f.confirm !== f.password) e.confirm = 'Passwords don\u2019t match.';
  return e;
};
const validateSub = f => {
  const e = {};
  if (!f.name.trim()) e.name = 'Give this subscription a name.';
  if (!(Number(f.price) > 0)) e.price = 'Enter what you pay, more than 0.';
  if (!f.date) e.date = 'Pick the next payment date.';
  return e;
};


function Auth({ onDone }) {
  const [reg, setReg] = useState(false);
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' });
  const [err, setErr] = useState({});
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = ev => {
    ev.preventDefault();
    const e = validateAuth(f, reg);
    setErr(e);
    if (!Object.keys(e).length) onDone({ name: f.name || f.email.split('@')[0], email: f.email });
  };
  return (
    <div className="auth">
      <div className="auth-art">
        <h1>Stop paying for things you forgot about.</h1>
        <p>Every renewal in one place, with a heads-up before it hits your card.</p>
      </div>
      <form className="auth-form" onSubmit={submit} noValidate>
        <h1>{reg ? 'Create your account' : 'Welcome back'}</h1>
        {reg && <Field label="Name" value={f.name} onChange={set('name')} error={err.name} />}
        <Field label="Email" type="email" value={f.email} onChange={set('email')} error={err.email} />
        <Field label="Password" type="password" value={f.password} onChange={set('password')} error={err.password} />
        {reg && <Field label="Confirm password" type="password" value={f.confirm} onChange={set('confirm')} error={err.confirm} />}
        <Button type="submit">{reg ? 'Sign up' : 'Log in'}</Button>
        <p className="muted">{reg ? 'Already have an account?' : 'New here?'}{' '}
          <button type="button" className="link" onClick={() => { setReg(!reg); setErr({}); }}>
            {reg ? 'Log in' : 'Create an account'}</button></p>
      </form>
    </div>
  );
}


const CATS = ['Entertainment', 'Music', 'Work', 'Cloud', 'Learning', 'Other'];
const COLORS = ['#3d33a6', '#b8408f', '#2c9c86', '#e08a1e', '#d64550', '#4a7fd4'];

function SubForm({ initial, onSave, onClose }) {
  const [f, setF] = useState(initial || { name: '', price: '', cycle: 'Monthly', category: 'Entertainment', date: '' });
  const [err, setErr] = useState({});
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const save = () => {
    const e = validateSub(f); setErr(e);
    if (!Object.keys(e).length) onSave({ ...f, price: Number(f.price) });
  };
  return (
    <Modal title={initial ? 'Edit subscription' : 'Add a subscription'} onClose={onClose}>
      <Field label="Name" value={f.name} onChange={set('name')} error={err.name} />
      <div className="row">
        <Field label="Price (\u20B9)" type="number" value={f.price} onChange={set('price')} error={err.price} />
        <Field label="Billed" options={['Monthly', 'Yearly']} value={f.cycle} onChange={set('cycle')} />
      </div>
      <div className="row">
        <Field label="Category" options={CATS} value={f.category} onChange={set('category')} />
        <Field label="Next payment" type="date" value={f.date} onChange={set('date')} error={err.date} />
      </div>
      <div className="row end">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={save}>{initial ? 'Save changes' : 'Add subscription'}</Button>
      </div>
    </Modal>
  );
}

const monthly = s => (s.cycle === 'Yearly' ? s.price / 12 : s.price);
const inr = n => '\u20B9' + Math.round(n).toLocaleString('en-IN');
const daysLeft = s => differenceInCalendarDays(parseISO(s.date), new Date());

function Dashboard({ subs }) {
  const total = subs.reduce((a, s) => a + monthly(s), 0);
  const soon = subs.filter(s => daysLeft(s) >= 0 && daysLeft(s) <= 7);
  const byCat = CATS.map(c => ({ c, v: Math.round(subs.filter(s => s.category === c).reduce((a, s) => a + monthly(s), 0)) })).filter(x => x.v);
  return (<>
    <div className="grid stats">
      <Card className="hero-card"><p>Spending each month</p><div className="big">{inr(total)}</div>
        <p>{inr(total * 12)} over a year</p></Card>
      <Card><p className="muted">Active subscriptions</p><div className="big">{subs.length}</div></Card>
      <Card><p className="muted">Renewing this week</p><div className="big">{soon.length}</div></Card>
    </div>
    <div className="grid two">
      <Card><h2>Where the money goes</h2>
        <div style={{ height: 220, marginTop: 12 }}>
          <ResponsiveContainer><BarChart data={byCat}>
            <XAxis dataKey="c" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={v => inr(v)} cursor={{ fill: 'transparent' }} />
            <Bar dataKey="v" radius={[8, 8, 0, 0]}>{byCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar>
          </BarChart></ResponsiveContainer></div></Card>
      <Card><h2>Coming up</h2>
        {soon.length ? soon.map(s => <p key={s.id} style={{ marginTop: 10 }}><b>{s.name}</b> <span className="muted">
          {daysLeft(s) === 0 ? 'today' : `in ${daysLeft(s)} days`} \u00B7 {inr(s.price)}</span></p>)
          : <p className="muted" style={{ marginTop: 10 }}>Nothing due this week. Enjoy it.</p>}</Card>
    </div>
  </>);
}

function Subs({ subs, onAdd, onEdit, onDelete }) {
  const [view, setView] = useState('cards');
  const [q, setQ] = useState('');
  const list = subs.filter(s => s.name.toLowerCase().includes(q.toLowerCase()));
  return (<>
    <div className="top"><h1>Subscriptions</h1>
      <div className="row" style={{ flex: 'none' }}>
        <Button variant="ghost" onClick={() => setView(view === 'cards' ? 'table' : 'cards')}>{view === 'cards' ? 'Table view' : 'Card view'}</Button>
        <Button onClick={onAdd}>Add new</Button></div></div>
    <div className="field"><input placeholder="Search by name" value={q} onChange={e => setQ(e.target.value)} /></div>
    {!list.length && <Card><p className="muted">No subscriptions match. Try a different name, or add a new one.</p></Card>}
    {view === 'cards' ? (
      <div className="grid subs">{list.map((s, i) => (
        <Card key={s.id} className="sub-card">
          <div className="row" style={{ alignItems: 'center' }}>
            <div className="dot" style={{ background: COLORS[i % COLORS.length], flex: 'none' }}>{s.name[0]}</div>
            <div><h3>{s.name}</h3><span className="muted">{s.category}</span></div></div>
          <div><b style={{ fontSize: '1.2rem' }}>{inr(s.price)}</b> <span className="muted">/ {s.cycle === 'Yearly' ? 'year' : 'month'}</span></div>
          <span className={`pill ${daysLeft(s) <= 7 && daysLeft(s) >= 0 ? 'soon' : ''}`}>Next: {format(parseISO(s.date), 'd MMM yyyy')}</span>
          <div className="row"><Button small variant="ghost" onClick={() => onEdit(s)}>Edit</Button>
            <Button small variant="danger" onClick={() => onDelete(s.id)}>Delete</Button></div>
        </Card>))}</div>
    ) : (
      <Card className="scroll"><table><thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Next payment</th><th /></tr></thead>
        <tbody>{list.map(s => <tr key={s.id}><td>{s.name}</td><td>{s.category}</td>
          <td>{inr(s.price)} / {s.cycle === 'Yearly' ? 'yr' : 'mo'}</td><td>{format(parseISO(s.date), 'd MMM yyyy')}</td>
          <td><Button small variant="ghost" onClick={() => onEdit(s)}>Edit</Button>{' '}
            <Button small variant="danger" onClick={() => onDelete(s.id)}>Delete</Button></td></tr>)}</tbody></table></Card>
    )}
  </>);
}

function Calendar({ subs }) {
  const [cur, setCur] = useState(new Date());
  const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(cur)), end: endOfWeek(endOfMonth(cur)) });
  const due = d => subs.filter(s => {
    const p = parseISO(s.date);
    return s.cycle === 'Yearly' ? p.getMonth() === d.getMonth() && p.getDate() === d.getDate() : p.getDate() === d.getDate();
  });
  return (<>
    <div className="top"><h1>{format(cur, 'MMMM yyyy')}</h1>
      <div className="row" style={{ flex: 'none' }}>
        <Button variant="ghost" onClick={() => setCur(addMonths(cur, -1))}>Prev</Button>
        <Button variant="ghost" onClick={() => setCur(new Date())}>Today</Button>
        <Button variant="ghost" onClick={() => setCur(addMonths(cur, 1))}>Next</Button></div></div>
    <Card><div className="cal">
      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="head">{d}</div>)}
      {days.map(d => <div key={d.toISOString()} className={`day ${isSameDay(d, new Date()) ? 'today' : ''} ${isSameMonth(d, cur) ? '' : 'off'}`}>
        {format(d, 'd')}{isSameMonth(d, cur) && due(d).map(s => <span key={s.id} className="tag">{s.name}</span>)}</div>)}
    </div></Card>
  </>);
}

function Profile({ user, setUser }) {
  const [f, setF] = useState(user);
  const [err, setErr] = useState({});
  const [saved, setSaved] = useState(false);
  const save = () => {
    const e = {};
    if (f.name.trim().length < 2) e.name = 'Name needs at least 2 letters.';
    if (!emailOk(f.email)) e.email = 'That email doesn\u2019t look right.';
    setErr(e); setSaved(false);
    if (!Object.keys(e).length) { setUser(f); setSaved(true); }
  };
  return (<>
    <h1>Your profile</h1>
    <Card className="modal" style={{ maxWidth: 460 }}>
      <Field label="Name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} error={err.name} />
      <Field label="Email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} error={err.email} />
      <div className="row" style={{ alignItems: 'center' }}><Button onClick={save}>Save changes</Button>
        {saved && <span className="muted">Saved.</span>}</div>
    </Card>
  </>);
}

const seed = [
  { id: 1, name: 'Netflix', price: 649, cycle: 'Monthly', category: 'Entertainment', date: format(new Date(Date.now() + 3 * 864e5), 'yyyy-MM-dd') },
  { id: 2, name: 'Spotify', price: 119, cycle: 'Monthly', category: 'Music', date: format(new Date(Date.now() + 11 * 864e5), 'yyyy-MM-dd') },
  { id: 3, name: 'Notion', price: 4000, cycle: 'Yearly', category: 'Work', date: format(new Date(Date.now() + 40 * 864e5), 'yyyy-MM-dd') },
  { id: 4, name: 'Google One', price: 130, cycle: 'Monthly', category: 'Cloud', date: format(new Date(Date.now() + 6 * 864e5), 'yyyy-MM-dd') },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dash');
  const [dark, setDark] = useState(false);
  const [subs, setSubs] = useState(seed);
  const [editing, setEditing] = useState(null); // null | 'new' | sub

  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; }, [dark]);

  if (!user) return <Auth onDone={setUser} />;

  const save = s => {
    setSubs(editing === 'new' ? [...subs, { ...s, id: Date.now() }] : subs.map(x => x.id === editing.id ? { ...s, id: x.id } : x));
    setEditing(null);
  };
  return (
    <div className="shell">
      <Navbar page={page} go={setPage} dark={dark} toggleDark={() => setDark(!dark)} logout={() => setUser(null)} />
      <main>
        {page === 'dash' && <><h1>Hi {user.name.split(' ')[0]}</h1><Dashboard subs={subs} /></>}
        {page === 'subs' && <Subs subs={subs} onAdd={() => setEditing('new')} onEdit={setEditing}
          onDelete={id => window.confirm('Delete this subscription?') && setSubs(subs.filter(s => s.id !== id))} />}
        {page === 'cal' && <Calendar subs={subs} />}
        {page === 'me' && <Profile user={user} setUser={setUser} />}
      </main>
      {editing && <SubForm initial={editing === 'new' ? null : editing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  );
}
