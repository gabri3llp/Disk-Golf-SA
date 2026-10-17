import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import FileUpload from '../components/FileUpload';
import AuthPhoto from '../components/AuthPhoto';
import SuccessModal from '../components/SuccessModal';
import { BANK, MEMBERSHIP_FEE, DIVISIONS } from '../constants';
import Seo from '../components/Seo';

const PROVINCES = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
  'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'];

const EMPTY = {
  gender: '', date_of_birth: '', sa_id: '', passport_no: '', mobile: '', usual_division: '',
  address: '', country: 'South Africa', province: '', city: '', suburb: '', zip: '',
};

export default function BecomeMember() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const [proof, setProof] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (step === 1) {
      if (!form.gender || !form.date_of_birth || !form.mobile || !form.usual_division)
        return 'Please complete all fields.';
      if (!form.sa_id && !form.passport_no) return 'Enter an SA ID number or a passport number.';
    }
    if (step === 2) {
      const { address, country, province, city, suburb, zip } = form;
      if (!address || !country || !province || !city || !suburb || !zip) return 'Please complete all fields.';
    }
    return '';
  };

  const next = () => {
    const msg = validate();
    setError(msg);
    if (!msg) setStep(step + 1);
  };

  const submit = async () => {
    if (!proof) return setError('Please upload your proof of payment.');
    setError('');
    setBusy(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      data.append('proof', proof);
      await api.post('/members/apply', data);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const reference = localStorage.getItem('name') || 'Name/Membership No';

  return (
    <main className="auth-page">
      <Seo title="Become a Member" description="Apply for DGSA membership." noindex />
      <div className="glass auth-card">
        <AuthPhoto src="/Imgs/become-a-member.webp" alt="Player mid-throw in a South Africa shirt" />

        <div className="auth-form">
          <h1 className={step < 3 ? 'accent' : ''}>Become a Member</h1>
          <p className="step-indicator">Step {step} of 3</p>

          {step === 1 && (
            <>
              <div className="row">
                <select className="field" name="gender" value={form.gender} onChange={set}>
                  <option value="">Gender</option>
                  <option>Female</option><option>Male</option><option>Other</option>
                </select>
                <input className="field" type="date" name="date_of_birth" value={form.date_of_birth} onChange={set} aria-label="Date of birth" />
              </div>
              <input className="field" name="sa_id" placeholder="SA ID Number" value={form.sa_id} onChange={set} />
              <input className="field" name="passport_no" placeholder="Passport Number (if no SA ID)" value={form.passport_no} onChange={set} />
              <input className="field" name="mobile" type="tel" placeholder="Mobile Number" value={form.mobile} onChange={set} />
              <select className="field" name="usual_division" value={form.usual_division} onChange={set}>
                <option value="">Select Usual Division</option>
                {DIVISIONS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </>
          )}

          {step === 2 && (
            <>
              <input className="field" name="address" placeholder="Home Address" value={form.address} onChange={set} />
              <div className="row">
                <input className="field" name="country" placeholder="Country" value={form.country} onChange={set} />
                <select className="field" name="province" value={form.province} onChange={set}>
                  <option value="">Province</option>
                  {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="row">
                <input className="field" name="city" placeholder="City" value={form.city} onChange={set} />
                <input className="field" name="suburb" placeholder="Suburb" value={form.suburb} onChange={set} />
              </div>
              <input className="field" name="zip" placeholder="ZIP Code" value={form.zip} onChange={set} />
            </>
          )}

          {step === 3 && (
            <>
              <div className="bank-row">
                <dl className="bank">
                  <dt>DGSA Banking Details</dt>
                  <dd>Bank: {BANK.bank}</dd>
                  <dd>Account Number: {BANK.accountNumber}</dd>
                  <dd>Account Type: {BANK.accountType}</dd>
                  <dd>Branch Code: {BANK.branchCode}</dd>
                  <dd>Reference: {reference}</dd>
                </dl>
                <div className="amount">
                  <small>Amount Payable (annual)</small>
                  <strong>R{MEMBERSHIP_FEE}</strong>
                </div>
              </div>
              <FileUpload file={proof} onChange={setProof} />
            </>
          )}

          {error && <p className="error-msg">{error}</p>}

          <div className="step-nav">
            {step > 1
              ? <button type="button" className="link-btn" onClick={() => { setError(''); setStep(step - 1); }}>← Previous Page</button>
              : <button type="button" className="link-btn" onClick={() => navigate('/member-tier')}>← Back to Sign Up</button>}
            {step < 3
              ? <button type="button" className="link-btn" onClick={next}>Next Page →</button>
              : <button type="button" className="btn" style={{ width: 'auto' }} disabled={busy} onClick={submit}>
                  {busy ? 'Submitting…' : 'Create an account'}
                </button>}
          </div>
        </div>
      </div>

      {done && (
        <SuccessModal
          title="Registration successful"
          message="Your proof of payment has been submitted. Your membership will be confirmed once it's approved."
          buttonText="Go to Dashboard"
          onClose={() => navigate('/dashboard')}
        />
      )}
    </main>
  );
}