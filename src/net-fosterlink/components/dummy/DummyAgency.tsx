import { Card } from "@/components/ui/card";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";

export const DummyAgency = ({ref} : {ref: React.RefObject<HTMLDivElement | null>}) => {
  return (
    <Card ref={ref} className="w-full h-fit max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row">
        <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-center">Caring Hearts Foster Agency</h2>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-gray-700 leading-relaxed">
              Our mission is to provide loving, stable homes for children in need while supporting foster families through every step of their journey. We believe every child deserves a safe and nurturing environment.
            </p>
          </div>

          <a 
            href="#"
            className="text-blue-500 hover:text-blue-700 inline-flex items-center gap-1 text-sm"
          >
            Visit Website <ExternalLink size={14} />
          </a>
        </div>

        <div className="w-full md:w-80 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start gap-4 mb-4">   
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <div className="text-gray-400 text-2xl">
                  EJ
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg">
                  Emily Johnson
                </h3>
                <div className="flex items-start gap-2 text-sm text-gray-600 mt-1">
                  <Phone size={14} className="flex-shrink-0 mt-0.5" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600 mt-1 break-all">
                  <Mail size={14} className="flex-shrink-0 mt-0.5" />
                  <span>emily@caringhearts.org</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="relative rounded-lg overflow-hidden border border-gray-200 mb-3 bg-gray-100 h-40 flex items-center justify-center">
              <MapPin size={48} className="text-gray-400" />
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
              <MapPin size={16} className="mt-0.5 flex-shrink-0" />
              <div>
                <div>123 Main Street</div>
                <div>Phoenix, AZ 85001</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};