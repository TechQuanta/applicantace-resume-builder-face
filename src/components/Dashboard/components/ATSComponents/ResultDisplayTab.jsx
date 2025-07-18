// ResultDisplayTab.jsx
import React from 'react';
import AtsResultDisplay from './AtsResultDisplay';

const ResultDisplayTab = ({ score, fullGeminiResponse, extractedResumeContent, error }) => {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar flex flex-col">
      <AtsResultDisplay
        score={score}
        fullGeminiResponse={fullGeminiResponse}
        extractedResumeContent={extractedResumeContent}
        error={error}
      />
    </div>
  );
};

export default ResultDisplayTab;