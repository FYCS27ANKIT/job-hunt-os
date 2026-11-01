import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import API from './services/api';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import JobBoardView from './components/JobBoardView';
import SkillGapView from './components/SkillGapView';
import InterviewsView from './components/InterviewsView';
import QuestionBankView from './components/QuestionBankView';
import AnalyticsView from './components/AnalyticsView';
import EmployerModule from './components/EmployerModule';
import AdminModule from './components/AdminModule';

import ResumeManagerModal from './components/ResumeManagerModal';
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Modal States
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [initialAppStatus, setInitialAppStatus] = useState('Applied');
  const [selectedApplication, setSelectedApplication] = useState(null);
  
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewApplication, setInterviewApplication] = useState(null);

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [questionInterview, setQuestionInterview] = useState(null);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Load user data
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

  // Adjust active tab when role changes
  useEffect(() => {
    if (user?.role === 'employer') {
      setActiveTab('employer-main');
    } else if (user?.role === 'admin') {
      setActiveTab('admin-main');
    } else if (user?.role === 'employee' && (activeTab === 'employer-main' || activeTab === 'admin-main')) {
      setActiveTab('kanban');
    }
  }, [user?.role]);

  // Status transition on Kanban drag & drop
  const handleUpdateStatus = async (appId, newStatus) => {
    try {
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 text-xs font-bold gap-2">
        <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
        <span>Loading Job Hunt OS Platform...</span>
      </div>
    );
  }

  if (!user || !token) {
    return <AuthModal onLoggedIn={fetchData} />;
  }

  const currentRole = user.role || 'employee';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Vertical Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewAppModal={() => {
          setInitialAppStatus('Applied');
          setIsNewAppModalOpen(true);
        }}
        onOpenResumeModal={() => setIsResumeModalOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        applicationCount={applications.length}
        interviewCount={interviews.length}
      />

      {/* Main Content Area (Offset by lg:pl-72 to fit sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onOpenNewAppModal={() => {
            setInitialAppStatus('Applied');
            setIsNewAppModalOpen(true);
          }}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          notificationCount={unreadCount}
          onRefresh={fetchData}
          setMobileOpen={setMobileOpen}
        />

        {/* Dynamic Main Workspace Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* MODULE 1: EMPLOYER / RECRUITER */}
          {currentRole === 'employer' && (
            <EmployerModule onRefreshAll={fetchData} />
          )}

          {/* MODULE 2: ADMIN GOVERNANCE */}
          {currentRole === 'admin' && (
            <AdminModule onRefreshAll={fetchData} />
          )}

          {/* MODULE 3: EMPLOYEE / CANDIDATE */}
          {currentRole === 'employee' && (
            <>
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

              {activeTab === 'job-board' && (
                <JobBoardView
                  onApplicationCreated={fetchData}
                  onOpenResumeModal={() => setIsResumeModalOpen(true)}
                />
              )}

              {activeTab === 'skill-gap' && (
                <SkillGapView
                  applications={applications}
                  onRefreshApplications={fetchData}
                  onSelectApplication={(app) => setSelectedApplication(app)}
                  onOpenProfile={() => setIsProfileOpen(true)}
                  onOpenResumeModal={() => setIsResumeModalOpen(true)}
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
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <ResumeManagerModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        onResumeUpdated={fetchData}
      />

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
        onOpenResumeModal={() => {
          setIsProfileOpen(false);
          setIsResumeModalOpen(true);
        }}
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
