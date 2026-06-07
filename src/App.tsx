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
import { DashboardLayout } from './layouts/DashboardLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
         <Route path="/" element={<LandingPage />} />
         <Route path="/onboarding" element={<Onboarding />} />
         
         <Route element={<DashboardLayout />}>
           <Route path="/dashboard" element={<Dashboard />} />
           <Route path="/goals" element={<div className="p-8">Goals Page WIP</div>} />
           <Route path="/donations" element={<div className="p-8">Donations Page WIP</div>} />
           <Route path="/impact" element={<div className="p-8">Impact Page WIP</div>} />
           <Route path="/profile" element={<div className="p-8">Profile Page WIP</div>} />
         </Route>

         <Route path="/dev/tester" element={<TesterView />} />
         
         <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
