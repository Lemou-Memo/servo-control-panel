import React, { useState, useEffect } from 'react';

export default function ServoPanel() {
  const [servos, setServos] = useState({
    1: 90, 2: 90, 3: 90, 4: 90, 5: 90, 6: 90
  });

  // 每2秒检查状态
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/servo');
        const data = await response.json();
        if (data.servos) {
          setServos(data.servos);
        }
      } catch (error) {
        console.log('检查状态失败');
      }
    };

    checkStatus(); // 立即执行一次
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: '#1a1a2e', color: 'white', minHeight: '100vh' }}>
      <h1>舵机控制面板</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '30px' }}>
        {[1, 2, 3, 4, 5, 6].map(id => (
          <div key={id} style={{ 
            backgroundColor: '#16213e', 
            padding: '20px', 
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <h3>舵机 {id}</h3>
            <div style={{ fontSize: '2em', margin: '10px 0' }}>
              {servos[id]}°
            </div>
            <div style={{ 
              width: '100%', 
              height: '10px', 
              backgroundColor: '#333',
              borderRadius: '5px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(servos[id] / 180) * 100}%`,
                height: '100%',
                backgroundColor: '#4CAF50',
                transition: 'width 0.5s'
              }}></div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#16213e', borderRadius: '10px' }}>
        <h3>测试链接：</h3>
        <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
          <a href="/api/servo?servo=1&angle=0" target="_blank" style={{ color: '#4CAF50', display: 'block', margin: '5px 0' }}>
            /api/servo?servo=1&angle=0
          </a>
          <a href="/api/servo?servo=2&angle=90" target="_blank" style={{ color: '#4CAF50', display: 'block', margin: '5px 0' }}>
            /api/servo?servo=2&angle=90  
          </a>
          <a href="/api/servo?servo=3&angle=180" target="_blank" style={{ color: '#4CAF50', display: 'block', margin: '5px 0' }}>
            /api/servo?servo=3&angle=180
          </a>
        </div>
        <p style={{ color: '#888', fontSize: '12px', marginTop: '10px' }}>
          点击链接后，页面会在2秒内自动更新显示
        </p>
      </div>
    </div>
  );
}