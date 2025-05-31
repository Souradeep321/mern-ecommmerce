import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import AdminPage from "./pages/AdminPage";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";

import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import { useUserStore } from "./store/useUserStore";
import LoadingSpinner from "./components/LoadingSpinner";
import { useCartStore } from "./store/useCartStore";

function App() {
  const { user, checkAuth, checkingAuth } = useUserStore();
  const { getCartItems, loading } = useCartStore();
  const authUser = user?.user

  console.log('authUser', authUser)

  useEffect(() => {
    checkAuth()
  }, [checkAuth]);

  useEffect(() => {
    if (!authUser) return
       getCartItems()
  }, [authUser, getCartItems]);

  if (checkingAuth || loading) return <LoadingSpinner />

  return (
    <div className='min-h-screen bg-gray-900 text-white relative overflow-hidden'>
      {/* Background gradient */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.4)_0%,_rgba(59,130,246,0.3)_40%,_rgba(30,64,175,0.2)_70%,_rgba(0,0,0,0.1)_100%)] blur-2xl opacity-60" />
        </div>
      </div>

      <div className='relative z-50 pt-20'>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/secret-dashboard" element={authUser && authUser?.role === "admin" ? <AdminPage /> : <Navigate to="/login" />} />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path="/cart" element={authUser ? <CartPage /> : <Navigate to="/login" />} />
          <Route path="/purchase-success/:orderId" element={authUser ? <PurchaseSuccessPage /> : <Navigate to="/login" />} />
        </Routes>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
