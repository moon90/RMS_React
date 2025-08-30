import { hasPermission } from '../utils/permissionUtils';

export default function Kitchen() {
  const canViewKitchen = hasPermission('KITCHEN_VIEW');

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold">Kitchen Page</h2>
      {canViewKitchen ? (
        <p>You have permission to view the kitchen. This is the content for the Kitchen page.</p>
      ) : (
        <p className="text-red-500">You do not have permission to view the kitchen.</p>
      )}
    </div>
  );
}