// Debug script for funnel tracker - Run this in browser console to debug funnel tracking issues
(function() {
  console.log('🔍 Seentics Funnel Tracker Debug Script');
  console.log('=====================================');
  
  // Check if tracker is loaded
  if (!window.seentics || !window.seentics.funnelTracker) {
    console.error('❌ Funnel tracker not loaded or not available');
    return;
  }
  
  const tracker = window.seentics.funnelTracker;
  
  // Get current page info
  const currentPath = window.location.pathname;
  const siteId = document.querySelector('script[data-site-id]')?.getAttribute('data-site-id');
  
  console.log('📍 Current page info:');
  console.log('  Path:', currentPath);
  console.log('  Site ID:', siteId);
  
  // Check active funnels
  const activeFunnels = tracker.getActiveFunnels();
  console.log('🎯 Active funnels:', activeFunnels);
  
  if (activeFunnels.length === 0) {
    console.warn('⚠️ No active funnels found');
    
    // Try to fetch funnels manually
    console.log('🔄 Attempting to fetch funnels manually...');
    const apiHost = window.location.hostname === 'localhost' ? 'http://localhost:8080' : `https://${window.location.hostname}`;
    
    fetch(`${apiHost}/api/v1/funnels/active?website_id=${siteId}`)
      .then(response => response.json())
      .then(data => {
        console.log('📥 Fetched funnels:', data);
        if (Array.isArray(data) && data.length > 0) {
          console.log('✅ Funnels available, but tracker not loading them properly');
          data.forEach(funnel => {
            console.log(`  Funnel: ${funnel.name} (${funnel.id})`);
            funnel.steps.forEach((step, index) => {
              console.log(`    Step ${index + 1}: ${step.name} - ${step.type} - ${step.condition?.page || step.condition?.event || 'N/A'}`);
              
              // Check if current page matches this step
              if (step.type === 'page' && step.condition?.page) {
                const matches = currentPath === step.condition.page || 
                               currentPath.includes(step.condition.page) ||
                               step.condition.page.includes(currentPath);
                console.log(`      Matches current page (${currentPath}): ${matches ? '✅' : '❌'}`);
              }
            });
          });
        } else {
          console.log('❌ No funnels returned from API');
        }
      })
      .catch(error => {
        console.error('❌ Error fetching funnels:', error);
      });
  } else {
    // Check funnel states
    activeFunnels.forEach(funnelId => {
      const state = tracker.getFunnelState(funnelId);
      console.log(`🎯 Funnel ${funnelId}:`, state);
    });
  }
  
  // Test manual funnel event trigger
  console.log('🧪 Testing manual funnel event trigger...');
  
  // If we know the funnel ID, test it
  const testFunnelId = '390093db-6f31-4485-8202-36ca7ba9c8cd'; // The funnel we found in the database
  
  try {
    const testEvent = tracker.triggerFunnelEvent(testFunnelId, 'test_page_visit', 1, {
      test_page: currentPath,
      debug: true
    });
    console.log('✅ Manual funnel event triggered:', testEvent);
  } catch (error) {
    console.error('❌ Error triggering manual funnel event:', error);
  }
  
  // Force page change monitoring
  console.log('🔄 Forcing page change monitoring...');
  try {
    tracker.monitorPageChanges();
    console.log('✅ Page change monitoring triggered');
  } catch (error) {
    console.error('❌ Error in page change monitoring:', error);
  }
  
  console.log('=====================================');
  console.log('🔍 Debug script completed');
})();
