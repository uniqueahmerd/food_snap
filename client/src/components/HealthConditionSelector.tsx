import React from "react";
import { useTranslation } from "react-i18next";
import { HealthCondition } from "../types";
import {
  Heart,
  Activity,
  TrendingDown,
  Baby,
  Shield,
  AlertTriangle,
} from "lucide-react";

interface HealthConditionSelectorProps {
  value: HealthCondition;
  onChange: (condition: HealthCondition) => void;
  className?: string;
}

const HealthConditionSelector: React.FC<HealthConditionSelectorProps> = ({
  value,
  onChange,
  className = "",
}) => {
  const { t } = useTranslation();

  const conditions: Array<{
    value: HealthCondition;
    label: string;
    icon: React.ComponentType<any>;
    color: string;
    description: string;
  }> = [
    {
      value: "Normal",
      label: t("Normal"),
      icon: Heart,
      color: "text-green-600",
      description: "General healthy eating",
    },
    {
      value: "Diabetic",
      label: t("Diabetic"),
      icon: Activity,
      color: "text-blue-600",
      description: "Blood sugar management",
    },
    {
      value: "Hypertensive",
      label: t("Hypertensive"),
      icon: AlertTriangle,
      color: "text-red-600",
      description: "Blood pressure control",
    },
    {
      value: "Weight Loss",
      label: t("Weight Loss"),
      icon: TrendingDown,
      color: "text-purple-600",
      description: "Weight management",
    },
    {
      value: "Pregnant Nursing",
      label: t("Pregnant Nursing"),
      icon: Baby,
      color: "text-pink-600",
      description: "Maternal nutrition",
    },
    {
      value: "Cholesterol Watch",
      label: t("cholesterolWatch"),
      icon: Shield,
      color: "text-orange-600",
      description: "Heart health focus",
    },
  ];

  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as HealthCondition)}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm font-medium min-w-[180px]"
      >
        {conditions.map((condition) => (
          <option key={condition.value} value={condition.value}>
            {condition.label}
          </option>
        ))}
      </select>

      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
};

export default HealthConditionSelector;
