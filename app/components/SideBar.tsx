// components/Sidebar.tsx
import React from 'react';
import { Drawer, List, ListItemIcon, ListItemText, Box } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import { Home, PanelsLeftRight, Settings }  from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  return (
    <Drawer
      variant="persistent"
      open={open}
      onClose={onClose}
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ width: 240 }}>
        <List>
          <ListItem component="li">
            <ListItemIcon><Home /></ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem component="li">
            <ListItemIcon><PanelsLeftRight /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem component="li">
            <ListItemIcon><Settings /></ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
