/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './pages/LandingPage';
import { Onboarding } from './pages/Onboarding';
import { TesterView } from './pages/TesterView';
import { Roundups } from './pages/Roundups';
import { Goals } from './pages/Goals';
import { GoalDetail } from './pages/GoalDetail';
import { Donations } from './pages/Donations';
import { Impact } from './pages/Impact';
import { Profile } from './pages/Profile';
import { DashboardLayout } from './layouts/DashboardLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
         <Route path="/" element={<LandingPage />} />
         <Route path="/onboarding" element={<Onboarding />} />
         
         <Route element={<DashboardLayout />}>
           <Route path="/dashboard" element={<Dashboard />} />
           <Route path="/roundups" element={<Roundups />} />
           <Route path="/goals" element={<Goals />} />
           <Route path="/goals/:slug" element={<GoalDetail />} />
           <Route path="/donations" element={<Donations />} />
           <Route path="/impact" element={<Impact />} />
           <Route path="/profile" element={<Profile />} />
         </Route>

         <Route path="/dev/tester" element={<TesterView />} />
         
         <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
