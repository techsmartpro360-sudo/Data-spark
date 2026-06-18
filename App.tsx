import { useState, useCallback } from 'react';
import { DataRow, AppView, Template } from './types';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import FileUpload from './components/FileUpload';
import CleaningWorkbench from './components/CleaningWorkbench';
import TemplatesPage from './components/TemplatesPage';
import PricingPage from './components/PricingPage';
import ConverterToolsPage from './components/ConverterToolsPage';

function App() {
  const [view, setView] = useState<AppView>('landing');
  const [data, setData] = useState<DataRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const handleDataLoaded = useCallback((loadedData: DataRow[], name: string) => {
    setData(loadedData);
    setFileName(name);
    setView('cleaning');
  }, []);

  const handleSelectTemplate = useCallback((template: Template) => {
    setSelectedTemplate(template);
    if (data.length > 0) {
      setView('cleaning');
    }
  }, [data]);

  const handleBack = useCallback(() => {
    setView('landing');
  }, []);

  const showNavbar = view !== 'cleaning';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {showNavbar && <Navbar view={view} setView={setView} />}

      {view === 'landing' && <LandingPage setView={setView} />}

      {view === 'upload' && (
        <FileUpload
          onDataLoaded={handleDataLoaded}
          onBack={handleBack}
        />
      )}

      {view === 'cleaning' && data.length > 0 && (
        <CleaningWorkbench
          data={data}
          fileName={fileName}
          selectedTemplate={selectedTemplate}
          onBack={() => setView('upload')}
          onGoToTemplates={() => setView('templates')}
        />
      )}

      {view === 'templates' && (
        <TemplatesPage
          onSelectTemplate={handleSelectTemplate}
          onBack={handleBack}
          setView={setView}
          hasData={data.length > 0}
        />
      )}

      {view === 'pricing' && (
        <PricingPage
          onBack={handleBack}
          setView={setView}
        />
      )}

      {view === 'tools' && (
        <ConverterToolsPage onBack={handleBack} />
      )}
    </div>
  );
}

export default App;
