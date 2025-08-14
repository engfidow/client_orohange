
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  GridIcon,
  UserCircleIcon,
  TableIcon,
  PieChartIcon,
  CalenderIcon,
  HorizontaLDots,
  
} from '../icons';
import { RiLogoutCircleRLine } from "react-icons/ri";

import { useSidebar } from '../context/SidebarContext';


type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
};

// Menu definitions for admin and staff
const adminMenus: NavItem[] = [
  { name: 'Dashboard', path: '/admin-dashboard', icon: <GridIcon /> },
  { name: 'Children', path: '/children', icon: <UserCircleIcon /> },
  { name: 'Staff', path: '/staff', icon: <UserCircleIcon /> },
  { name: 'Donations', path: '/donations', icon: <TableIcon /> },
  { name: 'Reports', path: '/reports', icon: <PieChartIcon /> },
  { name: 'Users', path: '/users', icon: <UserCircleIcon /> },
  { name: 'Profile', path: '/profile', icon: <CalenderIcon /> },
];

const staffMenus: NavItem[] = [
  { name: 'Dashboard', path: '/staff-dashboard', icon: <GridIcon /> },
  { name: 'Children', path: '/children', icon: <UserCircleIcon /> },
  { name: 'Donations', path: '/donations', icon: <TableIcon /> },
  { name: 'Profile', path: '/profile', icon: <CalenderIcon /> },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const role = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')!).role
    : 'guest';

  const navItems = role === 'admin' ? adminMenus : staffMenus;

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/signin');
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? 'w-[290px]'
            : isHovered
            ? 'w-[290px]'
            : 'w-[90px]'
        }
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <h1 className='text-orange-600 text-2xl font-bold'>Orphanage</h1>
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>

      {/* Menu */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <h2
            className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
              !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
            }`}
          >
            {isExpanded || isHovered || isMobileOpen ? 'Menu' : <HorizontaLDots className="size-6" />}
          </h2>
          <ul className="flex flex-col gap-4">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`menu-item group ${
                    isActive(item.path)
                      ? 'menu-item-active'
                      : 'menu-item-inactive'
                  }`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      isActive(item.path)
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive'
                    }`}
                  >
                    {item.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{item.name}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
         {/* Logout */}
        <div className="mb-10 mx-[14px]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-sm font-semibold text-orange-500 hover:text-orange-600 transition w-full"
          >
           
            <RiLogoutCircleRLine className='w-6 h-6'/>
            {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">Logout</span>}
          </button>
        </div>
       
      </div>
    </aside>
  );
};

export default AppSidebar;
