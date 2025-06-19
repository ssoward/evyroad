import React, { useState, useRef } from 'react';

interface TripPhoto {
  id: string;
  url: string;
  caption: string;
  location: string;
  timestamp: Date;
  tripId: string;
}

interface TripStory {
  id: string;
  title: string;
  content: string;
  photos: TripPhoto[];
  distance: number;
  duration: string;
  route: string;
  date: Date;
  tags: string[];
  likes: number;
  isPublic: boolean;
}

const TripGalleryPage: React.FC = () => {
  const [stories, setStories] = useState<TripStory[]>([]);
  const [selectedStory, setSelectedStory] = useState<TripStory | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [newStory, setNewStory] = useState<Partial<TripStory>>({
    title: '',
    content: '',
    route: '',
    distance: 0,
    duration: '',
    tags: [],
    isPublic: true
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    loadTripStories();
  }, []);

  const loadTripStories = () => {
    // Mock data - replace with actual API calls
    const mockStories: TripStory[] = [
      {
        id: '1',
        title: 'Epic Mountain Pass Adventure',
        content: 'An incredible journey through the winding mountain roads with breathtaking views at every turn. The weather was perfect, and the bike performed flawlessly throughout the 300km journey.',
        photos: [
          {
            id: '1',
            url: '/ride.jpg',
            caption: 'Starting the journey at sunrise',
            location: 'Mountain Base',
            timestamp: new Date('2024-06-01T06:00:00'),
            tripId: '1'
          },
          {
            id: '2',
            url: '/ride.jpg',
            caption: 'Breathtaking mountain vista',
            location: 'Summit Point',
            timestamp: new Date('2024-06-01T12:00:00'),
            tripId: '1'
          }
        ],
        distance: 320,
        duration: '6 hours',
        route: 'Highway 1 → Mountain Pass → Scenic Route 66',
        date: new Date('2024-06-01'),
        tags: ['mountains', 'scenic', 'adventure'],
        likes: 24,
        isPublic: true
      },
      {
        id: '2',
        title: 'Coastal Highway Cruise',
        content: 'A relaxing ride along the Pacific Coast Highway. Perfect weather, light traffic, and stunning ocean views made this trip unforgettable.',
        photos: [
          {
            id: '3',
            url: '/ride.jpg',
            caption: 'Pacific Ocean views',
            location: 'Big Sur',
            timestamp: new Date('2024-05-28T14:00:00'),
            tripId: '2'
          }
        ],
        distance: 240,
        duration: '4 hours',
        route: 'PCH → Big Sur → Monterey',
        date: new Date('2024-05-28'),
        tags: ['coast', 'ocean', 'relaxing'],
        likes: 18,
        isPublic: true
      }
    ];
    setStories(mockStories);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedPhotos([...selectedPhotos, ...files]);
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos(selectedPhotos.filter((_, i) => i !== index));
  };

  const createStory = () => {
    if (!newStory.title || !newStory.content) return;

    const story: TripStory = {
      id: Date.now().toString(),
      title: newStory.title,
      content: newStory.content,
      photos: selectedPhotos.map((photo, index) => ({
        id: `${Date.now()}-${index}`,
        url: URL.createObjectURL(photo),
        caption: `Photo ${index + 1}`,
        location: 'Unknown',
        timestamp: new Date(),
        tripId: Date.now().toString()
      })),
      distance: newStory.distance || 0,
      duration: newStory.duration || '',
      route: newStory.route || '',
      date: new Date(),
      tags: newStory.tags || [],
      likes: 0,
      isPublic: newStory.isPublic || true
    };

    setStories([story, ...stories]);
    setShowCreateModal(false);
    setNewStory({
      title: '',
      content: '',
      route: '',
      distance: 0,
      duration: '',
      tags: [],
      isPublic: true
    });
    setSelectedPhotos([]);
  };

  const addTag = (tag: string) => {
    if (tag && !newStory.tags?.includes(tag)) {
      setNewStory({
        ...newStory,
        tags: [...(newStory.tags || []), tag]
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewStory({
      ...newStory,
      tags: newStory.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  const likeStory = (storyId: string) => {
    setStories(stories.map(story =>
      story.id === storyId
        ? { ...story, likes: story.likes + 1 }
        : story
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Trip Gallery & Stories</h1>
            <p className="text-gray-600">Share your motorcycle adventures with the community</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            📸 Create Story
          </button>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map(story => (
            <div key={story.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
              {/* Story Image */}
              <div className="relative h-48 bg-gray-200">
                {story.photos.length > 0 ? (
                  <img
                    src={story.photos[0].url}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-4xl">🏍️</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  {story.photos.length} photos
                </div>
              </div>

              {/* Story Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{story.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{story.content}</p>

                {/* Trip Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">Distance:</span>
                    <span className="ml-1 font-medium">{story.distance} km</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="ml-1 font-medium">{story.duration}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {story.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedStory(story)}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Read More
                  </button>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => likeStory(story.id)}
                      className="flex items-center text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <span className="mr-1">❤️</span>
                      <span className="text-sm">{story.likes}</span>
                    </button>
                    <span className="text-gray-400 text-sm">
                      {story.date.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {stories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No stories yet</h3>
            <p className="text-gray-600 mb-6">Share your first motorcycle adventure!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Your First Story
            </button>
          </div>
        )}
      </div>

      {/* Story Detail Modal */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{selectedStory.title}</h2>
              <button
                onClick={() => setSelectedStory(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Photo Gallery */}
              {selectedStory.photos.length > 0 && (
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedStory.photos.map(photo => (
                      <div key={photo.id} className="relative">
                        <img
                          src={photo.url}
                          alt={photo.caption}
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-lg p-4">
                          <p className="text-white text-sm font-medium">{photo.caption}</p>
                          <p className="text-white/80 text-xs">{photo.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Story Content */}
              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 leading-relaxed">{selectedStory.content}</p>
              </div>

              {/* Trip Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Trip Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Route:</span>
                    <p className="font-medium">{selectedStory.route}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Distance:</span>
                    <p className="font-medium">{selectedStory.distance} km</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <p className="font-medium">{selectedStory.duration}</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {selectedStory.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Story Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Create New Story</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Photos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary"
                  >
                    📸 Upload Photos
                  </button>
                  <p className="text-sm text-gray-500 mt-2">Upload multiple photos from your trip</p>
                </div>

                {/* Photo Preview */}
                {selectedPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {selectedPhotos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newStory.title}
                  onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                  className="w-full input-field"
                  placeholder="Give your trip story a catchy title"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Story</label>
                <textarea
                  value={newStory.content}
                  onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
                  className="w-full input-field"
                  rows={6}
                  placeholder="Tell us about your adventure..."
                />
              </div>

              {/* Trip Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
                  <input
                    type="number"
                    value={newStory.distance}
                    onChange={(e) => setNewStory({ ...newStory, distance: parseInt(e.target.value) || 0 })}
                    className="w-full input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={newStory.duration}
                    onChange={(e) => setNewStory({ ...newStory, duration: e.target.value })}
                    className="w-full input-field"
                    placeholder="e.g. 4 hours"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                  <input
                    type="text"
                    value={newStory.route}
                    onChange={(e) => setNewStory({ ...newStory, route: e.target.value })}
                    className="w-full input-field"
                    placeholder="e.g. Highway 1 → Big Sur"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newStory.tags?.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-primary-500 hover:text-primary-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add tag"
                    className="flex-1 input-field"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addTag((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                      addTag(input.value);
                      input.value = '';
                    }}
                    className="btn-secondary"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Visibility */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newStory.isPublic}
                  onChange={(e) => setNewStory({ ...newStory, isPublic: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-700">
                  Make this story public (visible to other riders)
                </label>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={createStory}
                  className="flex-1 btn-primary"
                  disabled={!newStory.title || !newStory.content}
                >
                  Create Story
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripGalleryPage;
