import { MenuItem } from './types';

export const MENU_SIDEBAR: MenuItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: 'home',
    path: '/dashboard',
  },
  {
    id: 'search',
    title: 'Pesquisa',
    icon: 'search',
    path: '/search',
  },
  {
    id: 'profile',
    title: 'Perfil',
    icon: 'user',
    path: '/profile',
  },
];

export const MENU_HELP: MenuItem[] = [
  {
    id: 'help',
    title: 'Ajuda',
    icon: 'help',
    path: '/help',
  },
];
