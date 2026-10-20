export default function DemoNotice({ children }) {
  return (
    <div className="demo-notice" role="note">
      <strong>Demo only.</strong>{' '}
      {children || 'This is a student project. No real money is used or needed, and no payment is processed!'}
    </div>
  );
}