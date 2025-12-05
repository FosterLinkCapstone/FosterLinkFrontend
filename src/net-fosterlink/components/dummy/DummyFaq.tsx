import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

export const DummyFaq = () => {
  return (
    <Card className="mb-4 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-10 ml-4"></div>
          <div className="flex-1 text-center">
            <h3 className="text-xl font-semibold mb-2">What are the basic requirements to become a foster parent?</h3>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <span>By</span>
              <Avatar className="h-5 w-5">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                  SM
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">sarahm</span>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-4">
            <ChevronDown className="h-6 w-6 text-gray-600" />
          </button>
        </div>
      </div>
      <div className="bg-gray-100 p-6 text-center">
        <p className="text-gray-700">
          Basic requirements typically include being at least 21 years old, passing background checks, completing training courses, and having adequate living space. Requirements may vary by state and agency.
        </p>
        <div className="mt-4">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            Click for more!
          </button>
        </div>
      </div>
    </Card>
  );
};