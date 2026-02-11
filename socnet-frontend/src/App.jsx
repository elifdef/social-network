import { useContext } from "react";
import { Toaster } from "react-hot-toast";
import { AuthContext } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import { useTranslation } from 'react-i18next';

function App() {
  const { loading } = useContext(AuthContext);
  const { t } = useTranslation();

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#19191a',
        color: '#e1e3e6'
      }}>
        {t('common.loading')}
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="bottom-left"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <AppRoutes />
    </>
  );
}

export default App;