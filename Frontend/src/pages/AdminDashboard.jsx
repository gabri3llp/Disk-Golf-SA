import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { fileUrl } from '../api';
import DashboardShell from '../components/DashboardShell';
import Seo from '../components/Seo';

const LABEL = { pending: 'Pending', on_time: 'On time', overdue: 'Overdue' };
const ACTIONS = [
  { value: 'on_time', text: 'Approve' },
  { value: 'overdue', text: 'Mark overdue' },
  { value: 'pending', text: 'Set to pending' },
];

const ProofLink = ({ path }) => {
  if (!path) return <span className="muted">No file</span>;

  const open = async (e) => {
    e.preventDefault();
    if (!path.startsWith('files/')) {
      window.open(fileUrl(path), '_blank');
      return;
    }
    const win = window.open('', '_blank');
    try {
      const { data } = await api.get('/admin/file', { params: { path } });
      win.location = data.url;
    } catch {
      win.close();
      alert('Could not open this file.');
    }
  };

  return <a href={fileUrl(path)} onClick={open}>Proof of Payment</a>;
};

export default function AdminDashboard() {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [regs, setRegs] = useState([]);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [tournament, setTournament] = useState('all');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [p, m, r, ev] = await Promise.all([
        api.get('/admin/payments'),
        api.get('/admin/members'),
        api.get('/admin/registrations'),
        api.get('/events/admin/all'),
      ]);
      setPayments(p.data);
      setMembers(m.data);
      setRegs(r.data);
      setEvents(ev.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load dashboard data');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const matches = (text = '') => text.toLowerCase().includes(search.trim().toLowerCase());

  const changePayment = async (id, status) => {
    if (!status) return;
    try {
      await api.patch(`/admin/payments/${id}`, { status });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update payment');
    }
  };

  const toggleMember = async (m) => {
    try {
      await api.patch(`/admin/members/${m.user_id}`, { status: m.status === 'active' ? 'inactive' : 'active' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update member');
    }
  };

  const removeEvent = async (e) => {
    if (!window.confirm(`Delete "${e.name}"? Its registrations will be removed too.`)) return;
    try {
      await api.delete(`/events/${e.event_id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not delete event');
    }
  };

  const tournaments = useMemo(() => [...new Set(regs.map((r) => r.tournament))], [regs]);

  const shownPayments = payments.filter((p) => matches(p.name));
  const shownMembers = members.filter((m) => matches(m.name));
  const shownRegs = regs.filter((r) => matches(r.name) && (tournament === 'all' || r.tournament === tournament));

  const actions = (
    <>
      <input
        className="dash-search"
        type="search"
        placeholder="Search by name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search by name"
      />
      <Link to="/events/new" className="btn btn-dark">+ Add an Event</Link>
    </>
  );

  return (
    <DashboardShell actions={actions}>
      <Seo title="Dashboard" description="Your Disc Golf South Africa dashboard." noindex />
      {error && <p className="error-msg dash-error">{error}</p>}

      <div className="dash-grid">
        <section className="card feed" aria-labelledby="feed-h">
          <h2 id="feed-h">Live Payment Feed</h2>
          <div className="scroll">
            {shownPayments.length === 0 && <p className="muted">No payments found.</p>}
            {shownPayments.map((p) => (
              <article className="feed-item" key={p.payment_id}>
                <div>
                  <strong>{p.name}</strong>
                  <small className="muted block">
                    {p.type === 'membership' ? 'Membership' : `Event: ${p.event_name}`}
                  </small>
                  <ProofLink path={p.proof_path} />
                </div>
                <div className="feed-side">
                  <span className={`badge ${p.status}`}>● {LABEL[p.status]}</span>
                  <select
                    className="mini-field"
                    value=""
                    onChange={(e) => changePayment(p.payment_id, e.target.value)}
                    aria-label={`Actions for ${p.name}`}
                  >
                    <option value="">Actions</option>
                    {ACTIONS.filter((a) => a.value !== p.status).map((a) => (
                      <option key={a.value} value={a.value}>{a.text}</option>
                    ))}
                  </select>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="card" aria-labelledby="members-h">
          <h2 id="members-h">Member Overview</h2>
          <div className="scroll">
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Tier</th><th>Contact</th><th>Status</th></tr>
              </thead>
              <tbody>
                {shownMembers.map((m) => (
                  <tr key={m.user_id}>
                    <td>{m.name}</td>
                    <td>{m.tier}</td>
                    <td>{m.contact}</td>
                    <td>
                      <button className={`status-btn ${m.status}`} onClick={() => toggleMember(m)} title="Click to change">
                        ● {m.status === 'active' ? 'Active' : 'In active'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card" aria-labelledby="regs-h">
          <div className="card-head">
            <h2 id="regs-h">Tournament Registrations</h2>
            <select
              className="mini-field"
              value={tournament}
              onChange={(e) => setTournament(e.target.value)}
              aria-label="Filter by tournament"
            >
              <option value="all">All tournaments</option>
              {tournaments.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="scroll">
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Tier</th><th>Tournament</th><th>POP</th></tr>
              </thead>
              <tbody>
                {shownRegs.map((r) => (
                  <tr key={r.reg_id}>
                    <td>{r.name}</td>
                    <td>{r.tier}</td>
                    <td>{r.tournament}</td>
                    <td><ProofLink path={r.proof_path} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card events-card" aria-labelledby="events-h">
          <h2 id="events-h">Manage Events</h2>
          <div className="scroll">
            {events.length === 0 && <p className="muted">No events yet.</p>}
            {events.length > 0 && (
              <table className="table">
                <thead><tr><th>Name</th><th>Date</th><th>Tier</th><th>Actions</th></tr></thead>
                <tbody>
                  {events.map((e) => (
                    <tr key={e.event_id}>
                      <td>{e.name}</td>
                      <td>{e.start_datetime.slice(0, 10)}</td>
                      <td>{e.pdga_tier}</td>
                      <td className="row-actions">
                        <Link to={`/events/${e.event_id}/edit`}>Edit</Link>
                        <button className="danger-btn" onClick={() => removeEvent(e)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}