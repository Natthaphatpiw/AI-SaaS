'use client';

import { useState, useEffect } from 'react';

export function Terminal() {
  const [lineStep, setLineStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false); // 👈 Modal toggle

  const toggleModal = () => setIsOpen(!isOpen);

  const resumeBlocks = [
    <div key="top" className="flex justify-between items-start mb-1">
      <div className="text-[10px] leading-tight">
        345 Infinity Drive<br />
        Cambridge, MA 02139
      </div>
      <div className="text-center flex-1 px-1">
        <div className="font-bold text-sm">Matha Maddox</div>
        <div className="font-bold text-[10px] text-blue-900">matha@mit.edu</div>
        <div className="font-bold text-[10px] text-blue-900">(617) XXX-XXXX</div>
      </div>
      <div className="text-[10px] leading-tight text-right whitespace-nowrap">
        My Street<br />
        My City, My Country
      </div>
    </div>,


    <div key="exp-title" className="font-bold text-[11px] border-b border-black mt-2 mb-1 tracking-wide">EXPERIENCE</div>,

    <div key="exp-telecom" className="flex justify-between text-[11px] font-bold">
      <span>Telecommunications Company</span>
      <span className="whitespace-nowrap">Paris, France</span>
    </div>,
    <div key="exp-role" className="flex justify-between text-[10px] italic">
      <span>Operations Research Analyst</span>
      <span>June 20XX - Present</span>
    </div>,
    <ul key="exp-tasks1" className="list-disc pl-5 text-[10px]">
      <li>Assessed financial risks involved with online advertising-space exchanges</li>
      <li>Built models to increase company&apos;s margin from online ad-spaces by 5%</li>
    </ul>,

    <div key="lead-title" className="font-bold text-[11px] border-b border-black mt-2 mb-1 tracking-wide">LEADERSHIP</div>,

    <div key="lead-sca" className="flex justify-between text-[11px] font-bold">
      <span>MIT Student Cultural Association</span>
      <span className="whitespace-nowrap">Cambridge, MA</span>
    </div>,
    <div key="lead-sca-role" className="flex justify-between text-[10px] italic">
      <span>Treasurer</span>
      <span>May 20XX - Present</span>
    </div>,
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setLineStep((prev) => (prev < resumeBlocks.length - 1 ? prev + 1 : prev));
    }, 250);
    return () => clearTimeout(timer);
  }, [lineStep]);

  return (
    <>
      <div
        className="cursor-pointer w-full max-w-[380px] min-h-[250px] bg-white rounded-lg shadow border border-gray-300 mx-auto px-4 py-5 font-serif text-gray-900"
        onClick={toggleModal}
      >
        {resumeBlocks.map((block, idx) => (
          <div
            key={idx}
            className={`transition-opacity duration-300 ${
              idx > lineStep ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {block}
          </div>
        ))}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center"
          onClick={toggleModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl overflow-auto relative flex flex-col items-center"
            style={{
              width: 'min(95vw, 794px)',
              height: 'min(95vh, 1123px)',
              aspectRatio: '794/1123'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-orange-500"
              onClick={toggleModal}
              aria-label="Close"
            >
              ×
            </button>
            {/* ---- แสดงรูป A4 เต็ม ---- */}
            <img
              src="/MITCAPD-UndergraduateII.png"
              alt="Full Resume"
              className="w-full h-full object-contain rounded-lg"
              style={{
                maxWidth: '794px',
                maxHeight: '1123px'
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}