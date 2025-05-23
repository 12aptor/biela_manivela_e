import { useState } from "react";
import BielaManivelaForm from "./components/biela-manivel-form/BielaManivelaForm";
import BielaManivelaAnimation from "./components/biela-manivela-animation/BiealManivelaAnimation";
import { BielaManivelaParams } from "./lib/biela_manivela_e";
import { Toaster } from "sonner";
import "./App.css";

function App() {
  const [formData, setFormData] = useState<BielaManivelaParams>({
    Lm: "",
    Lb: "",
    e: "",
    theta_m_deg: "",
    theta_b_deg: "",
    s: "",
    vel_m: "",
    vel_b: "",
    vel_s: "",
    acc_m: "",
    acc_b: "",
    acc_s: "",
  });

  return (
    <div className="app-container">
      <div className="app">
        <BielaManivelaForm setFormData={setFormData} formData={formData} />
        <BielaManivelaAnimation formData={formData} />
      </div>

      <Toaster position="top-center" />
    </div>
  );
}

export default App;
