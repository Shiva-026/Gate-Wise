import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import RootLayout from './components/Rootlayout.jsx';
import Home from './components/common/Home.jsx';
import AdminLogin from './components/common/AdminLogin.jsx';
import SecurityLogin from './components/common/SecurityLogin.jsx';
import StudentLogin from './components/common/StudentLogin.jsx';
import StudentProfile from './components/student/StudentProfile.jsx';
import SecurityProfile from './components/security/SecurityProfile.jsx';
import AdminProfile from './components/admin/AdminProfile.jsx';
import RequestPassForm from './components/student/RequestPassForm.jsx';
import PersonalPasses from './components/student/PersonalPasses.jsx';
import DefaultStudentView from './components/student/DefaultStudentView.jsx';
import DefaultSecurity from './components/security/DefaultSecurity.jsx';
import StudentPassValidation from './components/common/StudentPassValidation.jsx';
import VisitorPassValidation from './components/common/VisitorPassValidation.jsx';
import AddVisitor from './components/security/AddVisitor.jsx';
import ViewVisitors from './components/security/ViewVisitors.jsx';
import DefaultAdmin from './components/admin/DefaultAdmin.jsx';
import GeneratePassDirectly from './components/admin/GeneratePassDirectly.jsx';
import RequestedPasses from './components/admin/RequestedPasses.jsx';
import AddStudent from './components/admin/AddStudent.jsx';
import ViewStudents from './components/admin/ViewStudents.jsx';
import EditStudent from './components/admin/EditStudent.jsx';
import { AuthProvider } from './components/context/AuthContext.jsx';

const browserRouterObj = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "", element: <Home /> },
      { path: "admin-login", element: <AdminLogin /> },
      { path: "security-login", element: <SecurityLogin /> },
      { path: "student-login", element: <StudentLogin /> },

      {
        path: "student-profile/:username?",
        element: <StudentProfile />,
        children: [
          { index: true, element: <DefaultStudentView /> },
          { path: "request-pass", element: <RequestPassForm /> },
          { path: "personal-passes", element: <PersonalPasses /> },
        ],
      },
      {
        path: "admin-profile",
        element: <AdminProfile />,
        children: [
          { index: true, element: <DefaultAdmin /> },
          { path: "add-student", element: <AddStudent /> },
          { path: "view-students", element: <ViewStudents /> },
          { path: "edit-students", element: <EditStudent /> },
          { path: "requested-passes", element: <RequestedPasses /> },
          { path: "generate-pass", element: <GeneratePassDirectly /> },
          { path: "student-validation", element: <StudentPassValidation /> },
          { path: "visitor-validation", element: <VisitorPassValidation /> },
        ],
      },
      {
        path: "security-profile",
        element: <SecurityProfile />,
        children: [
          { index: true, element: <DefaultSecurity /> },
          { path: "add-visitor", element: <AddVisitor /> },
          { path: "view-visitors", element: <ViewVisitors /> },
          { path: "student-validation", element: <StudentPassValidation /> },
          { path: "visitor-validation", element: <VisitorPassValidation /> },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={browserRouterObj} />
    </AuthProvider>
  </StrictMode>
);
