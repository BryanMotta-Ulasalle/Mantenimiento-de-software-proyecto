export const PUBLIC_NAV_LINKS = [
    {label: "Inicio", path:"/"},
    {label: "Tienda", path:"/tienda/productos"},
]

import { LayoutDashboard } from 'lucide-react';
import { Box } from 'lucide-react';
import { ChartColumnStacked } from 'lucide-react';
import { Users } from 'lucide-react';
import { KeySquare } from 'lucide-react';
import { ShoppingCart } from 'lucide-react';

export const PRIVATE_NAV_LINKS = [
    {label:"Dashboard", path:"/admin/dashboard", icon:LayoutDashboard, roles:["Admin"]},
    {label:"Productos", path:"/admin/productos", icon:Box, roles:["Admin", "Employee"]},
    {label:"Categorias", path:"/admin/categorias", icon:ChartColumnStacked, roles:["Admin", "Employee"]},
    {label:"Usuarios", path:"/admin/usuarios", icon:Users, roles:["Admin"]},
    {label:"Roles", path:"/admin/roles", icon:KeySquare, roles:["Admin"]},
    {label:"Ordenes", path:"/admin/ordenes", icon:ShoppingCart, roles:["Admin"]},
]
