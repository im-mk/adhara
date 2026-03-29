import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import OrderList from './pages/OrderList';
import OrderDetails from './pages/OrderDetails';
import NewOrder from './pages/NewOrder';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import Login from './pages/Login';
import Products from './pages/Products';
import Layout from './layout/Layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:customerId/orders/new" element={<NewOrder />} />
          <Route path="/orders/:orderId" element={<OrderDetails />} />
          <Route path="/customers/:customerId" element={<CustomerDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/products" element={<Products />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
