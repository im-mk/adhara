import './App.css';
import { BrowserRouter as Router, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { HomePage } from './features/home';
import { OrderListPage, OrderDetailsPage, NewOrderPage } from './features/orders';
import { CustomersPage, CustomerDetailsPage } from './features/customers';
import { LoginPage } from './features/auth';
import { ProductsPage } from './features/products';
import Layout from './layout/Layout';
import { isAuthenticated } from './auth.ts';

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

  return <LoginPage />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/orders" element={<OrderListPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/:customerId/orders/new" element={<NewOrderPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
          <Route path="/customers/:customerId" element={<CustomerDetailsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
