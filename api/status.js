// pages/api/status.js
// 在内存中存储舵机状态
let servoStates = {
    1: { angle: 90, timestamp: Date.now() },
    2: { angle: 90, timestamp: Date.now() },
    3: { angle: 90, timestamp: Date.now() },
    4: { angle: 90, timestamp: Date.now() },
    5: { angle: 90, timestamp: Date.now() },
    6: { angle: 90, timestamp: Date.now() }
  };
  
  export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
  
    if (req.method === 'GET') {
      // 返回当前所有舵机状态
      res.json({
        success: true,
        servos: servoStates,
        timestamp: Date.now()
      });
    } else if (req.method === 'POST') {
      // 更新特定舵机状态
      const { servo, angle } = req.body;
      if (servo && angle !== undefined) {
        servoStates[servo] = {
          angle: parseInt(angle),
          timestamp: Date.now()
        };
        res.json({
          success: true,
          message: `舵机${servo}状态已更新为${angle}度`,
          servo: parseInt(servo),
          angle: parseInt(angle)
        });
      } else {
        res.status(400).json({ error: '缺少参数' });
      }
    }
  }