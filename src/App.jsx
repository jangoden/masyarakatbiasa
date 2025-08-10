import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import React, { useState } from 'react';
import "./index.css";
import 'react-quill/dist/quill.snow.css';
import DeepLinkHandler from './components/DeepLinkHandler';

// Halaman utama dan komponen
import Home from "./Pages/Home";
import About from "./Pages/About";
import Portofolio from "./Pages/Portofolio";
import ContactPage from "./Pages/Contact";
import WelcomeScreen from "./Pages/WelcomeScreen";
import NotFoundPage from "./Pages/404";
import ProjectDetails from "./components/ProjectDetail";
import LatestBlogs from "./components/LatestBlogs";

// Halaman dan komponen blog & admin
import Blog from "./Pages/Blog";
import BlogDetail from "./Pages/BlogDetail";
import CreatePost from "./Pages/CreatePost";
import LoginPage from "./Pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./Pages/AdminDashboard";
import PostsByTagPage from "./Pages/PostsByTagPage";
import EditPost from "./Pages/EditPost";

// Komponen UI
import AnimatedBackground from "./components/Background";
import Navbar from "./components/Navbar";
import { AnimatePresence } from 'framer-motion';

// =================================================================
// LAYOUTS
// =================================================================

// Layout konsisten untuk semua halaman publik
const PublicLayout = () => (
  <>
    <Navbar />
    <AnimatedBackground />
    <main>
      <Outlet />
    </main>
    <footer>
      <center>
        <hr className="my-3 border-gray-400 opacity-15 sm:mx-auto lg:my-6 text-center" />
        <span className="block text-sm pb-4 text-gray-500 text-center dark:text-gray-400">
          © 2025{" "}
          <a href="/" className="hover:underline">
            deniirahman™
          </a>
          . All Rights Reserved.
        </span>
      </center>
    </footer>
  </>
);

// Layout untuk Halaman Admin
const AdminLayout = () => (
  <ProtectedRoute>
    <Outlet />
  </ProtectedRoute>
);

// Halaman utama gabungan
const MainPage = () => (
  <>
    <Home />
    <About />
    <LatestBlogs />
    <Portofolio />
    <ContactPage />
  </>
);

// =================================================================
// APP
// =================================================================
function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <BrowserRouter>
      {/* Handler deep link */}
      <DeepLinkHandler />

      <AnimatePresence mode="wait">
        {showWelcome && (
          <WelcomeScreen onLoadingComplete={() => setShowWelcome(false)} />
        )}
      </AnimatePresence>

      {!showWelcome && (
        <Routes>
          {/* Rute publik */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<MainPage />} />
            <Route path="/project/:id" element={<ProjectDetails />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/blog/tags/:tagName" element={<PostsByTagPage />} />
          </Route>

          {/* Rute login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rute admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="create" element={<CreatePost />} />
            <Route path="edit/:id" element={<EditPost />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
