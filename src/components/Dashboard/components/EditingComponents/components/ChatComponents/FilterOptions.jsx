import React from 'react';

const FilterOptions = ({ theme, selectedTone, onToneSelect, onSubToolSelect, selectedSubTool }) => {
  const tones = ['Formal', 'Casual', 'Professional', 'Creative'];
  const subTools = {
    'Formal': ['Academic', 'Business'],
    'Casual': ['Friendly', 'Relaxed'],
    'Professional': ['Report', 'Formal'],
    'Creative': ['Story', 'Poem'],
  };

  return (
    <div className={`p-1 border-b ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-zinc-850 border-zinc-700'} flex-shrink-0`}>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* Tone Selection */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">Tone:</span>
          <select
            value={selectedTone}
            onChange={(e) => {
              onToneSelect(e.target.value);
              onSubToolSelect(''); // Reset sub-tool when tone changes
            }}
            className={`border rounded-lg px-2 py-1 text-sm font-semibold
              ${theme === 'light'
                ? 'bg-white border-gray-300 text-gray-900'
                : 'bg-zinc-700 border-zinc-600 text-gray-100'}
              focus:ring-blue-500 focus:border-blue-500`}
          >
            {tones.map(tone => (
              <option key={tone} value={tone}>{tone}</option>
            ))}
          </select>
        </div>

        {/* Sub-tool Selection (conditionally rendered) */}
        {selectedTone && subTools[selectedTone] && subTools[selectedTone].length > 0 && (
          <div className="flex items-center gap-2 sm:mt-0">
            <span className="font-semibold text-sm">Style:</span>
            <select
              value={selectedSubTool}
              onChange={(e) => onSubToolSelect(e.target.value)}
              className={`border rounded-lg px-2 py-1 text-sm font-semibold
                ${theme === 'light'
                  ? 'bg-white border-gray-300 text-gray-900'
                  : 'bg-zinc-700 border-zinc-600 text-gray-100'}
                focus:ring-blue-500 focus:border-blue-500`}
            >
              <option value="">None</option>
              {subTools[selectedTone].map(subTool => (
                <option key={subTool} value={subTool}>{subTool}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterOptions;