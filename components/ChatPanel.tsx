import React, { useState } from 'react';
import { QueryPayload, InternalFileData } from '../types';
import { Search, Upload, FileType, Play, Settings2, X, CheckCircle2 } from 'lucide-react';
import { readFileContent } from '../utils/fileHelpers';

interface ChatPanelProps {
  onSearch: (payload: QueryPayload) => void;
  isProcessing: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ onSearch, isProcessing }) => {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('India');
  const [molecule, setMolecule] = useState('');
  const [generatePdf, setGeneratePdf] = useState(true);
  
  const [file, setFile] = useState<File | null>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.preventDefault();
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    let fileData: InternalFileData | undefined = undefined;

    if (file) {
      setIsReadingFile(true);
      try {
        const content = await readFileContent(file);
        fileData = {
          name: file.name,
          content: content,
          type: file.type.includes('pdf') ? 'pdf' : 'txt'
        };
      } catch (err) {
        console.error("File read error", err);
        alert("Failed to read file. Proceeding without attachment.");
      } finally {
        setIsReadingFile(false);
      }
    }

    onSearch({
      query,
      region,
      molecule: molecule || undefined,
      generate_pdf: generatePdf,
      fileData
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-slate-700 mb-1">
            Research Objective
          </label>
          <div className="relative">
            <textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Find whitespace opportunities in respiratory diseases (COPD) in India considering recent patent expiries."
              className="w-full min-h-[100px] p-4 pr-12 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none text-slate-800 placeholder-slate-400"
              disabled={isProcessing || isReadingFile}
            />
            <div className="absolute bottom-3 right-3">
               <button 
                type="submit" 
                disabled={!query.trim() || isProcessing || isReadingFile}
                className={`p-2 rounded-lg transition-all ${!query.trim() || isProcessing || isReadingFile ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'}`}
              >
                {isProcessing || isReadingFile ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                )}
               </button>
            </div>
          </div>
        </div>

        {/* Filters & Options */}
        <div className="flex flex-col md:flex-row gap-4 pt-2">
          <div className="flex-1">
             <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
               <Settings2 className="w-3 h-3" /> Scope
             </label>
             <div className="grid grid-cols-2 gap-3">
               <select 
                  value={region} 
                  onChange={(e) => setRegion(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                  disabled={isProcessing || isReadingFile}
                >
                  <option>India</option>
                  <option>USA</option>
                  <option>Europe</option>
                  <option>Japan</option>
                </select>
               <input 
                  type="text" 
                  placeholder="Specific Molecule (Optional)" 
                  value={molecule}
                  onChange={(e) => setMolecule(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                  disabled={isProcessing || isReadingFile}
                />
             </div>
          </div>

          <div className="flex-1">
             <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
               <Upload className="w-3 h-3" /> Context (Internal Data)
             </label>
             <div className="flex items-center justify-center w-full">
                {!file ? (
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-[42px] border-2 border-slate-200 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-2 text-slate-500">
                          <FileType className="w-4 h-4" />
                          <span className="text-sm">Upload PDF/CSV</span>
                      </div>
                      <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.csv,.txt" disabled={isProcessing || isReadingFile} />
                  </label>
                ) : (
                  <div className="flex items-center justify-between w-full h-[42px] px-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <div className="flex items-center gap-2 overflow-hidden">
                       <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                       <span className="text-sm text-indigo-700 font-medium truncate max-w-[150px]">{file.name}</span>
                    </div>
                    <button onClick={clearFile} className="p-1 hover:bg-indigo-100 rounded-full text-indigo-500">
                       <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 pt-2">
          <input 
            type="checkbox" 
            id="pdf" 
            checked={generatePdf} 
            onChange={(e) => setGeneratePdf(e.target.checked)}
            className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500"
            disabled={isProcessing}
          />
          <label htmlFor="pdf" className="text-sm font-medium text-slate-600">Generate downloadable PDF report at completion</label>
        </div>
      </form>
    </div>
  );
};