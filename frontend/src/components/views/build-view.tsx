import React from "react";
import ModelArchitecture from "../dashboard/ModelArchitecture";
import DatasetSelector from "../dashboard/DatasetSelector";
import SaveModel from "../dashboard/SaveModel";
import LoadModels from "../dashboard/LoadModels";
import { useModel } from "../../contexts/ModelContext"

export default function BuildView() {
  const { layers, setLayers } = useModel();
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative z-10">
      <div className={`transform transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}>
        <h1 className="text-3xl font-bold text-white mb-6">Build your Neural Network</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 transform transition-all duration-700 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`} style={{ transitionDelay: '150ms' }}>
          <ModelArchitecture layers={layers} setLayers={setLayers} />
        </div>
        
        <div className={`flex flex-col gap-6 transform transition-all duration-700 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`} style={{ transitionDelay: '300ms' }}>
          <DatasetSelector />
          <SaveModel />
          <LoadModels />
        </div>
      </div>
    </div>
  );
}