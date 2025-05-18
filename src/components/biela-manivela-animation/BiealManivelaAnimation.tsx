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
  const prevFormDataRef = useRef<BielaManivelaParams>(formData);

  // Función para parsear valores numéricos seguros
  const parseSafe = (value: string, defaultValue: number = 0): number => {
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) => {
    const centerY = height / 2;
    const gridSize = 50;
    const gridPixelSize = gridSize * scale;
    
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 0.5;
    
    // Líneas verticales
    for (let x = 0; x < width; x += gridPixelSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      
      if (x > 0) {
        ctx.fillStyle = "#666";
        ctx.font = "10px Arial";
        ctx.fillText(`${Math.round(x / scale)}`, x - 10, centerY + 15);
      }
    }
    
    // Líneas horizontales
    for (let y = centerY - 5 * gridPixelSize; y < centerY + 5 * gridPixelSize; y += gridPixelSize) {
      if (y < 0 || y > height) continue;
      
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      
      if (Math.abs(y - centerY) > 5) {
        const value = Math.round((centerY - y) / scale);
        ctx.fillStyle = "#666";
        ctx.font = "10px Arial";
        ctx.fillText(`${value}`, 10, y + 4);
      }
    }
    
    // Eje central
    ctx.strokeStyle = "#999";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
  };

  const drawDimension = (
    ctx: CanvasRenderingContext2D,
    x1: number, y1: number,
    x2: number, y2: number,
    text: string
  ) => {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const offset = 20;
    
    const lineX = midX + offset * Math.cos(angle + Math.PI/2);
    const lineY = midY + offset * Math.sin(angle + Math.PI/2);
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(lineX, lineY);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    ctx.save();
    ctx.translate(lineX, lineY);
    ctx.rotate(angle);
    ctx.fillStyle = "#333";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(text, 0, -5);
    ctx.restore();
  };

  const drawMechanism = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    theta_m_deg: number,
    showCalculatedValues: boolean = false
  ) => {
    ctx.clearRect(0, 0, width, height);

    const centerY = height / 2;
    const Lm = parseSafe(formData.Lm, 1);
    const Lb = parseSafe(formData.Lb, 2);
    const e = parseSafe(formData.e, 0.5);
    const vel_m = parseSafe(formData.vel_m, 60); // Velocidad angular en RPM
    
    const maxDimension = Lm + Lb + Math.abs(e);
    const scale = Math.min(
      (width * 0.8) / maxDimension, 
      (height * 0.8) / (2 * Math.max(Lm, Math.abs(e)))
    );
    
    const pivotX = width * 0.1;
    drawGrid(ctx, width, height, scale);

    const theta_m = (theta_m_deg * Math.PI) / 180;
    
    // Cálculos cinemáticos
    const sin_theta_b = (Lm * Math.sin(theta_m) - e) / Lb;
    const theta_b = Math.asin(sin_theta_b);
    const theta_b_deg = (theta_b * 180) / Math.PI;
    const s = Lm * Math.cos(theta_m) + Lb * Math.cos(theta_b);

    // Velocidades y aceleraciones (usando valores del formData o calculados)
    const theta_m_form = parseSafe(formData.theta_m_deg);
    const useFormValues = !showCalculatedValues && theta_m_form !== 0;
    
    const display_theta_m = useFormValues ? theta_m_form : theta_m_deg;
    const display_theta_b = useFormValues ? parseSafe(formData.theta_b_deg) : theta_b_deg;
    const display_s = useFormValues ? parseSafe(formData.s) : s;
    const display_vel_m = parseSafe(formData.vel_m);
    const display_vel_b = parseSafe(formData.vel_b);
    const display_vel_s = parseSafe(formData.vel_s);
    const display_acc_m = parseSafe(formData.acc_m);
    const display_acc_b = parseSafe(formData.acc_b);
    const display_acc_s = parseSafe(formData.acc_s);

    // Coordenadas de los componentes
    const crankX = pivotX + Lm * Math.cos(theta_m) * scale;
    const crankY = centerY - Lm * Math.sin(theta_m) * scale;
    const sliderX = pivotX + s * scale;
    const sliderY = centerY - e * scale;

    // Dibujar manivela
    ctx.beginPath();
    ctx.moveTo(pivotX, centerY);
    ctx.lineTo(crankX, crankY);
    ctx.strokeStyle = "#ff5722";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Dibujar biela
    ctx.beginPath();
    ctx.moveTo(crankX, crankY);
    ctx.lineTo(sliderX, sliderY);
    ctx.strokeStyle = "#2196f3";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Dibujar corredera
    ctx.fillStyle = "#4caf50";
    ctx.fillRect(sliderX - 15, sliderY - 10, 30, 20);

    // Dibujar excentricidad
    if (e !== 0) {
      ctx.strokeStyle = "#9c27b0";
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(pivotX, centerY);
      ctx.lineTo(pivotX, sliderY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = "#9c27b0";
      ctx.font = "12px Arial";
      ctx.fillText(`e = ${e.toFixed(2)}`, pivotX + 5, (centerY + sliderY) / 2);
    }

    // Puntos de unión
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.arc(pivotX, centerY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(crankX, crankY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Información del mecanismo
    ctx.fillStyle = "#000";
    ctx.font = "14px Arial";
    let yPos = 20;
    ctx.fillText(`Manivela (Lm): ${Lm.toFixed(2)}`, 10, yPos); yPos += 20;
    ctx.fillText(`Biela (Lb): ${Lb.toFixed(2)}`, 10, yPos); yPos += 20;
    ctx.fillText(`Excentricidad (e): ${e.toFixed(2)}`, 10, yPos); yPos += 20;
    ctx.fillText(`Ángulo Manivela: ${display_theta_m.toFixed(1)}°`, 10, yPos); yPos += 20;
    ctx.fillText(`Ángulo Biela: ${display_theta_b.toFixed(1)}°`, 10, yPos); yPos += 20;
    ctx.fillText(`Posición Corredera (s): ${display_s.toFixed(2)}`, 10, yPos); yPos += 20;
    ctx.fillText(`Velocidad Manivela: ${display_vel_m.toFixed(1)} rpm`, 10, yPos); yPos += 20;
    ctx.fillText(`Velocidad Biela: ${display_vel_b.toFixed(1)} rad/s`, 10, yPos); yPos += 20;
    ctx.fillText(`Velocidad Corredera: ${display_vel_s.toFixed(1)} m/s`, 10, yPos); yPos += 20;
    ctx.fillText(`Acel. Manivela: ${display_acc_m.toFixed(1)} rad/s²`, 10, yPos); yPos += 20;
    ctx.fillText(`Acel. Biela: ${display_acc_b.toFixed(1)} rad/s²`, 10, yPos); yPos += 20;
    ctx.fillText(`Acel. Corredera: ${display_acc_s.toFixed(1)} m/s²`, 10, yPos);
    
    // Dimensiones
    ctx.strokeStyle = "#666";
    ctx.setLineDash([2, 2]);
    drawDimension(ctx, pivotX, centerY, crankX, crankY, `Lm=${Lm.toFixed(1)}`);
    drawDimension(ctx, crankX, crankY, sliderX, sliderY, `Lb=${Lb.toFixed(1)}`);
    ctx.setLineDash([]);
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reiniciar animación si cambian los parámetros importantes
    const importantParams = { Lm: formData.Lm, Lb: formData.Lb, e: formData.e, vel_m: formData.vel_m };
    const prevImportantParams = { Lm: prevFormDataRef.current.Lm, Lb: prevFormDataRef.current.Lb, e: prevFormDataRef.current.e, vel_m: prevFormDataRef.current.vel_m };
    
    if (JSON.stringify(importantParams) !== JSON.stringify(prevImportantParams)) {
      prevFormDataRef.current = formData;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      timeRef.current = 0;
    }

    // Ajustar tamaño del canvas
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = 650; // Altura suficiente para toda la información
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Función de animación
    const animate = (time: number) => {
      if (!ctx) return;
      
      if (timeRef.current === 0) timeRef.current = time;
      const elapsed = time - timeRef.current;
      const vel_m = parseSafe(formData.vel_m, 60);
      // Convertir RPM a grados por milisegundo
      const theta_m_deg = (elapsed * vel_m * 360 / 60000) % 360;
      
      drawMechanism(ctx, canvas.width, canvas.height, theta_m_deg, true);
      animationRef.current = requestAnimationFrame(animate);
    };

    // Iniciar animación o mostrar posición estática
    if (parseSafe(formData.vel_m, 0) !== 0) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      const theta_m_deg = parseSafe(formData.theta_m_deg);
      drawMechanism(ctx, canvas.width, canvas.height, theta_m_deg, false);
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [formData]);

  const toggleAnimation = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      
      // Al pausar, mostrar los valores del formulario
      const theta_m_deg = parseSafe(formData.theta_m_deg);
      drawMechanism(ctx, canvasRef.current.width, canvasRef.current.height, theta_m_deg, false);
    } else {
      // Al reanudar, iniciar animación
      timeRef.current = 0;
      const animate = (time: number) => {
        if (!ctx) return;
        
        if (timeRef.current === 0) timeRef.current = time;
        const elapsed = time - timeRef.current;
        const vel_m = parseSafe(formData.vel_m, 60);
        const theta_m_deg = (elapsed * vel_m * 360 / 60000) % 360;
        
        drawMechanism(ctx, canvasRef.current?.width || 800, canvasRef.current?.height || 650, theta_m_deg, true);
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  return (
    <div className="animation-container">
      <h2>Animación del Mecanismo Biela-Manivela</h2>
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