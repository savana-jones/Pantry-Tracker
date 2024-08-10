// AnalyticsComponentClient.js
import { useEffect } from 'react';
import { analytics } from './firebase'; // Import your analytics object

const AnalyticsComponentClient = () => {
  useEffect(() => {
    if (analytics) {
      // Your analytics logic here
    }
  }, []);

  return null; // or your component's content
};

export default AnalyticsComponentClient;
