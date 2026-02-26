import { useContext, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { AuthContext } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import { useTranslation } from "react-i18next";
import ErrorState from "./components/common/ErrorState";
import { BannedScreen } from './components/auth/BannedScreen';

const GlobalLoading = () => {
  const { t } = useTranslation();
  return (
    <div className="global-screen-wrapper">
      <title>{t('common.loading')}</title>
      <div className="socnet-feed-loading">{t('common.loading')}</div>
    </div>
  );
};

const GlobalError = () => {
  const { t } = useTranslation();
  return (
    <div className="global-screen-wrapper">
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