import { useState, useEffect } from 'react';
import { Eye, EyeOff, ChevronDown, FlaskConical } from 'lucide-react';

type SimMode = {
  id: string;
  label: string;
  shortLabel: string;
  category: string;
  prevalence: string;
  description: string;
  matrix: string | null;
};

const MODES: SimMode[] = [
  {
    id: 'none',
    label: 'Normal Vision',
    shortLabel: 'Normal',
    category: 'Baseline',
    prevalence: '—',
    description: 'Standard unfiltered view.',
    matrix: null,
  },
  {
    id: 'protanopia',
    label: 'Protanopia',
    shortLabel: 'Protan.',
    category: 'Red–Green',
    prevalence: '~1% males',
    description: 'Complete absence of red (L) cones. Red appears dark; red–green distinction is lost.',
    matrix:
      '0.152286 1.052583 -0.204868 0 0  0.114503 0.786281 0.099216 0 0  -0.003882 -0.048116 1.051998 0 0  0 0 0 1 0',
  },
  {
    id: 'deuteranopia',
    label: 'Deuteranopia',
    shortLabel: 'Deutan.',
    category: 'Red–Green',
    prevalence: '~1% males',
    description: 'Complete absence of green (M) cones. Most common form — red and green look similar.',
    matrix:
      '0.367322 0.860646 -0.227968 0 0  0.280085 0.672501 0.047413 0 0  -0.011820 0.042940 0.968881 0 0  0 0 0 1 0',
  },
  {
    id: 'tritanopia',
    label: 'Tritanopia',
    shortLabel: 'Tritan.',
    category: 'Blue–Yellow',
    prevalence: '<0.01%',
    description: 'Complete absence of blue (S) cones. Blue appears green; yellow looks pink.',
    matrix:
      '1.255528 -0.076749 -0.178779 0 0  -0.078411 0.930809 0.147602 0 0  0.004733 0.691367 0.303900 0 0  0 0 0 1 0',
  },
  {
    id: 'protanomaly',
    label: 'Protanomaly',
    shortLabel: 'Pro. weak',
    category: 'Red–Green (Weak)',
    prevalence: '~1% males',
    description: 'Reduced sensitivity to red (L) cones. Partial red-weakness — milder than protanopia.',
    matrix:
      '0.458064 0.679578 -0.137642 0 0  0.092785 0.846313 0.060902 0 0  -0.007494 -0.016807 1.024301 0 0  0 0 0 1 0',
  },
  {
    id: 'deuteranomaly',
    label: 'Deuteranomaly',
    shortLabel: 'Deu. weak',
    category: 'Red–Green (Weak)',
    prevalence: '~5% males',
    description: 'Reduced sensitivity to green (M) cones. Most prevalent form of color vision deficiency.',
    matrix:
      '0.547494 0.607765 -0.155259 0 0  0.181692 0.781742 0.036566 0 0  -0.010410 0.027275 0.983136 0 0  0 0 0 1 0',
  },
  {
    id: 'achromatopsia',
    label: 'Achromatopsia',
    shortLabel: 'Achrom.',
    category: 'No Color',
    prevalence: '~0.003%',
    description: 'Complete absence of color perception — the world appears entirely in shades of grey.',
    matrix:
      '0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  'Baseline': 'bg-gray-100 text-gray-600',
  'Red–Green': 'bg-red-100 text-red-700',
  'Blue–Yellow': 'bg-blue-100 text-blue-700',
  'Red–Green (Weak)': 'bg-orange-100 text-orange-700',
  'No Color': 'bg-gray-200 text-gray-700',
};

interface Props {
  children: React.ReactNode;
}

export function ColorBlindnessSimulator({ children }: Props) {
  const [activeId, setActiveId] = useState('none');
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const activeMode = MODES.find((m) => m.id === activeId)!;

  // Inject SVG filter defs once
  useEffect(() => {
    const svgId = 'cb-sim-svg-defs';
    if (!document.getElementById(svgId)) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('id', svgId);
      svg.setAttribute('aria-hidden', 'true');
      svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      MODES.filter((m) => m.matrix).forEach((m) => {
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', `cb-filter-${m.id}`);
        filter.setAttribute('color-interpolation-filters', 'linearRGB');
        const fcm = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
        fcm.setAttribute('type', 'matrix');
        fcm.setAttribute('values', m.matrix!);
        filter.appendChild(fcm);
        defs.appendChild(filter);
      });
      svg.appendChild(defs);
      document.body.prepend(svg);
    }
    return () => {
      // leave svg in DOM for performance; it's harmless
    };
  }, []);

  const filterStyle =
    activeMode.matrix
      ? { filter: `url(#cb-filter-${activeMode.id})` }
      : {};

  return (
    <>
      {/* Filtered app content */}
      <div style={filterStyle} className="transition-[filter] duration-300">
        {children}
      </div>

      {/* Floating panel */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-2 select-none">

        {/* Expanded panel */}
        {!isMinimized && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl w-80 overflow-hidden">
            {/* Header */}
            <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-white">Accessibility Validation</span>
                <span className="text-xs bg-amber-400 text-gray-900 px-1.5 py-0.5 rounded">DEV</span>
              </div>
              <button
                onClick={() => setIsMinimized(true)}
                className="text-gray-400 hover:text-white transition-colors text-lg leading-none"
                title="Minimize"
              >
                ×
              </button>
            </div>

            {/* Active mode banner */}
            <div className={`px-4 py-2.5 flex items-center justify-between border-b border-gray-100 ${
              activeId === 'none' ? 'bg-gray-50' : 'bg-amber-50'
            }`}>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Simulating</p>
                <p className={`text-sm ${activeId === 'none' ? 'text-gray-700' : 'text-amber-700'}`}>
                  {activeMode.label}
                </p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[activeMode.category]}`}>
                {activeMode.category}
              </span>
            </div>

            {/* Mode selector */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-full flex items-center justify-between text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 hover:border-gray-400 transition-colors bg-white"
                >
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span>{activeMode.label}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="absolute bottom-full mb-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10">
                    {MODES.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => {
                          setActiveId(mode.id);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                          activeId === mode.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div>
                          <p className={`text-sm ${activeId === mode.id ? 'text-blue-700' : 'text-gray-800'}`}>
                            {mode.label}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{mode.category}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[mode.category]}`}>
                            {mode.prevalence}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="px-4 py-3">
              <p className="text-xs text-gray-500 leading-relaxed">{activeMode.description}</p>
              {activeId !== 'none' && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                  <p className="text-xs text-amber-800">
                    <strong>Tip:</strong> Check that status indicators (normal/abnormal), charts, and alerts
                    remain distinguishable under this simulation.
                  </p>
                </div>
              )}
              {activeId === 'none' && (
                <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-2.5">
                  <p className="text-xs text-gray-500">
                    Select a simulation mode above to preview how the interface appears to users with colour vision deficiencies.
                  </p>
                </div>
              )}
            </div>

            {/* Quick-switch strip */}
            <div className="px-4 pb-3 flex flex-wrap gap-1.5">
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setActiveId(mode.id)}
                  title={mode.label}
                  className={`text-xs px-2 py-1 rounded-md border transition-colors ${
                    activeId === mode.id
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {mode.shortLabel}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Minimized FAB */}
        {isMinimized && (
          <button
            onClick={() => setIsMinimized(false)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl shadow-lg border transition-all ${
              activeId !== 'none'
                ? 'bg-amber-500 border-amber-600 text-white'
                : 'bg-gray-900 border-gray-700 text-white'
            }`}
            title="Open colour blindness simulator"
          >
            {activeId !== 'none' ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            <span className="text-xs">
              {activeId !== 'none' ? activeMode.shortLabel : 'CB Sim'}
            </span>
            <FlaskConical className="w-3.5 h-3.5 opacity-70" />
          </button>
        )}
      </div>
    </>
  );
}
