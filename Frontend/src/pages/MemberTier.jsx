import { Link, useNavigate } from 'react-router-dom';
import Seo from '../components/Seo';
import DemoNotice from '../components/DemoNotice';
import { MEMBERSHIP_FEE } from '../constants';

const BLURB = 'Support the growth of disc golf in South Africa while gaining access to member benefits, events, competitions, discounts, and a growing community.';

export default function MemberTier() {
  const navigate = useNavigate();

  return (
    <main className="auth-page">
      <Seo title="Membership" description="Compare the Free and DGSA Member tiers and join for R375 a year." />
      <div className="glass tier-wrap">
        <h1>Member Tier</h1>
        <DemoNotice>
          This is a demo website for a student project. The R{MEMBERSHIP_FEE} membership is not real, and no money is used or taken. You can choose either option to explore the site.
        </DemoNotice>
        <div className="tier-grid">
          <section className="tier-card">
            <h2 className="tier-name">Free</h2>
            <p className="tier-price"><span>R</span>0 <small>/ Year</small></p>
            <p className="tier-blurb">{BLURB}</p>
            <button className="btn" onClick={() => navigate('/dashboard')}>Continue for free</button>
            <ul className="tier-list">
              <li>Register for Tournaments</li>
            </ul>
          </section>

          <section className="tier-card featured">
            <h2 className="tier-name">DGSA Member</h2>
            <p className="tier-price"><span>R</span>{MEMBERSHIP_FEE} <small>/ Year</small></p>
            <p className="tier-blurb">{BLURB}</p>
            <button className="btn" onClick={() => navigate('/become-member')}>Sign up as a member</button>
            <ul className="tier-list">
              <li>Register for Tournaments</li>
              <li>Discounted Tournament Registration Fees</li>
              <li>Access to DGSA Exclusive Merchandise</li>
              <li>Priority Registration</li>
            </ul>
          </section>
        </div>
        <p className="auth-switch"><Link to="/dashboard">Skip for now</Link></p>
      </div>
    </main>
  );
}