import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import API from './services/api';

import Navbar from './components/Navbar';
import KanbanBoard from './components/KanbanBoard';
import SkillGapView from './components/SkillGapView';
import InterviewsView from './components/InterviewsView';
import QuestionBankView from './components/QuestionBankView';
import AnalyticsView from './components/AnalyticsView';

import ApplicationModal from './components/ApplicationModal';
import ApplicationDetailModal from './components/ApplicationDetailModal';
import InterviewModal from './components/InterviewModal';
import QuestionModal from './components/QuestionModal';
import NotificationsModal from './components/NotificationsModal';
import ProfileModal from './components/ProfileModal';
import AuthModal from './components/AuthModal';

function MainApp() {
  const { user, token, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState('kanban');
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Modal States
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [initialAppStatus, setInitialAppStatus] = useState('Applied');
  const [selectedApplication, setSelectedApplication] = useState(null);
  
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewApplication, setInterviewApplication] = useState(null);

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [questionInterview, setQuestionInterview] = useState(null);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Load all user data
  const fetchData = async () => {
    if (!token) return;
    try {
      const [appsRes, intsRes, qRes, notifsRes] = await Promise.all([
        API.get('/applications'),
        API.get('/interviews'),
        API.get('/questions'),
        API.get('/notifications')
      ]);

      setApplications(appsRes.data);
      setInterviews(intsRes.data);
      setQuestions(qRes.data);
      setNotifications(notifsRes.data.notifications || []);
      setUnreadCount(notifsRes.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch workspace data:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // Status transition on Kanban drag & drop
  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      // Optimistic update
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a));
      await API.patch(`/applications/${appId}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error('Failed to change status:', err);
      fetchData();
    }
  };

  const handleUpdateInterviewStatus = async (interviewId, newStatus) => {
    try {
      await API.put(`/interviews/${interviewId}`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error('Failed to update interview:', err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        Loading Job Hunt OS...
      </div>
    );
  }

  if (!user || !token) {
    return <AuthModal onLoggedIn={fetchData} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewAppModal={() => {
          setInitialAppStatus('Applied');
          setIsNewAppModalOpen(true);
        }}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        notificationCount={unreadCount}
        onRefresh={fetchData}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'kanban' && (
          <KanbanBoard
            applications={applications}
            onUpdateStatus={handleUpdateStatus}
            onSelectApplication={(app) => setSelectedApplication(app)}
            onOpenNewModal={(status) => {
              setInitialAppStatus(status);
              setIsNewAppModalOpen(true);
            }}
          />
        )}

        {activeTab === 'skill-gap' && (
          <SkillGapView
            applications={applications}
            onRefreshApplications={fetchData}
            onSelectApplication={(app) => setSelectedApplication(app)}
            onOpenProfile={() => setIsProfileOpen(true)}
          />
        )}

        {activeTab === 'interviews' && (
          <InterviewsView
            interviews={interviews}
            onOpenNewInterviewModal={() => {
              setInterviewApplication(null);
              setIsInterviewModalOpen(true);
            }}
            onOpenAddQuestionModal={(interview) => {
              setQuestionInterview(interview);
              setIsQuestionModalOpen(true);
            }}
            onSelectInterview={(interview) => {
              // Open detail
              const matchedApp = applications.find(a => a._id === interview.application?._id || a._id === interview.application);
              if (matchedApp) setSelectedApplication(matchedApp);
            }}
            onUpdateInterviewStatus={handleUpdateInterviewStatus}
          />
        )}

        {activeTab === 'questions' && (
          <QuestionBankView
            questions={questions}
            onRefreshQuestions={fetchData}
            onOpenNewQuestionModal={() => {
              setQuestionInterview(null);
              setIsQuestionModalOpen(true);
            }}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView onRefreshAll={fetchData} />
        )}
      </main>

      {/* Global Modals */}
      <ApplicationModal
        isOpen={isNewAppModalOpen}
        onClose={() => setIsNewAppModalOpen(false)}
        onSaved={fetchData}
        initialStatus={initialAppStatus}
      />

      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onUpdated={fetchData}
          onScheduleInterview={(app) => {
            setInterviewApplication(app);
            setIsInterviewModalOpen(true);
          }}
        />
      )}

      <InterviewModal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        onSaved={fetchData}
        applications={applications}
        initialApplication={interviewApplication}
      />

      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => {
          setIsQuestionModalOpen(false);
          setQuestionInterview(null);
        }}
        onSaved={fetchData}
        interview={questionInterview}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onRefresh={fetchData}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onProfileUpdated={fetchData}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
