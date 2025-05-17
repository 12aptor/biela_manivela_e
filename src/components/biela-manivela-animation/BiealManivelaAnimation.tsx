import React, { useEffect, useRef } from "react";
import "./BielaManivelaAnimation.css";
import { BielaManivelaParams } from "../../lib/biela_manivela_e";

interface BielaManivelaAnimationProps {
  formData: BielaManivelaParams;
}

const BielaManivelaAnimation: React.FC<BielaManivelaAnimationProps> = ({
  formData,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  const drawMechanism = (ctx: CanvasRenderingContext2D, width: number, height: number, theta_m_deg: number) => {
    ctx.clearRect(0, 0, width, height);

    const centerY = height / 2;
    const Lm = parseFloat(formData.Lm.toString()) || 1;
    const Lb = parseFloat(formData.Lb.toString()) || 2;
    const e = parseFloat(formData.e.toString()) || 0.5;
    const maxDimension = Lm + Lb + Math.abs(e);
    const scale = (width * 0.8) / maxDimension;
    const pivotX = width * 0.1;

    // Calcular ángulos y posición basados en la manivela
    const theta_m = (theta_m_deg * Math.PI) / 180;
    
    // Cálculo simplificado del ángulo de biela y posición (para demostración)
    // En una implementación real, usarías las ecuaciones del mecanismo
    const theta_b_deg = 90 - theta_m_deg * 0.5; // Aproximación simplificada
    const theta_b = (theta_b_deg * Math.PI) / 180;
    const s = Lm * Math.cos(theta_m) + Math.sqrt(Lb**2 - (Lm * Math.sin(theta_m) - e)**2); // Aproximación

    // Coordenadas de los componentes
    const crankX = pivotX + Lm * Math.cos(theta_m) * scale;
    const crankY = centerY + Lm * Math.sin(theta_m) * scale;
    const sliderX = pivotX + s * scale;
    const sliderY = centerY + e * scale;

    // Dibujar eje de referencia
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Dibujar manivela (Lm)
    ctx.beginPath();
    ctx.moveTo(pivotX, centerY);
    ctx.lineTo(crankX, crankY);
    ctx.strokeStyle = "#ff5722";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Dibujar biela (Lb)
    ctx.beginPath();
    ctx.moveTo(crankX, crankY);
    ctx.lineTo(sliderX, sliderY);
    ctx.strokeStyle = "#2196f3";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Dibujar corredera
    ctx.fillStyle = "#4caf50";
    ctx.fillRect(sliderX - 15, sliderY - 10, 30, 20);

    // Dibujar puntos de unión
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.arc(pivotX, centerY, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(crankX, crankY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Mostrar información
    ctx.fillStyle = "#333";
    ctx.font = "14px Arial";
    ctx.fillText(`Ángulo Manivela: ${theta_m_deg.toFixed(1)}°`, 10, 20);
    ctx.fillText(`Ángulo Biela: ${theta_b_deg.toFixed(1)}°`, 10, 40);
    ctx.fillText(`Posición Corredera: ${s.toFixed(2)}`, 10, 60);
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Ajustar tamaño del canvas
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = 400; // Altura fija
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Función de animación
    const animate = (time: number) => {
      if (!ctx) return;
      
      timeRef.current = time;
      const theta_m_deg = (time * 0.05) % 360; // Control de velocidad
      
      drawMechanism(ctx, canvas.width, canvas.height, theta_m_deg);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [formData]);

  const toggleAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    } else if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        animationRef.current = requestAnimationFrame(() => {
          drawMechanism(
            ctx,
            canvasRef.current?.width || 800,
            canvasRef.current?.height || 400,
            timeRef.current * 0.05 % 360
          );
        });
      }
    }
  };

  return (
    <div className="animation-container">
      <h2>Animación del Mecanismo</h2>
      <div className="canvas-wrapper">
        <canvas ref={canvasRef} className="mechanism-canvas"></canvas>
      </div>
      <div className="animation-controls">
        <button onClick={toggleAnimation}>
          {animationRef.current ? "Pausar" : "Reanudar"}
        </button>
      </div>
    </div>
  );
};

export default BielaManivelaAnimation;