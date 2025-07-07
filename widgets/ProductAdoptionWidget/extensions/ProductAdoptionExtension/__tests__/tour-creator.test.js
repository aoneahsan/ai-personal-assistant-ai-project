// Tests for Tour Creator functionality

describe('Tour Creator', () => {
  beforeEach(() => {
    // Mock Chrome APIs
    global.chrome = {
      runtime: {
        onMessage: {
          addListener: jest.fn()
        },
        sendMessage: jest.fn()
      },
      storage: {
        local: {
          get: jest.fn().mockResolvedValue({}),
          set: jest.fn().mockResolvedValue()
        }
      }
    };
  });

  describe('Element Selection', () => {
    test('should generate unique CSS selector for element with ID', () => {
      const element = document.createElement('div');
      element.id = 'test-element';
      document.body.appendChild(element);

      const selector = getElementSelector(element);
      expect(selector).toBe('#test-element');

      document.body.removeChild(element);
    });

    test('should generate class-based selector for unique class', () => {
      const element = document.createElement('div');
      element.className = 'unique-class';
      document.body.appendChild(element);

      const selector = getElementSelector(element);
      expect(selector).toBe('.unique-class');

      document.body.removeChild(element);
    });

    test('should generate nth-child selector for elements without unique identifiers', () => {
      const parent = document.createElement('div');
      const child1 = document.createElement('span');
      const child2 = document.createElement('span');
      
      parent.appendChild(child1);
      parent.appendChild(child2);
      document.body.appendChild(parent);

      const selector = getElementSelector(child2);
      expect(selector).toContain(':nth-child(2)');

      document.body.removeChild(parent);
    });
  });

  describe('Tour Management', () => {
    test('should create new tour with default values', () => {
      const tour = createNewTour();
      
      expect(tour).toHaveProperty('id');
      expect(tour).toHaveProperty('name', 'New Tour');
      expect(tour).toHaveProperty('steps', []);
      expect(tour).toHaveProperty('createdAt');
      expect(tour).toHaveProperty('updatedAt');
    });

    test('should add step to tour', () => {
      const tour = createNewTour();
      const step = {
        target: '#test-button',
        title: 'Click here',
        content: 'This is a test step'
      };

      const updatedTour = addStepToTour(tour, step);
      
      expect(updatedTour.steps).toHaveLength(1);
      expect(updatedTour.steps[0]).toMatchObject(step);
      expect(updatedTour.steps[0]).toHaveProperty('id');
    });

    test('should save tour to storage', async () => {
      const tour = createNewTour();
      await saveTour(tour);

      expect(chrome.storage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({
          tours: expect.arrayContaining([tour])
        })
      );
    });
  });

  describe('API Communication', () => {
    test('should send tour to API when saving', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });

      const tour = createNewTour();
      const result = await saveTourToAPI(tour, 'test-token');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/tours'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
      expect(result.success).toBe(true);
    });
  });
});

// Helper functions (these would be imported from the actual implementation)
function getElementSelector(element) {
  if (element.id) return `#${element.id}`;
  if (element.className) return `.${element.className}`;
  
  let path = [];
  let current = element;
  
  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    const parent = current.parentElement;
    if (parent) {
      const children = Array.from(parent.children);
      const index = children.indexOf(current) + 1;
      selector += `:nth-child(${index})`;
    }
    path.unshift(selector);
    current = current.parentElement;
  }
  
  return path.join(' > ');
}

function createNewTour() {
  return {
    id: `tour_${Date.now()}`,
    name: 'New Tour',
    steps: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function addStepToTour(tour, step) {
  const newStep = {
    ...step,
    id: `step_${Date.now()}`
  };
  
  return {
    ...tour,
    steps: [...tour.steps, newStep],
    updatedAt: new Date().toISOString()
  };
}

async function saveTour(tour) {
  const { tours = [] } = await chrome.storage.local.get('tours');
  const updatedTours = [...tours.filter(t => t.id !== tour.id), tour];
  return chrome.storage.local.set({ tours: updatedTours });
}

async function saveTourToAPI(tour, token) {
  const response = await fetch('https://api.productadoption.com/v1/tours', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(tour)
  });
  
  return response.json();
}