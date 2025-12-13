/**
 * Custom hook exports for easy access to contexts
 */

/**
 * Custom Hooks
 */

// Context hooks
export { useAuth } from '../contexts/AuthContext';
export { useTickets } from '../contexts/TicketContext';
export { useUsers } from '../contexts/UserContext';
export { usePermission } from '../contexts/PermissionContext';

// Utility hooks
export { useForm } from './useForm';
export type { UseFormOptions, UseFormReturn } from './useForm';

export { useModal } from './useModal';
export type { UseModalReturn } from './useModal';

export { useTable } from './useTable';
export type { UseTableOptions, UseTableReturn, SortDirection } from './useTable';

export { useDebounce } from './useDebounce';
