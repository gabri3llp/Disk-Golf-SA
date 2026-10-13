import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import FileUpload from '../components/FileUpload';
import SuccessModal from '../components/SuccessModal';

const TIERS = ['C-Tier', 'B-Tier', 'A-Tier'];

const EMPTY = {
  name: '', location: '', pdga_tier: '',
  start_date: '', start_time: '', end_date: '', end_time: '',
  fee_non_member: '', fee_member: '', description: '', bank_details: '',
};

export default function NewEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [poster, setPoster] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const { name, location, pdga_tier, start_date, start_time, fee_non_member, fee_member } = form;
    if (!name || !location || !pdga_tier || !start_date || !start_time || fee_non_member === '' || fee_member === '')
      return setError('Please complete the name, location, tier, start date and time, and both fees.');

    const data = new FormData();
    data.append('name', form.name);
    data.append('location', form.location);
    data.append('pdga_tier', form.pdga_tier);
    data.append('description', form.description);
    data.append('bank_details', form.bank_details);
    data.append('fee_non_member', form.fee_non_member);
    data.append('fee_member', form.fee_member);
    data.append('start_datetime', `${form.start_date}T${form.start_time}:00`);
    if (form.end_date) data.append('end_datetime', `${form.end_date}T${form.end_time || '17:00'}:00`);
    if (poster) data.append('poster', poster);

    setError('');
    setBusy(true);
    try {
      await api.post('/events', data);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <form className="glass event-form" onSubmit={submit}>
        <div className="event-col">
          <h1>New Event</h1>
          <FileUpload file={poster} onChange={setPoster} label="Event Poster" />
          <input className="field" name="name" placeholder="Event Name" value={form.name} onChange={set} />
          <input className="field" name="location" placeholder="Location" value={form.location} onChange={set} />
          <select className="field" name="pdga_tier" value={form.pdga_tier} onChange={set}>
            <option value="">PDGA Tier</option>
            {TIERS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div className="event-col">
          <p className="field-label">Start</p>
          <div className="row">
            <input className="field" type="date" name="start_date" value={form.start_date} onChange={set} aria-label="Start date" />
            <input className="field" type="time" name="start_time" value={form.start_time} onChange={set} aria-label="Start time" />
          </div>
          <p className="field-label">End <span className="accent">(optional)</span></p>
          <div className="row">
            <input className="field" type="date" name="end_date" value={form.end_date} onChange={set} aria-label="End date" />
            <input className="field" type="time" name="end_time" value={form.end_time} onChange={set} aria-label="End time" />
          </div>
          <div className="row">
            <input className="field" type="number" min="0" name="fee_non_member" placeholder="R Non-member" value={form.fee_non_member} onChange={set} />
            <input className="field" type="number" min="0" name="fee_member" placeholder="R DGSA Member" value={form.fee_member} onChange={set} />
          </div>
          <textarea className="field" rows="4" name="description" placeholder="Event description" value={form.description} onChange={set} />
          <textarea className="field" rows="3" name="bank_details" placeholder="Bank Details" value={form.bank_details} onChange={set} />

          {error && <p className="error-msg">{error}</p>}
          <button className="btn" type="submit" disabled={busy}>{busy ? 'Adding…' : 'Add event'}</button>
          <Link to="/dashboard" className="auth-switch">← Back to dashboard</Link>
        </div>
      </form>

      {done && (
        <SuccessModal
          title="Event added"
          message="Your event is now live and will show up under Upcoming Events."
          buttonText="Back to dashboard"
          onClose={() => navigate('/dashboard')}
        />
      )}
    </main>
  );
}