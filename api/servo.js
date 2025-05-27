// 全局状态存储
let servoStates = {
  1: 90, 2: 90, 3: 90, 4: 90, 5: 90, 6: 90
};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { servo, angle } = req.query;
  
  if (servo && angle) {
    // 更新状态
    servoStates[servo] = parseInt(angle);
    
    return res.json({ 
      success: true,
      servo: parseInt(servo),
      angle: parseInt(angle),
      message: `舵机${servo}已设置为${angle}度`
    });
  }
  
  // 返回所有状态
  res.json({ servos: servoStates });
}