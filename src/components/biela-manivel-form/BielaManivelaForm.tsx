import React, { ChangeEvent } from "react";
import "./BielaManivelaForm.css";
import { toast } from "sonner";
import { BielaManivela, BielaManivelaParams } from "../../lib/biela_manivela_e";

interface BielaManivelaFormProps {
  setFormData: (formData: BielaManivelaParams) => void;
  formData: BielaManivelaParams;
}

const BielaManivelaForm: React.FC<BielaManivelaFormProps> = ({
  setFormData,
  formData,
}) => {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const partialNumberRegex = /^[-+]?(?:\d+\.?\d*|\.\d*)?$/;

    if (!partialNumberRegex.test(value)) {
      return toast.error("El valor ingresado no es un número válido.");
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const calculateMechanism = () => {
    const bielaManivela = new BielaManivela();

    const paramsIsValid = bielaManivela.validateParams({
      Lm: formData.Lm,
      Lb: formData.Lb,
      e: formData.e,
      theta_m_deg: formData.theta_m_deg,
      theta_b_deg: formData.theta_b_deg,
      s: formData.s,
      vel_m: formData.vel_m,
      vel_b: formData.vel_b,
      vel_s: formData.vel_s,
      acc_m: formData.acc_m,
      acc_b: formData.acc_b,
      acc_s: formData.acc_s,
    });

    if (!paramsIsValid) {
      return;
    }

    const position = bielaManivela.equationOfMotion();
    if (position) {
      setFormData({
        ...formData,
        theta_m_deg: position.theta_m_deg.toFixed(2),
        theta_b_deg: position.theta_b_deg.toFixed(2),
        s: position.s.toFixed(2),
      });
    }
    const velocity = bielaManivela.calculateVelocity();
    if (velocity) {
      setFormData({
        ...formData,
        vel_m: velocity.theta_m_dot.toFixed(2),
        vel_b: velocity.theta_b_dot.toFixed(2),
        vel_s: velocity.s_dot.toFixed(2),
      });
    }

    setFormData({
      ...formData,
      theta_m_deg: position?.theta_m_deg.toFixed(2) || formData.theta_m_deg,
      theta_b_deg: position?.theta_b_deg.toFixed(2) || formData.theta_b_deg,
      s: position?.s.toFixed(2) || formData.s,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateMechanism();
  };

  return (
    <div className="container">
      <h1>Biela-Manivela</h1>

      <div className="form-group">
        <div className="row">
          <div className="input-group">
            <label htmlFor="Lm">Longitud de Manivela (Lm)</label>
            <input
              type="text"
              id="Lm"
              name="Lm"
              value={formData.Lm}
              onChange={handleInputChange}
              step="any"
            />
          </div>
          <div className="input-group">
            <label htmlFor="Lb">Longitud de Biela (Lb)</label>
            <input
              type="text"
              id="Lb"
              name="Lb"
              value={formData.Lb}
              onChange={handleInputChange}
              step="any"
            />
          </div>
          <div className="input-group">
            <label htmlFor="e">Excentricidad (e)</label>
            <input
              type="text"
              id="e"
              name="e"
              value={formData.e}
              onChange={handleInputChange}
              step="any"
            />
          </div>
        </div>
      </div>

      <div className="section-header">Posiciones</div>
      <div className="row">
        <div className="input-group">
          <label htmlFor="theta_m_deg">Ángulo de Manivela</label>
          <input
            type="text"
            id="theta_m_deg"
            name="theta_m_deg"
            value={formData.theta_m_deg}
            onChange={handleInputChange}
            step="any"
          />
        </div>
        <div className="input-group">
          <label htmlFor="theta_b_deg">Ángulo de Biela</label>
          <input
            type="text"
            id="theta_b_deg"
            name="theta_b_deg"
            value={formData.theta_b_deg}
            onChange={handleInputChange}
            step="any"
          />
        </div>
        <div className="input-group">
          <label htmlFor="s">Posición de Corredera (s)</label>
          <input
            type="text"
            id="s"
            name="s"
            value={formData.s}
            onChange={handleInputChange}
            step="any"
          />
        </div>
      </div>

      <div className="section-header">Velocidades</div>
      <div className="row">
        <div className="input-group">
          <label htmlFor="vel_m">Velocidad Manivela</label>
          <input
            type="text"
            id="vel_m"
            name="vel_m"
            value={formData.vel_m}
            onChange={handleInputChange}
            step="any"
          />
        </div>
        <div className="input-group">
          <label htmlFor="vel_b">Velocidad Biela</label>
          <input
            type="text"
            id="vel_b"
            name="vel_b"
            value={formData.vel_b}
            onChange={handleInputChange}
            step="any"
          />
        </div>
        <div className="input-group">
          <label htmlFor="vel_s">Velocidad Corredera</label>
          <input
            type="text"
            id="vel_s"
            name="vel_s"
            value={formData.vel_s}
            onChange={handleInputChange}
            step="any"
          />
        </div>
      </div>

      <div className="section-header">Aceleraciones</div>
      <div className="row">
        <div className="input-group">
          <label htmlFor="acc_m">Aceleración Manivela</label>
          <input
            type="text"
            id="acc_m"
            name="acc_m"
            value={formData.acc_m}
            onChange={handleInputChange}
            step="any"
          />
        </div>
        <div className="input-group">
          <label htmlFor="acc_b">Aceleración Biela</label>
          <input
            type="text"
            id="acc_b"
            name="acc_b"
            value={formData.acc_b}
            onChange={handleInputChange}
            step="any"
          />
        </div>
        <div className="input-group">
          <label htmlFor="acc_s">Aceleración Corredera</label>
          <input
            type="text"
            id="acc_s"
            name="acc_s"
            value={formData.acc_s}
            onChange={handleInputChange}
            step="any"
          />
        </div>
      </div>

      <button className="submit-btn" onClick={handleSubmit}>
        Calcular
      </button>
    </div>
  );
};

export default BielaManivelaForm;
