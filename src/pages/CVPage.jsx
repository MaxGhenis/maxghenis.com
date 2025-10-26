import { Download } from "lucide-react";

const CVPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Curriculum Vitae</h1>
        <a
          href="/cv/cv.pdf"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          download
        >
          <Download className="w-4 h-4" />
          Download PDF
        </a>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-sm text-gray-600">
        <a href="mailto:max@policyengine.org" className="hover:text-teal-600">
          max@policyengine.org
        </a>
        <span>+1.650.630.3657</span>
        <span>Washington, DC</span>
        <a href="https://maxghenis.com" className="hover:text-teal-600">
          maxghenis.com
        </a>
        <a href="https://github.com/maxghenis" className="hover:text-teal-600">
          github.com/maxghenis
        </a>
        <a
          href="https://linkedin.com/in/maxghenis"
          className="hover:text-teal-600"
        >
          linkedin.com/in/maxghenis
        </a>
        <a href="https://x.com/maxghenis" className="hover:text-teal-600">
          x.com/maxghenis
        </a>
        <a
          href="https://bsky.app/profile/maxghenis.bsky.social"
          className="hover:text-teal-600"
        >
          @maxghenis
        </a>
      </div>

      {/* Summary */}
      <section className="mb-12 bg-teal-50 border-l-4 border-teal-600 p-6 rounded-r-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Summary</h2>
        <p className="text-gray-700 leading-relaxed">
          Policy entrepreneur, technologist, and economist building computational
          tools that democratize policy analysis. Founder of PolicyEngine, a
          nonprofit software platform that computes personalized and
          population-level impacts of tax and benefit reforms. Expert in
          microsimulation modeling, machine learning for survey data enhancement,
          and economic impact assessment.
        </p>
      </section>

      {/* Embedded CV content */}
      <div className="prose prose-lg max-w-none">
        <iframe
          src="/cv/index.html#summary"
          className="w-full border-0"
          style={{ minHeight: "2000px" }}
          title="CV Content"
        />
      </div>
    </div>
  );
};

export default CVPage;
