import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-zinc-100 border border-zinc-300 text-xs font-medium text-zinc-900 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-zinc-500 hover:text-black ml-2 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
        />

        <Input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        <Button type="submit" isLoading={isSubmitting} className="mt-2">
          Sign In
        </Button>
      </form>

      <p className="text-center text-[11px] text-zinc-400 mt-4 cursor-pointer hover:text-zinc-700 transition">
        Forgot password?
      </p>
    </div>
  );
}
