import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/authContext';

// Layout & Protecție
import Layout from './components/layout/Layout.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';

// Paginile Publice
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import RegisterSuccessPage from './pages/RegisterSuccessPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// Paginile Autentificate
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ViewReviewersPage from './pages/admin/ViewReviewersPage.jsx';
import ReviewerHistoryPage from './pages/admin/ReviewerHistoryPage.jsx';
import EditorDashboard from './pages/editor/EditorDashboard.jsx';
import ReviewerDashboard from './pages/reviewer/ReviewerDashboard.jsx';
import JournalDetailPage from './pages/JournalDetailPage.jsx';
import PendingApprovalPage from './pages/PendingApprovalPage.jsx';
import CompletedReviewsPage from './pages/CompletedReviewsPage.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-center" reverseOrder={false} toastOptions={{ duration: 4000 }} />
        
        <Layout>
          <Routes>
            {}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register-success" element={<RegisterSuccessPage />} />

            {}
            {/* Rute pentru Admin */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/view-reviewers" element={<ViewReviewersPage />} />
              <Route path="/admin/reviewer/:reviewerId/history" element={<ReviewerHistoryPage />} />
            </Route>

            {/* Rute pentru Editor */}
            <Route element={<ProtectedRoute allowedRoles={['editor']} />}>
              <Route path="/editor/dashboard" element={<EditorDashboard />} />
            </Route>
            
            {/* Rute pentru Recenzor */}
            <Route element={<ProtectedRoute allowedRoles={['reviewer']} />}>
              <Route path="/reviewer/dashboard" element={<ReviewerDashboard />} />
              <Route path="/pending-approval" element={<PendingApprovalPage />} />
            </Route>
            
            {/* Rute Comune pentru roluri multiple */}
            <Route element={<ProtectedRoute allowedRoles={['editor', 'reviewer']} />}>
              <Route path="/journal/:journalId" element={<JournalDetailPage />} />
              <Route path="/reviews/completed" element={<CompletedReviewsPage />} />
            </Route>
            
            {/* Rută pentru pagini inexistente */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;