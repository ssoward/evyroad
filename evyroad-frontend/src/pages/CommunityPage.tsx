import React, { useState, useEffect } from 'react';

interface Rider {
  id: string;
  name: string;
  avatar: string;
  location: string;
  bikeModel: string;
  totalDistance: number;
  joinDate: Date;
  isOnline: boolean;
}

interface RideGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  location: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  nextRide?: {
    date: Date;
    destination: string;
    distance: number;
  };
  isJoined: boolean;
}

interface RideEvent {
  id: string;
  title: string;
  description: string;
  organizer: Rider;
  date: Date;
  meetingPoint: string;
  destination: string;
  distance: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  maxParticipants: number;
  currentParticipants: number;
  participants: Rider[];
  isJoined: boolean;
  status: 'upcoming' | 'ongoing' | 'completed';
}

const CommunityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'riders' | 'groups' | 'events'>('riders');
  const [riders, setRiders] = useState<Rider[]>([]);
  const [groups, setGroups] = useState<RideGroup[]>([]);
  const [events, setEvents] = useState<RideEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = () => {
    // Mock data - replace with actual API calls
    const mockRiders: Rider[] = [
      {
        id: '1',
        name: 'Alex Thompson',
        avatar: '🏍️',
        location: 'San Francisco, CA',
        bikeModel: 'Yamaha YZF-R6',
        totalDistance: 25000,
        joinDate: new Date('2023-01-15'),
        isOnline: true
      },
      {
        id: '2',
        name: 'Maria Rodriguez',
        avatar: '🏍️',
        location: 'Los Angeles, CA',
        bikeModel: 'Kawasaki Ninja 650',
        totalDistance: 18500,
        joinDate: new Date('2023-03-22'),
        isOnline: false
      },
      {
        id: '3',
        name: 'James Wilson',
        avatar: '🏍️',
        location: 'Seattle, WA',
        bikeModel: 'Harley Davidson Street 750',
        totalDistance: 32000,
        joinDate: new Date('2022-08-10'),
        isOnline: true
      }
    ];

    const mockGroups: RideGroup[] = [
      {
        id: '1',
        name: 'Bay Area Riders',
        description: 'Explore the scenic routes around San Francisco Bay Area with fellow enthusiasts.',
        memberCount: 127,
        location: 'Bay Area, CA',
        difficulty: 'intermediate',
        tags: ['scenic', 'weekend rides', 'coastal'],
        nextRide: {
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          destination: 'Half Moon Bay',
          distance: 85
        },
        isJoined: true
      },
      {
        id: '2',
        name: 'Mountain Adventurers',
        description: 'For riders who love challenging mountain passes and breathtaking elevation changes.',
        memberCount: 89,
        location: 'Colorado',
        difficulty: 'advanced',
        tags: ['mountains', 'challenging', 'adventure'],
        nextRide: {
          date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
          destination: 'Rocky Mountain National Park',
          distance: 220
        },
        isJoined: false
      },
      {
        id: '3',
        name: 'Weekend Cruisers',
        description: 'Relaxed rides for beginners and those who prefer leisurely weekend adventures.',
        memberCount: 203,
        location: 'Multiple States',
        difficulty: 'beginner',
        tags: ['relaxed', 'beginner-friendly', 'social'],
        isJoined: false
      }
    ];

    const mockEvents: RideEvent[] = [
      {
        id: '1',
        title: 'Coastal Highway Adventure',
        description: 'Join us for a scenic ride along the Pacific Coast Highway with stops at iconic viewpoints.',
        organizer: mockRiders[0],
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        meetingPoint: 'Golden Gate Bridge Visitor Center',
        destination: 'Monterey Bay',
        distance: 150,
        difficulty: 'moderate',
        maxParticipants: 15,
        currentParticipants: 8,
        participants: mockRiders.slice(0, 3),
        isJoined: true,
        status: 'upcoming'
      },
      {
        id: '2',
        title: 'Sunrise Mountain Ride',
        description: 'Early morning departure to catch the sunrise from the mountain peak. Intermediate to advanced riders welcome.',
        organizer: mockRiders[2],
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        meetingPoint: 'Mountain View Parking Lot',
        destination: 'Eagle Peak Summit',
        distance: 120,
        difficulty: 'challenging',
        maxParticipants: 10,
        currentParticipants: 6,
        participants: mockRiders.slice(1, 3),
        isJoined: false,
        status: 'upcoming'
      }
    ];

    setRiders(mockRiders);
    setGroups(mockGroups);
    setEvents(mockEvents);
  };

  const joinGroup = (groupId: string) => {
    setGroups(groups.map(group =>
      group.id === groupId
        ? { ...group, isJoined: true, memberCount: group.memberCount + 1 }
        : group
    ));
  };

  const leaveGroup = (groupId: string) => {
    setGroups(groups.map(group =>
      group.id === groupId
        ? { ...group, isJoined: false, memberCount: group.memberCount - 1 }
        : group
    ));
  };

  const joinEvent = (eventId: string) => {
    setEvents(events.map(event =>
      event.id === eventId
        ? { ...event, isJoined: true, currentParticipants: event.currentParticipants + 1 }
        : event
    ));
  };

  const leaveEvent = (eventId: string) => {
    setEvents(events.map(event =>
      event.id === eventId
        ? { ...event, isJoined: false, currentParticipants: event.currentParticipants - 1 }
        : event
    ));
  };

  const getDifficultyColor = (difficulty: string): string => {
    const colors: Record<string, string> = {
      easy: 'bg-green-100 text-green-800',
      beginner: 'bg-green-100 text-green-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      challenging: 'bg-red-100 text-red-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const filteredRiders = riders.filter(rider =>
    rider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rider.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rider.bikeModel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community</h1>
          <p className="text-gray-600">Connect with fellow riders, join groups, and participate in events</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search riders, groups, or events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { key: 'riders', label: 'Riders', count: filteredRiders.length },
              { key: 'groups', label: 'Groups', count: filteredGroups.length },
              { key: 'events', label: 'Events', count: filteredEvents.length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'riders' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRiders.map(rider => (
              <div key={rider.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
                      {rider.avatar}
                    </div>
                    {rider.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">{rider.name}</h3>
                    <p className="text-sm text-gray-500">{rider.location}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bike:</span>
                    <span className="font-medium">{rider.bikeModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Distance:</span>
                    <span className="font-medium">{rider.totalDistance.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since:</span>
                    <span className="font-medium">{rider.joinDate.getFullYear()}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 btn-secondary text-sm">
                    💬 Message
                  </button>
                  <button className="flex-1 btn-primary text-sm">
                    👥 Follow
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredGroups.map(group => (
              <div key={group.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{group.name}</h3>
                    <p className="text-gray-600 text-sm">{group.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(group.difficulty)}`}>
                    {group.difficulty}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">Members:</span>
                    <span className="ml-1 font-medium">{group.memberCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <span className="ml-1 font-medium">{group.location}</span>
                  </div>
                </div>

                {group.nextRide && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <h4 className="font-medium text-blue-900 mb-1">Next Ride</h4>
                    <div className="text-sm text-blue-800">
                      <p>{group.nextRide.destination} • {group.nextRide.distance} km</p>
                      <p>{group.nextRide.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {group.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 btn-secondary text-sm">
                    📋 View Details
                  </button>
                  {group.isJoined ? (
                    <button
                      onClick={() => leaveGroup(group.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      Leave Group
                    </button>
                  ) : (
                    <button
                      onClick={() => joinGroup(group.id)}
                      className="flex-1 btn-primary text-sm"
                    >
                      Join Group
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
            {filteredEvents.map(event => (
              <div key={event.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-grow">
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 mr-3">{event.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(event.difficulty)}`}>
                        {event.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{event.description}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span className="mr-4">📅 {event.date.toLocaleDateString()}</span>
                      <span className="mr-4">📍 {event.meetingPoint}</span>
                      <span>🏁 {event.destination}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-4">📏 {event.distance} km</span>
                      <span className="mr-4">👥 {event.currentParticipants}/{event.maxParticipants} riders</span>
                      <span>👤 Organized by {event.organizer.name}</span>
                    </div>
                  </div>
                </div>

                {/* Participants */}
                {event.participants.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Participants:</p>
                    <div className="flex -space-x-2">
                      {event.participants.slice(0, 5).map(participant => (
                        <div
                          key={participant.id}
                          className="w-8 h-8 bg-primary-100 rounded-full border-2 border-white flex items-center justify-center text-sm"
                          title={participant.name}
                        >
                          {participant.avatar}
                        </div>
                      ))}
                      {event.participants.length > 5 && (
                        <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center text-xs text-gray-600">
                          +{event.participants.length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button className="btn-secondary">
                    📋 View Details
                  </button>
                  {event.isJoined ? (
                    <button
                      onClick={() => leaveEvent(event.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Leave Event
                    </button>
                  ) : event.currentParticipants >= event.maxParticipants ? (
                    <button
                      disabled
                      className="bg-gray-300 text-gray-500 font-medium py-2 px-4 rounded-lg cursor-not-allowed"
                    >
                      Event Full
                    </button>
                  ) : (
                    <button
                      onClick={() => joinEvent(event.id)}
                      className="btn-primary"
                    >
                      Join Event
                    </button>
                  )}
                  <button className="btn-secondary">
                    💬 Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty States */}
        {((activeTab === 'riders' && filteredRiders.length === 0) ||
          (activeTab === 'groups' && filteredGroups.length === 0) ||
          (activeTab === 'events' && filteredEvents.length === 0)) && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {activeTab === 'riders' ? '👥' : activeTab === 'groups' ? '🏍️' : '📅'}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No {activeTab} found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? `No ${activeTab} match your search criteria.`
                : `Be the first to connect with the community!`
              }
            </p>
            {!searchTerm && (
              <button className="btn-primary">
                {activeTab === 'groups' ? 'Create Group' : activeTab === 'events' ? 'Create Event' : 'Invite Friends'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
