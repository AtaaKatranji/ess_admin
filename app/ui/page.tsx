// pages/institution/[id].tsx
"use client";
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import React, { Children, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/app/components/SideBar';
import {MenuIcon} from 'lucide-react';

const InstitutionDashboard = () => {

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const params = useParams();
  const id = params?.id;  // Retrieve the institution ID from the URL

  useEffect(() => {
    if (id) {
      // Fetch institution-specific data here using the 'id'
      console.log('Institution ID:', id);
    }
  }, [id]);



  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={handleSidebarToggle} />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: sidebarOpen ? 240 : 0, // Add margin when sidebar is open
          transition: 'margin 0.3s',
        }}
      >
        {/* App Bar */}
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={handleSidebarToggle}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Home
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Offset to push content below the AppBar */}
        <Toolbar />

        {/* Content */}
        <Box>
          <Typography variant="h4">Welcome to the Dashboard {id}!</Typography>
          <Typography>
            This is the main content area where you can add any content.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default InstitutionDashboard;
