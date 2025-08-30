import { hasPermission } from '../utils/permissionUtils';

export default function Inventory() {
  const canViewInventory = hasPermission('INVENTORY_VIEW');

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold">Inventory Page</h2>
      {canViewInventory ? (
        <p>You have permission to view inventory. This is the content for the Inventory page.</p>
      ) : (
        <p className="text-red-500">You do not have permission to view inventory.</p>
      )}
    </div>
  );
}