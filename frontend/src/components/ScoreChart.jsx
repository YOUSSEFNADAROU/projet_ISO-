import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './ScoreChart.css';

const ScoreChart = ({ score = 0, title = "Score Global", size = 'medium' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const radius = canvas.width / 2;
    const centerX = radius;
    const centerY = radius;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 10, 0, 2 * Math.PI);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 12;
    ctx.stroke();

    // Determine color based on score
    let fillColor = '#ef4444'; // red
    if (score >= 80) fillColor = '#16a34a'; // green
    else if (score >= 60) fillColor = '#f59e0b'; // orange
    else if (score >= 40) fillColor = '#f97316'; // orange-red

    // Draw score arc
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (score / 100) * 2 * Math.PI;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 10, startAngle, endAngle);
    ctx.strokeStyle = fillColor;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Draw center text
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${score}%`, centerX, centerY - 8);

    ctx.fillStyle = '#888';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Conformité', centerX, centerY + 16);
  }, [score]);

  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: 140, height: 140 };
      case 'large':
        return { width: 220, height: 220 };
      default:
        return { width: 180, height: 180 };
    }
  };

  const sizeConfig = getSize();

  return (
    <motion.div 
      className="score-chart-wrapper"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="score-chart-container">
        <canvas
          ref={canvasRef}
          width={sizeConfig.width}
          height={sizeConfig.height}
          className="score-chart-canvas"
        />
        {title && <p className="score-chart-title">{title}</p>}
      </div>
    </motion.div>
  );
};

export default ScoreChart;
