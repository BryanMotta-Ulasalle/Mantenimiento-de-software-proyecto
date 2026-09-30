import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../features/Autentication/pages/Login";
import Register from "../features/Autentication/pages/Register";
import DashboardPage from "../features/dashboard/page/DashboardPage";
import Inicio from "../features/Home/page/HomePage";
import OrdersPage from "../features/orders/pages/OrdersPage";
import CartPage from "../features/orders/pages/CartPage";
import MyOrdersPage from "../features/orders/pages/MyOrdersPage";
import OneProductPage from "../features/products/pages/customer/OneProductPage";
import ProductsCustomers from "../features/products/pages/customer/ProductsPage";
import CategoriesPage from "../features/products/pages/staff/CategoriesPage";
import StaffProductsPage from "../features/products/pages/staff/ProductsPage";
import ProfilePage from "../features/users/pages/shared/ProfilePage";
import RolesPage from "../features/users/pages/staff/RolesPage";
import UsersPage from "../features/users/pages/staff/UsersPage";
import PrivateLayout from "../layout/PrivateLayout";
import PublicLayout from "../layout/PublicLayout";
import PrivateRoute from "./PrivateRoute";
import RoleRoute from "./RoleRoute";

const staffRoles = ["Admin", "Employee"];
const adminRoles = ["Admin"];

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />

      <Route element={<PublicLayout />}>
        <Route path="/tienda/productos" element={<ProductsCustomers />} />
        <Route path="/tienda/productos/:id/" element={<OneProductPage />} />
        <Route
          path="/carrito"
          element={
            <PrivateRoute>
              <CartPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/cuenta"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/cuenta/ordenes"
          element={
            <PrivateRoute>
              <MyOrdersPage />
            </PrivateRoute>
          }
        />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <PrivateRoute>
            <PrivateLayout />
          </PrivateRoute>
        }
      >
        <Route
          path="/admin/productos"
          element={
            <RoleRoute allow={staffRoles}>
              <StaffProductsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/categorias"
          element={
            <RoleRoute allow={staffRoles}>
              <CategoriesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/usuarios"
          element={
            <RoleRoute allow={adminRoles}>
              <UsersPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <RoleRoute allow={adminRoles}>
              <DashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <RoleRoute allow={adminRoles}>
              <RolesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/ordenes"
          element={
            <RoleRoute allow={adminRoles}>
              <OrdersPage />
            </RoleRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
