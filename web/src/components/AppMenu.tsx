import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

const AppMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={handleMenu}
        >
          <MenuIcon />
        </IconButton>

        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          keepMounted
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          open={open}
          onClose={handleClose}
        >
          <MenuItem component={Link} to="/" onClick={handleClose}>Home</MenuItem>
          <MenuItem component={Link} to="/orders" onClick={handleClose}>Orders</MenuItem>
          <MenuItem component={Link} to="/customers" onClick={handleClose}>Customers</MenuItem>
          <MenuItem component={Link} to="/products" onClick={handleClose}>Products</MenuItem>
          <MenuItem component={Link} to="/login" onClick={handleClose}>Login</MenuItem>
        </Menu>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Orders
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default AppMenu;
