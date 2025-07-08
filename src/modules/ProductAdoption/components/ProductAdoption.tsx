import { useToast } from '@/hooks/useToast';
import { Button } from 'primereact/button';
import { TabPanel, TabView } from 'primereact/tabview';
import React, { useState } from 'react';
import { demoDataService } from '../services';
import { Tour } from '../types';
import AnalyticsDashboard from './Analytics';
import TourManagement from './Management';
import './ProductAdoption.scss';
import { TourBuilder } from './TourBuilder';

const ProductAdoption: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const showToast = useToast();

  const handleCreateTour = () => {
    setEditingTour(null);
    setIsCreating(true);
    setActiveTab(3); // Switch to builder tab
  };

  const handleEditTour = (tour: Tour) => {
    setEditingTour(tour);
    setIsCreating(false);
    setActiveTab(3); // Switch to builder tab
  };

  const handleSaveTour = (tour: Partial<Tour>) => {
    // Save logic is handled by the hooks
    setEditingTour(null);
    setIsCreating(false);
    setActiveTab(0); // Return to tours list
  };

  const handleCancelEdit = () => {
    setEditingTour(null);
    setIsCreating(false);
    setActiveTab(0); // Return to tours list
  };

  const handleViewAnalytics = (tourId: string) => {
    // TODO: Navigate to tour-specific analytics
    setActiveTab(1); // Switch to analytics tab
  };

  const handleInitializeDemoData = async () => {
    setIsLoadingDemo(true);
    try {
      const result = await demoDataService.initializeDemoData();
      if (result.success) {
        showToast.showSuccess('Demo Data Initialized', result.message);
        // Refresh the page to show new data
        window.location.reload();
      } else {
        showToast.showWarning('Demo Data', result.message);
      }
    } catch (error) {
      showToast.showError('Error', 'Failed to initialize demo data');
    } finally {
      setIsLoadingDemo(false);
    }
  };

  return (
    <div className='product-adoption'>
      <div className='product-adoption-header'>
        <div>
          <h1>Product Adoption</h1>
          <p>
            Create and manage product tours to guide users through your
            application
          </p>
        </div>
        <Button
          label='Initialize Demo Data'
          icon='pi pi-database'
          className='p-button-outlined p-button-secondary'
          onClick={handleInitializeDemoData}
          loading={isLoadingDemo}
          disabled={isLoadingDemo}
        />
      </div>

      <TabView
        activeIndex={activeTab}
        onTabChange={(e) => setActiveTab(e.index)}
        className='product-adoption-tabs'
      >
        <TabPanel
          header='Tours'
          leftIcon='pi pi-list'
        >
          <TourManagement
            onCreateTour={handleCreateTour}
            onEditTour={handleEditTour}
            onViewAnalytics={handleViewAnalytics}
          />
        </TabPanel>

        <TabPanel
          header='Analytics'
          leftIcon='pi pi-chart-line'
        >
          <AnalyticsDashboard />
        </TabPanel>

        <TabPanel
          header='Widgets'
          leftIcon='pi pi-th-large'
        >
          <div className='coming-soon'>
            <i className='pi pi-clock' />
            <h3>Widgets Coming Soon</h3>
            <p>Create tooltips, banners, and other engagement widgets</p>
          </div>
        </TabPanel>

        {(isCreating || editingTour) && (
          <TabPanel
            header={editingTour ? 'Edit Tour' : 'Create Tour'}
            leftIcon='pi pi-pencil'
          >
            <TourBuilder
              tour={editingTour || undefined}
              onSave={handleSaveTour}
              onCancel={handleCancelEdit}
            />
          </TabPanel>
        )}
      </TabView>
    </div>
  );
};

export default ProductAdoption;
