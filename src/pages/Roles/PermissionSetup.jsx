import { hasPermission } from '../../utils/permissionUtils';

export default function PermissionSetup() {
  const canViewPermissions = hasPermission('PERMISSION_VIEW');
  const canCreatePermission = hasPermission('PERMISSION_CREATE');
  const canUpdatePermission = hasPermission('PERMISSION_UPDATE');
  const canDeletePermission = hasPermission('PERMISSION_DELETE');

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold">Permission Setup Page</h2>
      {canViewPermissions || canCreatePermission || canUpdatePermission || canDeletePermission ? (
        <p>You have permissions to manage permissions. This is the content for the Permission Setup page.</p>
      ) : (
        <p className="text-red-500">You do not have permission to view or manage permissions.</p>
      )}
    </div>
  );
}