import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DummyThread } from '../components/dummy/DummyThread';
import { DummyFaq } from '../components/dummy/DummyFaq';
import { DummyAgency } from '../components/dummy/DummyAgency';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../backend/AuthContext';

export const Home = () => {
  const [currentModule, setCurrentModule] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const auth = useAuth()

  const modules = [
    {
      title: 'Module 1: Forums',
      paragraph: 'The forum is our approach to connecting existing foster parents with prospective ones. It will act as a way for those more knowledgeable in the specifics of foster care to share their ideas, skills and wisdom with those less knowledgeable.',
      card: <DummyThread />
    },
    {
      title: 'Module 2: FAQ',
      paragraph: 'The FAQ is our way of creating an objective, immutable source of general foster knowledge. Through a comprehensive verification process, we intend to have a solid foundation of articulate FAQ response authors, so that curious foster parents can have a source of information that they can trust. We will also allow anyone to submit suggestions for FAQ articles, which will allow our knowledge base to be tailored to answer the questions that are most needed.',
      card: <DummyFaq />
    },
    {
      title: 'Module 3: Agencies',
      paragraph: 'As an organization designed to promote knowledge of foster care, we are also invested in promoting other organizations with similar goals to us. The agencies module is our way of allowing representatives of other organizations (known locally as "agencies") to promote their websites and businesses. We believe that creating a network of individuals who care about providing accurate information about foster care will help boost confidence in new parents.',
      card: <DummyAgency />
    }
  ];

  const nextModule = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentModule((prev) => (prev + 1) % modules.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevModule = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentModule((prev) => (prev - 1 + modules.length) % modules.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navbar userInfo={auth.getUserInfo()}/>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">FosterLink</h1>
          <p className="text-xl leading-relaxed">
            Welcome to FosterLink! Our goal is to connect experienced foster parents with prospective foster parents, and to provide a unified resource hub for all things related to foster care. We believe that providing a one-stop-shop for foster information will promote increased awareness of what is needed to provide the highest quality care for children in need.
          </p>
        </div>
      </div>

      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Multi-Modal Approach</h2>
          <p className="text-lg text-gray-300">
            Our solution takes a multi-modal approach. This website is comprised of 3 modules: a forum, a FAQ, and a hub for agencies.
          </p>
        </div>
      </div>

      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div 
              className="overflow-hidden transition-all duration-500 ease-in-out"
            >
              <div 
                className="transition-transform duration-500 ease-in-out flex"
                style={{ transform: `translateX(-${currentModule * 100}%)` }}
              >
                {modules.map((module, index) => (
                  <div 
                    key={index} 
                    className="w-full flex-shrink-0 px-1"
                  >
                    <h2 className="text-3xl font-bold mb-6 text-gray-900">{module.title}</h2>
                    <p className="text-gray-700 mb-8 leading-relaxed">{module.paragraph}</p>
                    <div className="mb-8">
                      {module.card}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prevModule}
                disabled={isAnimating}
                className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous module"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              
              <div className="flex gap-2">
                {modules.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (!isAnimating) {
                        setIsAnimating(true);
                        setCurrentModule(index);
                        setTimeout(() => setIsAnimating(false), 500);
                      }
                    }}
                    disabled={isAnimating}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentModule ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to module ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextModule}
                disabled={isAnimating}
                className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next module"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            <div className="text-center text-gray-600 mt-4">
              {currentModule + 1} / {modules.length}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Want to promote your agency or write FAQ responses?</h2>
          <p className="text-lg mb-6">Message us at placeholder@email.com</p>
        </div>
      </div>

      <div className="bg-white py-8 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-600">
            We want your feedback! Report bugs or leave a comment about your experience here: <a target="_blank" href="https://forms.office.com/r/ehsghCatqK" className="text-blue-600 hover:text-blue-800 underline">feedback form</a>
          </p>
        </div>
      </div>
    </div>
  );
};