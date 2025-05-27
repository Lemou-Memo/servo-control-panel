// pages/api/servo.js
export default async function handler(req, res) {
    // 允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
  
    const { servo, angle, target_ip, target_port } = req.query;
  
    if (!servo || !angle) {
      return res.status(400).json({ 
        error: '缺少必要参数', 
        required: 'servo, angle' 
      });
    }
  
    // 如果没有指定目标IP，返回模拟成功
    if (!target_ip || !target_port) {
      return res.json({ 
        success: true, 
        message: `模拟控制舵机${servo}转到${angle}度`,
        servo: parseInt(servo),
        angle: parseInt(angle),
        timestamp: new Date().toISOString(),
        mode: 'simulation'
      });
    }
  
    try {
      // 构建目标URL
      const targetUrl = `http://${target_ip}:${target_port}/${servo}/${angle}`;
      
      // 设置超时时间
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
  
      // 发送请求到实际硬件
      const response = await fetch(targetUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Servo-Control-Panel/1.0'
        }
      });
  
      clearTimeout(timeoutId);
  
      if (response.ok) {
        const result = await response.text();
        res.json({ 
          success: true, 
          message: `成功控制舵机${servo}转到${angle}度`,
          servo: parseInt(servo),
          angle: parseInt(angle),
          response: result,
          timestamp: new Date().toISOString(),
          mode: 'hardware'
        });
      } else {
        res.status(response.status).json({ 
          error: `硬件响应错误: ${response.status}`,
          servo: parseInt(servo),
          angle: parseInt(angle)
        });
      }
  
    } catch (error) {
      console.error('代理请求失败:', error);
      
      if (error.name === 'AbortError') {
        res.status(408).json({ 
          error: '请求超时，请检查硬件连接',
          servo: parseInt(servo),
          angle: parseInt(angle)
        });
      } else {
        res.status(500).json({ 
          error: '无法连接到硬件设备',
          details: error.message,
          servo: parseInt(servo),
          angle: parseInt(angle)
        });
      }
    }
  }