import React, { ChangeEvent, useState } from "react";
import { BielaManivela } from "../lib/biela_manivela_e";
import "./BielaManivelaForm.css";

const BielaManivelaForm: React.FC = () => {
  const [formData, setFormData] = useState({
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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  const calculateMechanism = () => {
    const bielaManivela = new BielaManivela({
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

    const paramsIsValid = bielaManivela.validateParams();

    if (!paramsIsValid) {
      return;
    }

    const position = bielaManivela.equationOfMotion();
    if (position) {
      setFormData({
        ...formData,
        theta_m_deg: parseFloat(position.theta_m_deg.toFixed(2)),
        theta_b_deg: parseFloat(position.theta_b_deg.toFixed(2)),
        s: parseFloat(position.s.toFixed(2)),
      });
    }
    const velocity = bielaManivela.calculateVelocity();
    if (velocity) {
      setFormData({
        ...formData,
        vel_m: parseFloat(velocity.theta_m_dot.toFixed(2)),
        vel_b: parseFloat(velocity.theta_b_dot.toFixed(2)),
        vel_s: parseFloat(velocity.s_dot.toFixed(2)),
      });
    }
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
              type="number"
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
              type="number"
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
              type="number"
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
          <label htmlFor="theta_m_deg">Theta Manivela</label>
          <input
            type="number"
            id="theta_m_deg"
            name="theta_m_deg"
            value={formData.theta_m_deg}
            onChange={handleInputChange}
            step="any"
          />
        </div>
        <div className="input-group">
          <label htmlFor="theta_b_deg">Theta Biela</label>
          <input
            type="number"
            id="theta_b_deg"
            name="theta_b_deg"
            value={formData.theta_b_deg}
            onChange={handleInputChange}
            step="any"
          />
        </div>
        <div className="input-group">
          <label htmlFor="s">Posición Corredera (s)</label>
          <input
            type="number"
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
            type="number"
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
            type="number"
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
            type="number"
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
            type="number"
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
            type="number"
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
            type="number"
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
