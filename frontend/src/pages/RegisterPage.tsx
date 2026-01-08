import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Label, TextInput, Button, Alert } from 'flowbite-react';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex">
      {/* Sol taraf - Görsel (sadece md ve üstü) */}
      <div 
        className="hidden md:flex md:w-1/2 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/auth-bg.png)' }}
      />
      
      {/* Sağ taraf - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-brand-cream/30">
        <Card className="w-full max-w-md rounded-2xl shadow-soft ring-1 ring-black/5 bg-white">
          <div className="text-center mb-6">
            <img src="/images/logo-icon.png" alt="PatiDestek" className="h-16 w-16 mx-auto" />
            <h2 className="text-2xl font-extrabold text-brand-ink mt-3">Aramıza Katılın!</h2>
            <p className="text-sm text-gray-500 mt-1">PatiDestek ailesine katılın</p>
          </div>
        
          {error && (
            <Alert color="failure" onDismiss={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" value="Ad Soyad" />
              <TextInput
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Adınız Soyadınız"
              />
            </div>

            <div>
              <Label htmlFor="email" value="E-posta" />
              <TextInput
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ornek@email.com"
              />
            </div>

            <div>
              <Label htmlFor="password" value="Şifre" />
              <TextInput
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" value="Şifre Tekrar" />
              <TextInput
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full bg-brand-orange hover:bg-brand-orangeDark text-white" disabled={loading}>
              {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Zaten hesabınız var mı?{' '}
            <Link to="/login" className="text-brand-orange hover:underline font-semibold">
              Giriş Yap
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
