import { useState } from 'react';
import { X, User, Sparkles, Save, RotateCcw } from 'lucide-react';
import type { Settings } from '../types';

interface Props {
  settings: Settings;
  onSave: (s: Settings) => void;
  onClose: () => void;
}

const PRESETS = [
  {
    name: 'Default Assistant',
    aiName: 'Snoah',
    prompt:
      'You are Snoah, a helpful, smart, and friendly AI assistant. You provide clear, accurate, and thoughtful responses.',
  },
  {
    name: 'Expert Coder',
    aiName: 'DevBot',
    prompt:
      'You are DevBot, an expert software engineer and coding assistant. You write clean, efficient, well-documented code. You prefer TypeScript, Python, and modern frameworks. Always explain your code choices.',
  },
  {
    name: 'Science Tutor',
    aiName: 'Nova',
    prompt:
      'You are Nova, a brilliant science and mathematics tutor. You explain complex concepts with clarity using analogies and examples. You use LaTeX notation for equations when helpful. You are patient and encouraging.',
  },
  {
    name: 'Creative Writer',
    aiName: 'Muse',
    prompt:
      'You are Muse, a creative writing assistant with a vivid imagination and poetic sensibility. You help craft compelling stories, poems, and creative content. You suggest imaginative ideas and help develop characters and plots.',
  },
  {
    name: 'Research Analyst',
    aiName: 'Atlas',
    prompt:
      'You are Atlas, a thorough research analyst. You provide comprehensive, well-structured analysis backed by logical reasoning. You present multiple perspectives, identify key insights, and organize information clearly.',
  },
];

export default function PersonalizationModal({ settings, onSave, onClose }: Props) {
  const [local, setLocal] = useState<Settings>({ ...settings });

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    setLocal((prev) => ({
      ...prev,
      aiName: preset.aiName,
      systemPrompt: preset.prompt,
    }));
  };

  const handleSave = () => {
    onSave(local);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 sticky top-0 bg-slate-900 z-10">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Sparkles size={16} className="text-violet-400" />
              AI Personalization
            </h2>
            <p className="text-xs text-slate-500">Customize AI name and persona</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Presets */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 block">
              Quick Presets
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium text-left border transition-all ${
                    local.aiName === preset.aiName
                      ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                  }`}
                >
                  <div className="font-semibold">{preset.aiName}</div>
                  <div className="text-slate-500 truncate">{preset.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <User size={14} className="text-violet-400" />
              AI Name
            </label>
            <input
              type="text"
              value={local.aiName}
              onChange={(e) => update('aiName', e.target.value)}
              placeholder="e.g. Snoah"
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
            />
          </div>

          {/* System Prompt */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Sparkles size={14} className="text-cyan-400" />
                System Prompt
              </label>
              <button
                onClick={() =>
                  update(
                    'systemPrompt',
                    'You are Snoah, a helpful, smart, and friendly AI assistant.'
                  )
                }
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                <RotateCcw size={10} />
                Reset
              </button>
            </div>
            <textarea
              value={local.systemPrompt}
              onChange={(e) => update('systemPrompt', e.target.value)}
              placeholder="Describe the AI's personality and behavior..."
              rows={6}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all resize-none leading-relaxed"
            />
            <p className="text-xs text-slate-600 mt-1.5">
              This prompt shapes how the AI behaves and responds.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100 hover:bg-slate-700 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-sm font-medium transition-all shadow-lg hover:shadow-violet-500/25"
          >
            <Save size={14} />
            Apply Persona
          </button>
        </div>
      </div>
    </div>
  );
}
