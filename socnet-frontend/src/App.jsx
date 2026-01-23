import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import MainPage from "./pages/MainPage";
import ProfilePage from "./pages/ProfilePage";
import FriendsPage from "./pages/FriendsPage";
import SetupProfilePage from "./pages/SetupProfilePage";
import Footer from "./components/Footer";

const GuestProfileWrapper = ({ children }) => (
  <div className="guest-profile-container">
    <div className="guest-content">
      {children}
    </div>
    <Footer />
  </div>
);

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }}>Завантаження...</div>;

  return (
    <Routes>
      <Route
        path="/login"
        element={
          !user ? <LoginPage /> : (
            user.is_setup_complete ? <Navigate to="/" />
              : <Navigate to="/setup-profile" />
          )
        }
      />

      <Route
        path="/register"
        element={
          !user ? <RegisterPage /> : (
            user.is_setup_complete ? <Navigate to="/" />
              : <Navigate to="/setup-profile" />
          )
        }
      />

      <Route
        path="/setup-profile"
        element={
          user ? <SetupProfilePage />
            : <Navigate to="/login" />
        }
      />

      {!user && <Route path="/" element={<MainPage />} />}

      {!user && (
        <>
          {/*забороняємо гостям заходити на ці адреси*/}
          <Route path="/friends" element={<Navigate to="/login" />} />
          <Route path="/settings" element={<Navigate to="/login" />} />
          <Route path="/messages" element={<Navigate to="/login" />} />

          <Route path=":username" element={
            <GuestProfileWrapper>
              <ProfilePage />
            </GuestProfileWrapper>
          } />
        </>
      )}

      {/* ДЛЯ АВТОРИЗОВАНИХ З Layout*/}
      {user && (
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path=":username" element={<ProfilePage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="settings" element={<h2>Налаштування</h2>} />
        </Route>
      )}

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;