import React, { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../api/api';

const SignaturePage = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { checklistData, hasSafetyStop } = location.state || {};

  if (!checklistData) {
    navigate('/checklist');
    return null;
  }

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.beginPath();
    ctx.moveTo(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
    
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.lineTo(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
    ctx.stroke();
  };

  const stopDrawing = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.closePath();
    setIsDrawing(false);
    setHasSignature(true);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSubmit = async () => {
    if (!hasSignature) {
      alert('Por favor, forneça sua assinatura digital');
      return;
    }

    try {
      const canvas = canvasRef.current;
      const signatureData = canvas.toDataURL();

      const finalChecklistData = {
        ...checklistData,
        digital_signature: signatureData
      };

      await api.post('/checklists', finalChecklistData);
      
      alert('Check-list salvo com sucesso!');
      navigate('/checklist');
    } catch (error) {
      console.error('Erro ao salvar check-list:', error);
      alert('Erro ao salvar check-list: ' + (error.response?.data?.error || 'Erro desconhecido'));
    }
  };

  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Assinatura Digital</h2>
          <p>Assine digitalmente para validar a inspeção</p>
        </div>

        {hasSafetyStop && (
          <div className="alert alert-warning">
            <strong>⚠️ ATENÇÃO:</strong> Este check-list contém não conformidades críticas. 
            A empilhadeira foi automaticamente sinalizada como "Fora de Serviço".
          </div>
        )}

        <div className="card">
          <h3 style={{ color: '#00aaff', marginBottom: '1rem' }}>Assinatura do Operador</h3>
          <p style={{ marginBottom: '1rem', color: '#ccc' }}>
            Assine no quadro abaixo usando o mouse ou o dedo (em dispositivos touch)
          </p>

          <canvas
            ref={canvasRef}
            className="signature-canvas"
            width={800}
            height={200}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={(e) => {
              e.preventDefault();
              startDrawing(e.touches[0]);
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              draw(e.touches[0]);
            }}
            onTouchEnd={stopDrawing}
          />

          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={clearSignature}
            >
              Limpar Assinatura
            </button>
            
            <div style={{ flex: 1 }}></div>
            
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={() => navigate('/checklist')}
            >
              Voltar
            </button>
            
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!hasSignature}
            >
              Finalizar Check-list
            </button>
          </div>
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0, 102, 204, 0.1)', borderRadius: '5px' }}>
          <h4 style={{ color: '#00aaff', marginBottom: '0.5rem' }}>Resumo da Inspeção</h4>
          <p><strong>Empilhadeira:</strong> {checklistData.forklift_id}</p>
          <p><strong>Horímetro Inicial:</strong> {checklistData.initial_horimeter}</p>
          <p><strong>Horímetro Final:</strong> {checklistData.final_horimeter || 'Não informado'}</p>
          <p><strong>Status:</strong> {hasSafetyStop ? 'NÃO CONFORME (Safety Stop)' : 'CONFORME'}</p>
        </div>
      </div>
    </div>
  );
};

export default SignaturePage;
