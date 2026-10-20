import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import FileUpload from '../components/FileUpload';
import SuccessModal from '../components/SuccessModal';
import { BANK, DIVISIONS } from '../constants';
import AuthPhoto from '../components/AuthPhoto';
import Seo from '../components/Seo';
import DemoNotice from '../components/DemoNotice';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const blank = () => ({ email: '', dgsa_membership_id: '', division: '' });

export default function EventRegister() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [multiple, setMultiple] = useState('no');
  const [count, setCount] = useState('');
  const [players, setPlayers] = useState([blank()]);
  const [stage, setStage] = useState('choice'); // choice | player | pay
  const [idx, setIdx] = useState(0);
  const [proof, setProof] = useState(null);
  const [total, setTotal] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(({ data }) => setEvent(data))
      .catch(() => setError('Event not found'));
  }, [id]);

  const emails = players.map((p) => p.email.trim().toLowerCase());
  const quotable = emails.every((e) => EMAIL.test(e));
  const emailKey = emails.join(',');

  useEffect(() => {
    if (!event || !quotable || stage === 'player') return;
    api.post('/registrations/quote', { event_id: event.event_id, emails })
      .then(({ data }) => setTotal(data.total))
      .catch(() => setTotal(null));
  }, [event, emailKey, quotable, stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (i, e) =>
    setPlayers(players.map((p, k) => (k === i ? { ...p, [e.target.name]: e.target.value } : p)));

  const checkPlayer = (p) => {
    if (!EMAIL.test(p.email.trim())) return 'Enter a valid email address.';
    if (!p.division) return 'Select a division.';
    return '';
  };

  const begin = () => {
    const n = Number(count);
    if (!n) return setError('Select how many players you are registering.');
    setError('');
    setPlayers(Array.from({ length: n }, blank));
    setIdx(0);
    setStage('player');
  };

  const nextPlayer = () => {
    const msg = checkPlayer(players[idx]);
    setError(msg);
    if (msg) return;
    if (idx < players.length - 1) setIdx(idx + 1);
    else setStage('pay');
  };

  const backPlayer = () => {
    setError('');
    if (idx > 0) setIdx(idx - 1);
    else setStage('choice');
  };

  const submit = async () => {
    const list = multiple === 'yes' ? players : [players[0]];
    for (const p of list) {
      const msg = checkPlayer(p);
      if (msg) return setError(msg);
    }
    if (new Set(list.map((p) => p.email.trim().toLowerCase())).size !== list.length)
      return setError('Each player needs a different email.');
    if (!proof) return setError('Please upload your proof of payment.');

    const data = new FormData();
    data.append('event_id', id);
    data.append('players', JSON.stringify(list));
    data.append('proof', proof);

    setError('');
    setBusy(true);
    try {
      await api.post('/registrations', data);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const reference = localStorage.getItem('name') || 'Name/Membership No';
  const amount = total !== null ? `R${total}` : '—';

  return (
    <main className="auth-page">
      <Seo title="Event Registration" description="Register for a Disc Golf South Africa event." noindex />
      <div className="glass auth-card">
        <AuthPhoto src="/Imgs/become-a-member.webp" alt="Player mid-throw in a South Africa shirt" />
        <div className="auth-form">
          <small className="accent">{event ? event.name : 'Event'}</small>
          <h1>Registration</h1>

          {stage === 'choice' && (
            <>
              <p>Are you registering for <strong>multiple</strong> players?</p>
              <div className="radio-row">
                <label><input type="radio" checked={multiple === 'yes'} onChange={() => setMultiple('yes')} /> Yes</label>
                <label><input type="radio" checked={multiple === 'no'} onChange={() => setMultiple('no')} /> No</label>
              </div>

              {multiple === 'no' && (
                <>
                  <input className="field" name="email" type="email" placeholder="Email" value={players[0].email} onChange={(e) => update(0, e)} />
                  <input className="field" name="dgsa_membership_id" placeholder="DGSA Membership ID (optional)" value={players[0].dgsa_membership_id} onChange={(e) => update(0, e)} />
                  <select className="field" name="division" value={players[0].division} onChange={(e) => update(0, e)}>
                    <option value="">Select Division</option>
                    {DIVISIONS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                  <DemoNotice />
                  <div className="bank-row">
                    <dl className="bank">
                      <dt>DGSA Banking Details</dt>
                      <dd>{BANK.bank} · Acc {BANK.accountNumber} · {BANK.accountType} · Branch {BANK.branchCode}</dd>
                      <dd>Reference: {reference}</dd>
                    </dl>
                    <div className="amount"><small>Amount Payable</small><strong>{amount}</strong></div>
                  </div>
                  <FileUpload file={proof} onChange={setProof} />
                </>
              )}

              {multiple === 'yes' && (
                <>
                  <p className="field-label">Indicate the Amount of Players</p>
                  <select className="field" value={count} onChange={(e) => setCount(e.target.value)}>
                    <option value="">Players</option>
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </>
              )}

              {error && <p className="error-msg">{error}</p>}

              {multiple === 'no'
                ? <button className="btn" disabled={busy} onClick={submit}>{busy ? 'Registering…' : 'Register'}</button>
                : <button className="btn" onClick={begin}>Begin registration</button>}
              <Link to="/dashboard" className="auth-switch">← Back to dashboard</Link>
            </>
          )}

          {stage === 'player' && (
            <>
              <p className="step-indicator accent">Registrant {idx + 1} of {players.length} Details:</p>
              <input className="field" name="email" type="email" placeholder="Email" value={players[idx].email} onChange={(e) => update(idx, e)} />
              <input className="field" name="dgsa_membership_id" placeholder="DGSA Membership ID (optional)" value={players[idx].dgsa_membership_id} onChange={(e) => update(idx, e)} />
              <select className="field" name="division" value={players[idx].division} onChange={(e) => update(idx, e)}>
                <option value="">Select Division</option>
                {DIVISIONS.map((d) => <option key={d}>{d}</option>)}
              </select>
              {error && <p className="error-msg">{error}</p>}
              <div className="step-nav">
                <button type="button" className="link-btn" onClick={backPlayer}>← {idx === 0 ? 'Back to Player Choice' : 'Previous Registrant'}</button>
                <button type="button" className="link-btn" onClick={nextPlayer}>{idx < players.length - 1 ? 'Next Registrant →' : 'Next Step →'}</button>
              </div>
            </>
          )}

          {stage === 'pay' && (
            <>
              <DemoNotice />
              <div className="bank-row">
                <dl className="bank">
                  <dt>DGSA Banking Details</dt>
                  <dd>Bank: {BANK.bank}</dd>
                  <dd>Account Number: {BANK.accountNumber}</dd>
                  <dd>Account Type: {BANK.accountType}</dd>
                  <dd>Branch Code: {BANK.branchCode}</dd>
                  <dd>Reference: {reference}</dd>
                </dl>
                <div className="amount"><small>Amount Payable</small><strong>{amount}</strong></div>
              </div>
              <FileUpload file={proof} onChange={setProof} />
              {error && <p className="error-msg">{error}</p>}
              <div className="step-nav">
                <button type="button" className="link-btn" onClick={() => { setError(''); setIdx(players.length - 1); setStage('player'); }}>← Previous Registrant</button>
                <button type="button" className="btn" style={{ width: 'auto' }} disabled={busy} onClick={submit}>
                  {busy ? 'Submitting…' : 'Finish Registration →'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {done && (
        <SuccessModal
          title="Registration sent"
          message={`Thanks! Your registration for ${event ? event.name : 'the event'} has been submitted. It will be confirmed once your payment is approved.`}
          buttonText="Go to dashboard"
          onClose={() => navigate('/dashboard')}
        />
      )}
    </main>
  );
}