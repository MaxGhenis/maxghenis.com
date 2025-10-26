import { Download } from "lucide-react";

const CVPage = () => {
  return (
    <div className="py-8">
      <style>{`
        @media print {
          nav {
            display: none !important;
          }
          .print-hide {
            display: none !important;
          }
          iframe {
            height: auto !important;
            min-height: 0 !important;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 mb-6 print-hide">
        <a
          href="/cv/cv.pdf"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          download
        >
          <Download className="w-4 h-4" />
          Download PDF
        </a>
      </div>

      {/* Embedded CV content */}
      <iframe
        src="/cv/index.html"
        className="w-full border-0"
        style={{ minHeight: "3000px", display: "block" }}
        title="CV Content"
      />
    </div>
  );
};

export default CVPage;
