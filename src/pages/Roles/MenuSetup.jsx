import { hasPermission } from '../../utils/permissionUtils';

export default function MenuSetup() {
  const canViewMenus = hasPermission('MENU_VIEW');
  const canCreateMenu = hasPermission('MENU_CREATE');
  const canUpdateMenu = hasPermission('MENU_UPDATE');
  const canDeleteMenu = hasPermission('MENU_DELETE');
  const canAssignMenuRole = hasPermission('MENU_ASSIGN_ROLE');
  const canUnassignMenuRole = hasPermission('MENU_UNASSIGN_ROLE');

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold">Menu Setup Page</h2>
      {canViewMenus || canCreateMenu || canUpdateMenu || canDeleteMenu || canAssignMenuRole || canUnassignMenuRole ? (
        <p>You have permissions to manage menus. This is the content for the Menu Setup page.</p>
      ) : (
        <p className="text-red-500">You do not have permission to view or manage menus.</p>
      )}
    </div>
  );
}