import React, { useState } from 'react'
import {
  AppBar,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography
} from '@mui/material';
import { CloseFullscreenTwoTone, Menu } from '@mui/icons-material';

export default function MenuBar() {
  const [open, setOpen] = useState(false);

  const handleToggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <div>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleToggleDrawer}>
            <Menu />
          </IconButton>
          <Typography variant="h6">wikiMenu</Typography>
        </Toolbar>
      </AppBar>
      <Drawer open={open} onClose={handleToggleDrawer}>
        <List style={{ width: "15em", marginTop: "80px" }}>
          <ListItem>
            <ListItemIcon>
              <CloseFullscreenTwoTone />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CloseFullscreenTwoTone />
            </ListItemIcon>
            <ListItemText primary="About" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CloseFullscreenTwoTone />
            </ListItemIcon>
            <ListItemText primary="Contact" />
          </ListItem>
        </List>
      </Drawer>
    </div>
  )
}
