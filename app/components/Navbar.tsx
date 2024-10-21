// components/Navbar.tsx
'in Client'
import React, { SetStateAction, useState } from 'react';
import { AppBar, Avatar, Box, IconButton, Menu, MenuItem,ThemeProvider, Toolbar, Typography } from '@mui/material';
import { Apps, List } from '@mui/icons-material';
type NavbarProps = {
  onMenuOpen: (event: React.MouseEvent<HTMLButtonElement>) => void;
  anchorEl: HTMLElement | null;
  onMenuClose: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ onMenuOpen, anchorEl, onMenuClose }) => {
  return (
            <AppBar position="static">
            <Toolbar>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton color="inherit" onClick={onMenuOpen}>
                      <Avatar />
                  </IconButton>
                  <Typography variant="h6">Admin</Typography>
              </Box>
              
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onMenuClose}>
                <MenuItem onClick={onMenuClose}>My Account</MenuItem>
                <MenuItem onClick={onMenuClose}>Settings</MenuItem>
                <MenuItem onClick={onMenuClose}>Logout</MenuItem>
              </Menu>

           
            </Toolbar>
          </AppBar>
  );
};

export default Navbar;