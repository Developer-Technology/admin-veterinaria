import { MenuItem } from "./menu.model";

export const MENU: MenuItem[] = [
    {
        id: 1,
        label: 'Menú De Navegación',
        isTitle: true
    },
    {
        id: 2,
        label: 'Dashboard',
        icon: 'ph-house-line-thin',
        link: '/dashboard',
        parentId: 1
    },
    {
        id: 3,
        label: 'Personas',
        icon: 'bi bi-person',
        subItems: [
            {
                id: 4,
                label: 'Clientes',
                link: '/clients',
                parentId: 3
            },
            {
                id: 5,
                label: 'Proveedores',
                link: '/suppliers',
                parentId: 3
            },
            {
                id: 6,
                label: 'Usuarios',
                link: '/users',
                parentId: 3
            }
        ]
    },
    {
        id: 7,
        label: 'Mascotas',
        icon: 'ph-twitter-logo-thin',
        subItems: [
            {
                id: 8,
                label: 'Especies',
                link: '/species',
                parentId: 7
            },
            {
                id: 9,
                label: 'Razas',
                link: '/breeds',
                parentId: 7
            },
            {
                id: 10,
                label: 'Vacunas',
                link: '/vaccines',
                parentId: 7
            },
            {
                id: 11,
                label: 'Mascotas',
                link: '/pets',
                parentId: 7
            }
        ]
    },
    {
        id: 12,
        label: 'Historias',
        icon: 'ph-heartbeat-thin',
        link: '/histories',
        parentId: 1
    },
    {
        id: 13,
        label: 'Empresa',
        icon: 'ph-gear-thin',
        link: '/settings',
        parentId: 1
    },
]