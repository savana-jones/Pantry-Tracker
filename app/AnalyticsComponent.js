// AnalyticsComponent.js
import dynamic from 'next/dynamic';

// Dynamically import the client-side only component
const AnalyticsComponentClient = dynamic(() => import('./AnalyticsComponentClient'), {
  ssr: false, // Disable server-side rendering for this component
});

const AnalyticsComponent = () => {
  return <AnalyticsComponentClient />;
};

export default AnalyticsComponent;
