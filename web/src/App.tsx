import './App.css';
import { BrowserRouter as Router, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import OrderList from './pages/OrderList';
import OrderDetails from './pages/OrderDetails';
import NewOrder from './pages/NewOrder';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import Login from './pages/Login';
import Products from './pages/Products';
import Layout from './layout/Layout';
import { isAuthenticated } from './auth';

const ProtectedRoutes = () => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: { pathname: location.pathname } }} />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const LoginRoute = () => {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return <Login />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<Home />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:customerId/orders/new" element={<NewOrder />} />
          <Route path="/orders/:orderId" element={<OrderDetails />} />
          <Route path="/customers/:customerId" element={<CustomerDetails />} />
          <Route path="/products" element={<Products />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
