import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';

const NewChecklistPage = () => {
  const [forklifts, setForklifts] = useState([]);
  const [selectedForklift, setSelectedForklift] = useState('');
  const [initialHorimeter, setInitialHorimeter] = useState('');
  const [finalHorimeter, setFinalHorimeter] = useState('');
  const [showSafetyStop, setShowSafetyStop] = useState(false);
  const [safetyStopReason, setSafetyStopReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedHorimeter, setSuggestedHorimeter] = useState(0);

  const navigate = useNavigate();

  // Estrutura completa do checklist
  const [checklistItems, setChecklistItems] = useState({
    B_physical_condition: [
      { item: 'Pneus e Rodas', result: '', description: '', photo: null },
      { item: 'Torre de Elevação', result: '', description: '', photo: null },
      { item: 'Garfos/Carro de Carga', result: '', description: '', photo: null },
      { item: 'Lança', result: '', description: '', photo: null },
      { item: 'Vazamentos (óleo, água, combustível)', result: '', description: '', photo: null }
    ],
    C_levels_fluids: [
      { item: 'Nível de Combustível/Carga da Bateria', result: '', description: '', photo: null },
      { item: 'Nível de Óleo do Motor', result: '', description: '', photo: null },
      { item: 'Nível da Água/Líquido de Arrefecimento', result: '', description: '', photo: null },
      { item: 'Nível de Óleo do Sistema Hidráulico', result: '', description: '', photo: null },
      { item: 'Tampas (Combustível e Radiador)', result: '', description: '', photo: null }
    ],
    D_safety_systems: [
      { item: 'Freios (serviço)', result: '', description: '', photo: null },
      { item: 'Freios (estacionamento)', result: '', description: '', photo: null },
      { item: 'Embreagem', result: '', description: '', photo: null },
      { item: 'Pedais', result: '', description: '', photo: null },
      { item: 'Sistema de Direção', result: '', description: '', photo: null },
      { item: 'Caixa de Marcha/Reversão', result: '', description: '', photo: null },
      { item: 'Painel de Instrumentos', result: '', description: '', photo: null },
      { item: 'Ruídos Anormais', result: '', description: '', photo: null }
    ],
    E_cabin_safety: [
      { item: 'Cabine e Retrovisores/Espelhos', result: '', description: '', photo: null },
      { item: 'Banco e Cinto de Segurança', result: '', description: '', photo: null },
      { item: 'Buzina, Faróis, Luzes de Freio', result: '', description: '', photo: null },
      { item: 'Sistema de Alarme Sonoro (marcha ré)', result: '', description: '', photo: null },
      { item: 'Extintor de Incêndio', result: '', description: '', photo: null },
      { item: 'Limpeza e Organização', result: '', description: '', photo: null }
    ]
  });

  useEffect(() => {
    fetchForklifts();
  }, []);

  const fetchForklifts = async () => {
    try {
      const response = await api.get('/fleet');
      setForklifts(response.data);
    } catch (error) {
      console.error('Erro ao buscar empilhadeiras:', error);
    }
  };

  const handleForkliftChange = (e) => {
    const forkliftId = e.target.value;
    setSelectedForklift(forkliftId);
    
    const selected = forklifts.find(f => f.id == forkliftId);
    if (selected) {
      setSuggestedHorimeter(selected.last_horimeter);
      setInitialHorimeter(selected.last_horimeter.toString());
    }
  };

  const updateItemResult = (section, index, result) => {
    const updatedItems = { ...checklistItems };
    updatedItems[section][index].result = result;
    
    // Se for NC em item crítico, mostrar safety stop
    if (result === 'NC') {
      const criticalItems = ['Freios (serviço)', 'Freios (estacionamento)', 'Vazamentos (óleo, água, combustível)', 'Nível de Óleo do Motor', 'Sistema de Direção'];
      if (criticalItems.includes(updatedItems[section][index].item)) {
        setShowSafetyStop(true);
      }
    }

    setChecklistItems(updatedItems);
  };

  const updateItemDescription = (section, index, description) => {
    const updatedItems = { ...checklistItems };
    updatedItems[section][index].description = description;
    setChecklistItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedForklift) {
      alert('Selecione uma empilhadeira');
      return;
    }

    if (showSafetyStop && !safetyStopReason) {
      alert('Informe o motivo do Safety Stop e as ações tomadas');
      return;
    }

    setLoading(true);

    try {
      const checklistData = {
        forklift_id: parseInt(selectedForklift),
        initial_horimeter: parseFloat(initialHorimeter),
        final_horimeter: finalHorimeter ? parseFloat(finalHorimeter) : null,
        items_inspected: checklistItems,
        safety_stop_reason: safetyStopReason
      };

      await api.post('/checklists', checklistData);
      
      // Redirecionar para assinatura
      navigate('/signature', { 
        state: { 
          checklistData,
          hasSafetyStop: showSafetyStop
        } 
      });
    } catch (error) {
      console.error('Erro ao salvar checklist:', error);
      alert('Erro ao salvar checklist: ' + (error.response?.data?.error || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const hasNonConformities = () => {
    for (const section in checklistItems) {
      for (const item of checklistItems[section]) {
        if (item.result === 'NC') return true;
      }
    }
    return false;
  };

  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Novo Check-list de Inspeção</h2>
          <p>Preencha todos os itens de inspeção da empilhadeira</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Seleção de Empilhadeira e Horímetro */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#00aaff', marginBottom: '1rem' }}>A. Identificação e Horímetro</h3>
            
            <div className="form-group">
              <label className="form-label">Empilhadeira *</label>
              <select 
                className="form-control"
                value={selectedForklift}
                onChange={handleForkliftChange}
                required
              >
                <option value="">Selecione uma empilhadeira</option>
                {forklifts.map(forklift => (
                  <option key={forklift.id} value={forklift.id}>
                    {forklift.model} - {forklift.serial_number} 
                    {forklift.current_status === 'OUT_OF_SERVICE' && ' (Fora de Serviço)'}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Horímetro Inicial *</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={initialHorimeter}
                  onChange={(e) => setInitialHorimeter(e.target.value)}
                  placeholder={`Sugerido: ${suggestedHorimeter}`}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Horímetro Final</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={finalHorimeter}
                  onChange={(e) => setFinalHorimeter(e.target.value)}
                  placeholder="Preencher ao final do turno"
                />
              </div>
            </div>
          </div>

          {/* Safety Stop Alert */}
          {showSafetyStop && (
            <div className="alert alert-warning">
              <h4>⚠️ Safety Stop Ativado</h4>
              <p>Foram detectadas não conformidades críticas. A empilhadeira deve ser sinalizada como "Fora de Serviço".</p>
              <div className="form-group">
                <label className="form-label">Descreva as ações tomadas *</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={safetyStopReason}
                  onChange={(e) => setSafetyStopReason(e.target.value)}
                  placeholder="Descreva o problema e as medidas tomadas (notificação da manutenção, sinalização, etc.)"
                  required
                />
              </div>
            </div>
          )}

          {/* Seções do Checklist */}
          {Object.entries(checklistItems).map(([sectionKey, items]) => (
            <div key={sectionKey} className="checklist-section card">
              <h3 style={{ color: '#00aaff', marginBottom: '1rem' }}>
                {sectionKey === 'B_physical_condition' && 'B. Condição Física e Estrutural'}
                {sectionKey === 'C_levels_fluids' && 'C. Níveis e Fluidos'}
                {sectionKey === 'D_safety_systems' && 'D. Sistemas de Segurança e Operacionais'}
                {sectionKey === 'E_cabin_safety' && 'E. Cabine e Acessórios de Segurança'}
              </h3>
              
              <div className="checklist-items">
                {items.map((item, index) => (
                  <div 
                    key={index} 
                    className={`checklist-item ${item.result === 'NC' ? 'nc' : ''}`}
                  >
                    <div className="checklist-item-header">
                      <span className="checklist-item-name">{item.item}</span>
                      <div className="status-buttons">
                        <button
                          type="button"
                          className={`status-btn c ${item.result === 'C' ? 'active' : ''}`}
                          onClick={() => updateItemResult(sectionKey, index, 'C')}
                        >
                          C
                        </button>
                        <button
                          type="button"
                          className={`status-btn nc ${item.result === 'NC' ? 'active' : ''}`}
                          onClick={() => updateItemResult(sectionKey, index, 'NC')}
                        >
                          NC
                        </button>
                        <button
                          type="button"
                          className={`status-btn na ${item.result === 'NA' ? 'active' : ''}`}
                          onClick={() => updateItemResult(sectionKey, index, 'NA')}
                        >
                          NA
                        </button>
                      </div>
                    </div>

                    {item.result === 'NC' && (
                      <div className="nc-details">
                        <div className="form-group">
                          <label className="form-label">Descrição do Defeito *</label>
                          <textarea
                            className="form-control"
                            rows="2"
                            value={item.description}
                            onChange={(e) => updateItemDescription(sectionKey, index, e.target.value)}
                            placeholder="Descreva detalhadamente o problema encontrado"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button type="button" className="btn btn-outline">
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Continuar para Assinatura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewChecklistPage;
