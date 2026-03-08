import { useContext, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { AuthContext } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import { useTranslation } from "react-i18next";
import ErrorState from "./components/common/ErrorState";
import { BannedScreen } from './components/auth/BannedScreen';
import { audioManager } from './utils/audioManager';

const GlobalLoading = () => {
  const { t } = useTranslation();
  return (
    <div className="socnet-fullscreen-center">
      <title>{t('common.loading')}</title>
      <div className="socnet-empty-state">{t('common.loading')}</div>
    </div>
  );
};

const GlobalError = () => {
  const { t } = useTranslation();
  return (
    <div className="socnet-fullscreen-center">
      <title>{t('error.connection')}</title>
      <ErrorState
        title={t('error.server_down')}
        description={t('error.server_down_desc')}
        onRetry={() => window.location.reload()}
      />
    </div>
  );
};

function App() {
  const { user, loading, initError } = useContext(AuthContext);

  useEffect(() => {
    const isDark = localStorage.getItem('dark_theme');
    if (isDark === 'false')
      document.body.setAttribute('data-theme', 'light');
    else
      document.body.removeAttribute('data-theme');

    if (isDark === null)
      localStorage.setItem('dark_theme', 'true');
  }, []);

  // для сповіщень
  useEffect(() => {
    const unlockAudio = () => {
      audioManager.unlock();
      // після першого успішного кліку видаляємо слухач (нам більше не треба)
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };

    // слухаємо кліки та натискання клавіш
    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  if (loading) return <GlobalLoading />;

  if (initError) return <GlobalError />;

  if (user && user.is_banned) return <BannedScreen />;

  return (
    <>
      <Toaster
        position="bottom-left"
        toastOptions={{
          style: {
            background: 'var(--theme-bg-secondary, #333)',
            color: 'var(--text-primary, #fff)',
          },
        }}
      />
      <AppRoutes />
    </>
  );
}

export default App;