import React, { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Camera as CameraIcon,
  Upload,
  Zap,
  CheckCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import { NutritionAnalysis, HealthCondition } from "../types";
import HealthConditionSelector from "../components/HealthConditionSelector";
import TTSButton from "../components/TTSButton";
import api from "../lib/axios";

const Camera = () => {
  const { t } = useTranslation();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<NutritionAnalysis | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [healthCondition, setHealthCondition] = useState<HealthCondition | null>();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
 

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      // replace with toastify later
      alert(
        "Camera access denied. Please allow camera permissions and try again."
      );
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setCameraActive(false);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const analyzeImage = async (imageData: string) => {
    setAnalyzing(true);

    try {
      // ✅ Remove base64 prefix
      const cleanBase64 = imageData.replace(/^data:image\/\w+;base64,/, "");
      
      const response = await api.post("food/analyze",
        {
          image: cleanBase64 as string,
          healthCondition,
        },
        { timeout: 60000 }
      );

      const data = response.data;
         
      // 🔐 SAFETY FALLBACKS
      const dishName = data.food ?? "unknown_food";
      const confidence = data.confidence ?? 0;
      const nutrients = data.nutrients ?? {};
      const advice = data.advice;
      const substitute = data.substitute;

      setAnalysis({
        id: `analysis_${Date.now()}`,
        userId: "guest",
        dishName,
        confidence,
        imageUrl: imageData,
        nutrients,
        healthFlags: [
          {
            level: confidence > 0.7 ? "green" : "yellow",
            message:
              dishName === "unknown_food"
                ? "Food could not be confidently identified"
                : `Identified as ${dishName} with ${(confidence * 100).toFixed(
                    1
                  )}% confidence`,
          },
        ],
        advice,
        substitute,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("Analysis error:", err?.response?.data || err.message);
      // replace with toastify later
      alert("Failed to analyze image");
    } finally {
      setAnalyzing(false);
    }
  };

  

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        // replace with toastify later
        alert("File size too large. Please choose a smaller image.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCapturedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

 const handleHealthConditionChange = (condition: HealthCondition) => {
  setHealthCondition(condition);
};


  const resetCapture = () => {
    setCapturedImage(null);
    setAnalysis(null);
    setAnalyzing(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("camera")}
            </h1>
            <p className="text-gray-600">
              Capture or upload food images for AI-powered nutrition analysis
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                {t("healthCondition")}:
              </span>
              <HealthConditionSelector
                value={healthCondition as HealthCondition}
                onChange={handleHealthConditionChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Camera/Upload Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="aspect-square bg-gray-100 rounded-xl relative overflow-hidden mb-4">
            {!capturedImage && !cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                <CameraIcon className="h-16 w-16 text-gray-400" />
                <p className="text-gray-500 text-center">
                  Ready to capture food image
                </p>
                <p className="text-sm text-gray-400 text-center px-4">
                  Make sure the food is well-lit and clearly visible
                </p>
              </div>
            )}

            {cameraActive && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            )}

            {capturedImage && (
              <img
                src={capturedImage}
                alt="Captured food"
                className="w-full h-full object-cover"
              />
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="space-y-3">
            {!cameraActive && !capturedImage && (
              <>
                <button
                  onClick={startCamera}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CameraIcon className="h-5 w-5" />
                  <span>{t("capturePhoto")}</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center space-x-2 border border-gray-300 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Upload className="h-5 w-5" />
                  <span>{t("uploadImage")}</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </>
            )}

            {cameraActive && (
              <div className="flex space-x-3">
                <button
                  onClick={capturePhoto}
                  className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CameraIcon className="h-5 w-5" />
                  <span>Capture</span>
                </button>

                <button
                  onClick={stopCamera}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {capturedImage && !analysis && (
              <div className="flex space-x-3">
                <button
                  onClick={() => analyzeImage(capturedImage)}
                  disabled={analyzing}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Zap
                    className={`h-5 w-5 ${analyzing ? "animate-pulse" : ""}`}
                  />
                  <span>{analyzing ? t("analyzing") : t("analyzeFood")}</span>
                </button>

                <button
                  onClick={resetCapture}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {analysis && (
              <div className="flex space-x-3">
                {/* <button
                  onClick={saveAnalysis}
                  className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="h-5 w-5" />
                  <span>Save to Dashboard</span>
                </button> */}

                <button
                  onClick={resetCapture}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-green-700 hover:text-white transition-colors w-full"
                >
                  <span>New Scan</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Results */}
        <div className="space-y-6">
          {analyzing && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("analyzing")}
                </h3>
                <p className="text-gray-600">
                  Using AI to identify nutrients and health information
                </p>
                <div className="mt-4 bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    Analysis optimized for{" "}
                    <strong>{healthCondition?.replace("_", " ")}</strong>{" "}
                    condition
                  </p>
                </div>
              </div>
            </div>
          )}

          {analysis && (
            <>
              {/* Food Identification */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Food Identified
                  </h3>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-green-600">
                      {Math.round(analysis.confidence * 100)}% {t("confidence")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {analysis.dishName.toUpperCase().replace("_", " ")}
                  </h2>
                  <TTSButton text={`Food identified: ${analysis.dishName}`} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      Calories
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {analysis.nutrients?.calories ?? "0"}cal
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Protein</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {analysis.nutrients?.protein ?? "0"}g
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Nutrition */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t("nutrients")}
                </h3>

                <div className="space-y-3">
                  {Object.entries(analysis.nutrients).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center"
                    >
                      <span className="text-gray-600 capitalize">
                        {key.replace("_", " ")}
                      </span>
                      <span className="font-medium">
                        {value}
                        {key === "calories"
                          ? "cal"
                          : key.includes("sodium") || key.includes("calcium")
                          ? "mg"
                          : "g"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health Assessment */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Health Assessment
                  </h3>
                  <TTSButton
                    text={`Health assessment for ${healthCondition?.replace(
                      "_",
                      " "
                    )} condition: ${analysis.healthFlags
                      .map((f) => f.message)
                      .join(". ")}`}
                  />
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Analysis for:{" "}
                    <span className="font-medium capitalize">
                      {healthCondition?.replace("_", " ")}
                    </span>
                  </p>
                </div>
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  {analysis.advice}
                </div>

                <div className="space-y-3">
                  {analysis.healthFlags.map((flag, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg flex items-start space-x-3 ${
                        flag.level === "green"
                          ? "bg-green-50 border border-green-200"
                          : flag.level === "yellow"
                          ? "bg-yellow-50 border border-yellow-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      {flag.level === "green" && (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      )}
                      {flag.level === "yellow" && (
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      )}
                      {flag.level === "red" && (
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <p
                        className={`text-sm ${
                          flag.level === "green"
                            ? "text-green-800"
                            : flag.level === "yellow"
                            ? "text-yellow-800"
                            : "text-red-800"
                        }`}
                      >
                        {flag.message}
                      </p>
                    </div>
                  ))}
                  <div>{/* {analysis.advice} */}</div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t("recommendations")}
                  </h3>
                  {/* <TTSButton 
                    text={`Recommendations: ${analysis.substitute}`}
                  /> */}
                </div>

                {/* <div className="space-y-2">
                  <p className="flex items-start space-x-3">
                      {analysis.substitute}
                  </p>
                      <p>
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      </p>
                </div> */}

                <ul className="space-y-2">
                  {/* {analysis.recommendations.map((rec, index) => ( */}
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      {analysis.substitute}
                    </span>
                  </li>
                  {/* ))} */}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Camera;
