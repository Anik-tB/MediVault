import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  firebaseSignInGoogle,
  formatFirebaseError,
} from '../services/firebase';
import { login, firebaseLogin, register, type RegisterPayload } from '../services/api';
import type { StaffProfile } from '../types';

const departments = [
  'Pharmacy & Dispensary',
  'Health Administration',
  'Clinical Operations',
  'Patient Safety',
];

export function AuthPage({ onAuthenticated }: { onAuthenticated: (staff: StaffProfile) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [registerStep, setRegisterStep] = useState(1);
  const [isSubmitting, setSubmitting] = useState(false);
  const [isGoogleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState<RegisterPayload & { confirmPassword: string }>({
    fullName: '',
    email: '',
    employeeId: '',
    phone: '',
    department: 'Pharmacy & Dispensary',
    password: '',
    confirmPassword: '',
  });

  // Email/password → backend directly (staff_users PBKDF2 system)
  // This means the seeded demo account works without needing a Firebase account.
  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const response = await login(loginForm.email, loginForm.password);
      onAuthenticated(response.staff);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  }

  // Sign in with Google popup → get ID token → exchange for staff session
  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError('');
    try {
      const credential = await firebaseSignInGoogle();
      const idToken = await credential.user.getIdToken();
      const response = await firebaseLogin(idToken);
      onAuthenticated(response.staff);
    } catch (err: unknown) {
      const message = formatFirebaseError(err) || (err instanceof Error ? err.message : 'Unable to sign in with Google');
      if (message) setError(message);
    } finally {
      setGoogleLoading(false);
    }
  }

  async function submitRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (registerStep === 1) {
      setRegisterStep(2);
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const { confirmPassword: _confirmPassword, ...payload } = registerForm;
      const response = await register(payload);
      onAuthenticated(response.staff);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create staff account');
    } finally {
      setSubmitting(false);
    }
  }

  const featureItems = [
    'Full inventory management dashboard',
    'Prescription review & approval system',
    'Drug interaction safety monitoring',
  ];

  return (
    <div className="auth-shell">
      <section className="auth-brand">
        <div>
          <span className="brand-mark">✚</span>
          <p className="brand-kicker">MediVault Dispensary System</p>
          <h1>{mode === 'login' ? 'Staff / Pharmacist Portal' : 'Staff Registration'}</h1>
          <p>
            Manage inventory, review prescriptions, approve orders, and monitor drug interactions from one unified platform.
          </p>
          <div className="feature-list">
            {featureItems.map((item) => (
              <span key={item}>✓ {item}</span>
            ))}
          </div>
        </div>
        <p>© 2026 MediVault · University Health Services</p>
      </section>

      <section className="auth-panel-wrap">
        <div className="auth-panel">
          <div className="auth-tabs">
            <button className={`tab-button ${mode === 'login' ? 'active' : ''}`} type="button" onClick={() => setMode('login')}>Staff Sign In</button>
            <button className={`tab-button ${mode === 'register' ? 'active' : ''}`} type="button" onClick={() => setMode('register')}>Create Account</button>
          </div>

          {mode === 'login' ? (
            <form className="form-grid" onSubmit={submitLogin}>
              <div>
                <h1>Staff / Admin</h1>
                <p className="card-subtitle">Access the pharmacist management dashboard.</p>
              </div>

              {error ? <div className="error-box">{error}</div> : null}

              {/* Google Sign-In */}
              <button
                className="google-button"
                type="button"
                disabled={isGoogleLoading || isSubmitting}
                onClick={handleGoogleSignIn}
              >
                {isGoogleLoading ? (
                  <span>Connecting...</span>
                ) : (
                  <>
                    <GoogleIcon />
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <div className="divider">
                <span>or sign in with email</span>
              </div>

              <div className="field">
                <label>Email Address</label>
                <input
                  className="input"
                  type="email"
                  placeholder="hulahuhu015@gmail.com"
                  value={loginForm.email}
                  required
                  onChange={(event) => setLoginForm((form) => ({ ...form, email: event.target.value }))}
                />
              </div>
              <div className="field">
                <label>Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={loginForm.password}
                  required
                  onChange={(event) => setLoginForm((form) => ({ ...form, password: event.target.value }))}
                />
              </div>
              <button className="primary-button" type="submit" disabled={isSubmitting || isGoogleLoading}>
                {isSubmitting ? 'Signing in...' : 'Sign in to Dashboard'}
              </button>
              <p className="auth-footnote">
                Sign in with Google using your registered staff email.
              </p>
            </form>
          ) : (
            <form className="form-grid" onSubmit={submitRegister}>
              <div>
                <h1>{registerStep === 1 ? 'Create your account' : 'Secure your account'}</h1>
                <p className="card-subtitle">Step {registerStep} of 2 · {registerStep === 1 ? 'Enter your staff details' : 'Set a strong password'}</p>
              </div>
              <div className="page-tabs">
                <span className={`badge ${registerStep === 1 ? 'primary' : 'neutral'}`}>1 Your Info</span>
                <span className={`badge ${registerStep === 2 ? 'primary' : 'neutral'}`}>2 Security</span>
              </div>
              {error ? <div className="error-box">{error}</div> : null}
              {registerStep === 1 ? (
                <>
                  <div className="field">
                    <label>Full Name *</label>
                    <input className="input" placeholder="e.g. Anik" value={registerForm.fullName} required onChange={(event) => setRegisterForm((form) => ({ ...form, fullName: event.target.value }))} />
                  </div>
                  <div className="form-grid two">
                    <div className="field">
                      <label>Email Address *</label>
                      <input className="input" type="email" placeholder="hulahuhu015@gmail.com" value={registerForm.email} required onChange={(event) => setRegisterForm((form) => ({ ...form, email: event.target.value }))} />
                    </div>
                    <div className="field">
                      <label>Employee ID *</label>
                      <input className="input" placeholder="EMP-0001" value={registerForm.employeeId} required onChange={(event) => setRegisterForm((form) => ({ ...form, employeeId: event.target.value }))} />
                    </div>
                  </div>
                  <div className="form-grid two">
                    <div className="field">
                      <label>Phone</label>
                      <input className="input" placeholder="+1 555 0100" value={registerForm.phone} onChange={(event) => setRegisterForm((form) => ({ ...form, phone: event.target.value }))} />
                    </div>
                    <div className="field">
                      <label>Clinical Department *</label>
                      <select className="select" value={registerForm.department} onChange={(event) => setRegisterForm((form) => ({ ...form, department: event.target.value }))}>
                        {departments.map((department) => <option key={department}>{department}</option>)}
                      </select>
                    </div>
                  </div>
                  <button className="primary-button" type="submit">Continue to Security</button>
                </>
              ) : (
                <>
                  <div className="alert-row">
                    <div>
                      <strong>{registerForm.fullName || 'New staff member'}</strong>
                      <p className="card-subtitle">{registerForm.email} · {registerForm.department}</p>
                    </div>
                  </div>
                  <div className="field">
                    <label>Password *</label>
                    <input className="input" type="password" required minLength={8} value={registerForm.password} onChange={(event) => setRegisterForm((form) => ({ ...form, password: event.target.value }))} />
                  </div>
                  <div className="field">
                    <label>Confirm Password *</label>
                    <input className="input" type="password" required minLength={8} value={registerForm.confirmPassword} onChange={(event) => setRegisterForm((form) => ({ ...form, confirmPassword: event.target.value }))} />
                  </div>
                  <label className="checkbox-row">
                    <input type="checkbox" required />
                    I agree to the Terms of Service and Privacy Policy. Patient data is handled in accordance with HIPAA guidelines.
                  </label>
                  <div className="row-actions">
                    <button className="ghost-button" type="button" onClick={() => setRegisterStep(1)}>Back</button>
                    <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create My Account'}</button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}
