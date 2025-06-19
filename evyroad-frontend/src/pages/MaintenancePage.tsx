import React, { useState, useEffect } from 'react';

interface MaintenanceItem {
  id: string;
  type: 'oil_change' | 'tire_check' | 'brake_check' | 'chain_maintenance' | 'general_service' | 'custom';
  description: string;
  lastService: Date;
  nextDue: Date;
  mileage: number;
  status: 'due' | 'overdue' | 'upcoming' | 'completed';
  bikeId: string;
  cost?: number;
  notes?: string;
}

interface Bike {
  id: string;
  name: string;
  model: string;
  year: number;
  mileage: number;
}

const MaintenanceTracker: React.FC = () => {
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([]);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [selectedBike, setSelectedBike] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState<Partial<MaintenanceItem>>({
    type: 'oil_change',
    description: '',
    mileage: 0,
    cost: 0,
    notes: ''
  });

  useEffect(() => {
    loadMaintenanceData();
  }, []);

  const loadMaintenanceData = () => {
    // Mock data - replace with actual API calls
    const mockBikes: Bike[] = [
      { id: '1', name: 'My Yamaha', model: 'YZF-R6', year: 2023, mileage: 15000 },
      { id: '2', name: 'Weekend Cruiser', model: 'Harley Davidson', year: 2021, mileage: 25000 }
    ];

    const mockMaintenance: MaintenanceItem[] = [
      {
        id: '1',
        type: 'oil_change',
        description: 'Engine Oil Change',
        lastService: new Date('2024-05-15'),
        nextDue: new Date('2024-08-15'),
        mileage: 12000,
        status: 'due',
        bikeId: '1',
        cost: 120,
        notes: 'Use synthetic oil'
      },
      {
        id: '2',
        type: 'tire_check',
        description: 'Tire Inspection & Pressure Check',
        lastService: new Date('2024-06-01'),
        nextDue: new Date('2024-07-01'),
        mileage: 14500,
        status: 'overdue',
        bikeId: '1',
        cost: 50
      },
      {
        id: '3',
        type: 'brake_check',
        description: 'Brake Pad Inspection',
        lastService: new Date('2024-04-20'),
        nextDue: new Date('2024-10-20'),
        mileage: 11000,
        status: 'upcoming',
        bikeId: '2',
        cost: 200
      }
    ];

    setBikes(mockBikes);
    setMaintenanceItems(mockMaintenance);
    if (mockBikes.length > 0) {
      setSelectedBike(mockBikes[0].id);
    }
  };

  const getMaintenanceIcon = (type: string): string => {
    const icons: Record<string, string> = {
      oil_change: '🛢️',
      tire_check: '🛞',
      brake_check: '🚲',
      chain_maintenance: '⛓️',
      general_service: '🔧',
      custom: '📝'
    };
    return icons[type] || '🔧';
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      due: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      overdue: 'bg-red-100 text-red-800 border-red-200',
      upcoming: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getDaysUntilDue = (dueDate: Date): number => {
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const markAsCompleted = (itemId: string) => {
    setMaintenanceItems(items =>
      items.map(item =>
        item.id === itemId
          ? { ...item, status: 'completed' as const, lastService: new Date() }
          : item
      )
    );
  };

  const addMaintenanceItem = () => {
    if (!newItem.description || !selectedBike) return;

    const item: MaintenanceItem = {
      id: Date.now().toString(),
      type: newItem.type as MaintenanceItem['type'],
      description: newItem.description,
      lastService: new Date(),
      nextDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      mileage: newItem.mileage || 0,
      status: 'upcoming',
      bikeId: selectedBike,
      cost: newItem.cost,
      notes: newItem.notes
    };

    setMaintenanceItems([...maintenanceItems, item]);
    setShowAddModal(false);
    setNewItem({
      type: 'oil_change',
      description: '',
      mileage: 0,
      cost: 0,
      notes: ''
    });
  };

  const filteredItems = selectedBike
    ? maintenanceItems.filter(item => item.bikeId === selectedBike)
    : maintenanceItems;

  const urgentItems = filteredItems.filter(item => 
    item.status === 'overdue' || (item.status === 'due' && getDaysUntilDue(item.nextDue) <= 7)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Maintenance Tracker</h1>
        <p className="text-gray-600">Keep your bike in perfect condition with scheduled maintenance</p>
      </div>

      {/* Urgent Alerts */}
      {urgentItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <span className="text-red-600 text-xl mr-2">⚠️</span>
            <h3 className="text-lg font-semibold text-red-800">Urgent Maintenance Required</h3>
          </div>
          <div className="space-y-2">
            {urgentItems.map(item => (
              <div key={item.id} className="text-red-700">
                <span className="font-medium">{item.description}</span>
                {item.status === 'overdue' ? (
                  <span className="ml-2 text-sm">- Overdue by {Math.abs(getDaysUntilDue(item.nextDue))} days</span>
                ) : (
                  <span className="ml-2 text-sm">- Due in {getDaysUntilDue(item.nextDue)} days</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Bike Selector */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Select Bike</h3>
            <select
              value={selectedBike}
              onChange={(e) => setSelectedBike(e.target.value)}
              className="w-full input-field"
            >
              <option value="">All Bikes</option>
              {bikes.map(bike => (
                <option key={bike.id} value={bike.id}>
                  {bike.name} ({bike.year} {bike.model})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Overdue:</span>
                <span className="font-medium text-red-600">
                  {filteredItems.filter(item => item.status === 'overdue').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Soon:</span>
                <span className="font-medium text-yellow-600">
                  {filteredItems.filter(item => item.status === 'due').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Upcoming:</span>
                <span className="font-medium text-blue-600">
                  {filteredItems.filter(item => item.status === 'upcoming').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed:</span>
                <span className="font-medium text-green-600">
                  {filteredItems.filter(item => item.status === 'completed').length}
                </span>
              </div>
            </div>
          </div>

          {/* Add New Item */}
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full btn-primary"
          >
            ➕ Add Maintenance Item
          </button>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Maintenance Schedule</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredItems.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p>No maintenance items found.</p>
                  <p className="text-sm mt-1">Add your first maintenance item to get started!</p>
                </div>
              ) : (
                filteredItems.map(item => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <span className="text-2xl mr-4">{getMaintenanceIcon(item.type)}</span>
                        <div className="flex-grow">
                          <h4 className="font-semibold text-gray-900 mb-1">{item.description}</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Last service: {item.lastService.toLocaleDateString()}</p>
                            <p>Next due: {item.nextDue.toLocaleDateString()}</p>
                            <p>Mileage: {item.mileage.toLocaleString()} km</p>
                            {item.cost && <p>Cost: ${item.cost}</p>}
                            {item.notes && <p>Notes: {item.notes}</p>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                        
                        {item.status !== 'completed' && (
                          <button
                            onClick={() => markAsCompleted(item.id)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {item.status !== 'completed' && (
                      <div className="mt-3 text-sm">
                        {item.status === 'overdue' ? (
                          <span className="text-red-600 font-medium">
                            ⚠️ Overdue by {Math.abs(getDaysUntilDue(item.nextDue))} days
                          </span>
                        ) : item.status === 'due' ? (
                          <span className="text-yellow-600 font-medium">
                            📅 Due in {getDaysUntilDue(item.nextDue)} days
                          </span>
                        ) : (
                          <span className="text-blue-600">
                            📅 Due in {getDaysUntilDue(item.nextDue)} days
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Maintenance Item</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value as MaintenanceItem['type'] })}
                  className="w-full input-field"
                >
                  <option value="oil_change">Oil Change</option>
                  <option value="tire_check">Tire Check</option>
                  <option value="brake_check">Brake Check</option>
                  <option value="chain_maintenance">Chain Maintenance</option>
                  <option value="general_service">General Service</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full input-field"
                  placeholder="Enter maintenance description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Mileage (km)</label>
                <input
                  type="number"
                  value={newItem.mileage}
                  onChange={(e) => setNewItem({ ...newItem, mileage: parseInt(e.target.value) || 0 })}
                  className="w-full input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
                <input
                  type="number"
                  value={newItem.cost}
                  onChange={(e) => setNewItem({ ...newItem, cost: parseFloat(e.target.value) || 0 })}
                  className="w-full input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  className="w-full input-field"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={addMaintenanceItem}
                className="flex-1 btn-primary"
                disabled={!newItem.description}
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceTracker;
