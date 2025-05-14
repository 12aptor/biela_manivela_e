import BielaManivelaForm from "./components/BielaManivelaForm";
import { Toaster } from "sonner";
import "./App.css";

function App() {
  return (
    <div className="app">
      <BielaManivelaForm />
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
