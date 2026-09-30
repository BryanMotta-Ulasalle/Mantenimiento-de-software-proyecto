import P from '../../P';
import H5 from './../../H5';
import { Link } from 'react-router-dom';

const AccountList = ({ name, email, role, handleLogout, isAdmin, isEmployee}) => {
    return (
        <div className='absolute right-0 top-12 w-60 flex flex-col gap-5 bg-white rounded-2xl shadow-2xl p-5 text-stone-900'>
            <div className='flex flex-col'>
                <H5>{name}</H5>
                <P>{email}</P>
                <span className='mt-2 w-fit text-sm bg-orange-100 text-orange-800 px-2 rounded-lg'>{role}</span>
            </div>
            <div className='border-y-1 border-textGray flex flex-col gap-3 py-3'>
                {
                    isAdmin && (
                        <Link to="/admin/dashboard">Dashboard</Link>
                    )
                }
                {
                    isEmployee && (
                        <Link to="/admin/productos">Productos</Link>
                    )
                }
                <Link to="/cuenta/ordenes">Mis Ordenes</Link>
                <Link to="/cuenta">Perfil</Link>
            </div>
            <div>
                <button className='text-red-600 font-medium hover:bg-red-100 w-full text-left px-2 py-3 cursor-pointer' onClick={handleLogout}>Cerrar Sesion</button>
            </div>
        </div>
    )
}

export default AccountList
