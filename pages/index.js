import React, { useState } from 'react';
import { Power, RotateCw, Zap, Activity, Settings, Wifi, WifiOff } from 'lucide-react';

export default function ServoControlPanel() {
  // 初始化6个舵机的状态
  const [servos, setServos] = useState([
    { id: 1, angle: 90, name: '底座旋转', status: 'idle' },
    { id: 2, angle: 90, name: '大臂升降', status: 'idle' },
    { id: 3, angle: 90, name: '小臂俯仰', status: 'idle' },
    { id: 4, angle: 90, name: '腕部旋转', status: 'idle' },
    { id: 5, angle: 90, name: '腕部俯仰', status: 'idle' },
    { id: 6, angle: 90, name: '夹爪控制', status: 'idle' }
  ]);

  const [isConnected, setIsConnected] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [targetIp, setTargetIp] = useState('');  // 硬件IP
  const [targetPort, setTargetPort] = useState('8888');  // 硬件端口
  const [showSettings, setShowSettings] = useState(false);
  const [connectionMode, setConnectionMode] = useState('simulation'); // simulation | hardware

  // 发送HTTP请求控制舵机
  const controlServo = async (servoId, angle) => {
    setLastCommand(`控制舵机${servoId} -> ${angle}°`);
    
    // 更新舵机状态为执行中
    setServos(prev => prev.map(servo => 
      servo.id === servoId 
        ? { ...servo, status: 'moving' }
        : servo
    ));

    try {
      // 构建代理API请求
      let apiUrl = `/api/servo?servo=${servoId}&angle=${angle}`;
      
      if (connectionMode === 'hardware' && targetIp) {
        apiUrl += `&target_ip=${targetIp}&target_port=${targetPort}`;
      }
      
      console.log(`📡 发送请求: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      console.log('📦 响应数据:', data);
      
      if (data.success) {
        // 模拟舵机运动时间
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 更新舵机角度和状态
        setServos(prev => prev.map(servo => 
          servo.id === servoId 
            ? { ...servo, angle: angle, status: 'idle' }
            : servo
        ));
        
        setIsConnected(true);
        setLastCommand(`✅ 成功: ${data.message}`);
      } else {
        throw new Error(data.error || '控制失败');
      }
      
    } catch (error) {
      console.error('❌ 控制失败:', error);
      setServos(prev => prev.map(servo => 
        servo.id === servoId 
          ? { ...servo, status: 'error' }
          : servo
      ));
      setIsConnected(false);
      setLastCommand(`❌ 失败: ${error.message}`);
    }
  };

  // 角度滑块变化处理
  const handleAngleChange = (servoId, newAngle) => {
    const angle = parseInt(newAngle);
    controlServo(servoId, angle);
  };

  // 预设位置
  const presetPositions = {
    '初始位置': [90, 90, 90, 90, 90, 90],
    '准备位置': [0, 45, 135, 90, 45, 0],
    '抓取位置': [45, 30, 150, 0, 90, 180],
    '收纳位置': [0, 150, 30, 90, 0, 0]
  };

  // 执行预设位置
  const executePreset = async (positions) => {
    for (let i = 0; i < positions.length; i++) {
      await controlServo(i + 1, positions[i]);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  // 获取状态颜色
  const getStatusColor = (status) => {
    switch (status) {
      case 'moving': return 'text-blue-500';
      case 'error': return 'text-red-500';
      default: return 'text-green-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'moving': return <Activity className="w-4 h-4 animate-spin" />;
      case 'error': return <Zap className="w-4 h-4" />;
      default: return <Power className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 头部状态栏 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <RotateCw className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">机械臂控制中心</h1>
                <p className="text-purple-200">6自由度舵机控制系统</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-white transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <div className="text-right">
                <div className="text-sm text-gray-300">连接模式</div>
                <div className={`flex items-center space-x-2 ${connectionMode === 'hardware' ? 'text-blue-400' : 'text-yellow-400'}`}>
                  {connectionMode === 'hardware' ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                  <span className="font-medium">
                    {connectionMode === 'hardware' ? '硬件模式' : '模拟模式'}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-300">连接状态</div>
                <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
                  <span className="font-medium">
                    {isConnected ? '正常' : '待连接'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 设置面板 */}
          {showSettings && (
            <div className="mt-6 p-4 bg-black/30 rounded-lg border border-gray-600">
              <h3 className="text-white font-bold mb-4">连接设置</h3>
              
              {/* 模式切换 */}
              <div className="mb-4">
                <label className="text-gray-300 text-sm mb-2 block">控制模式:</label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setConnectionMode('simulation')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      connectionMode === 'simulation' 
                        ? 'bg-yellow-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    🔧 模拟模式
                  </button>
                  <button
                    onClick={() => setConnectionMode('hardware')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      connectionMode === 'hardware' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    🤖 硬件模式
                  </button>
                </div>
              </div>

              {/* 硬件连接设置 */}
              {connectionMode === 'hardware' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <label className="text-gray-300 text-sm w-20">IP地址:</label>
                    <input
                      type="text"
                      value={targetIp}
                      onChange={(e) => setTargetIp(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      placeholder="192.168.1.100 或 your-robot.ngrok.io"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="text-gray-300 text-sm w-20">端口:</label>
                    <input
                      type="text"
                      value={targetPort}
                      onChange={(e) => setTargetPort(e.target.value)}
                      className="w-32 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      placeholder="8888"
                    />
                  </div>
                </div>
              )}
              
              <div className="mt-3 text-xs text-gray-400">
                {connectionMode === 'simulation' 
                  ? '🔧 模拟模式：所有操作都会成功，用于测试界面功能'
                  : '🤖 硬件模式：通过Vercel代理连接到实际硬件设备'
                }
              </div>
            </div>
          )}
          
          {lastCommand && (
            <div className="mt-4 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <div className="text-sm text-blue-200">执行状态</div>
              <div className="text-blue-100 font-mono text-sm break-all">{lastCommand}</div>
            </div>
          )}
        </div>

        {/* 预设位置按钮 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">快速预设位置</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(presetPositions).map(([name, positions]) => (
              <button
                key={name}
                onClick={() => executePreset(positions)}
                className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 text-white font-medium"
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* 快速测试按钮 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">快速测试</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(servoId => (
              <button
                key={servoId}
                onClick={() => controlServo(servoId, 180)}
                className="p-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-500/30 hover:from-green-500/30 hover:to-blue-500/30 transition-all duration-300 text-white font-medium"
              >
                舵机{servoId} → 180°
              </button>
            ))}
          </div>
        </div>

        {/* 舵机控制面板 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servos.map((servo) => (
            <div key={servo.id} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">舵机 {servo.id}</h3>
                  <p className="text-sm text-purple-200">{servo.name}</p>
                </div>
                <div className={`flex items-center space-x-2 ${getStatusColor(servo.status)}`}>
                  {getStatusIcon(servo.status)}
                  <span className="text-sm font-medium">
                    {servo.status === 'moving' ? '执行中' : 
                     servo.status === 'error' ? '错误' : '就绪'}
                  </span>
                </div>
              </div>

              {/* 角度显示 */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">当前角度</span>
                  <span className="text-2xl font-bold text-white">{servo.angle}°</span>
                </div>
                
                {/* 角度可视化 */}
                <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="absolute h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${(servo.angle / 180) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* 角度控制滑块 */}
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max="180"
                  value={servo.angle}
                  onChange={(e) => handleAngleChange(servo.id, e.target.value)}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  disabled={servo.status === 'moving'}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0°</span>
                  <span>90°</span>
                  <span>180°</span>
                </div>
              </div>

              {/* 快速角度按钮 */}
              <div className="grid grid-cols-3 gap-2">
                {[0, 90, 180].map(angle => (
                  <button
                    key={angle}
                    onClick={() => controlServo(servo.id, angle)}
                    disabled={servo.status === 'moving'}
                    className="py-2 px-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {angle}°
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* API信息 */}
        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-3">API配置</h3>
          <div className="bg-black/30 rounded-lg p-4 font-mono text-green-400 text-sm">
            <div>代理API: /api/servo</div>
            <div>当前模式: {connectionMode === 'hardware' ? '硬件模式' : '模拟模式'}</div>
            {connectionMode === 'hardware' && targetIp && (
              <div>目标设备: {targetIp}:{targetPort}</div>
            )}
            <div className="text-gray-400 mt-2">
              {connectionMode === 'hardware' 
                ? '硬件模式 - 通过Vercel代理转发请求到实际设备'
                : '模拟模式 - 所有请求都会返回成功，用于测试'
              }
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8b5cf6, #ec4899);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
        }
        
        input[type="range"]::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8b5cf6, #ec4899);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  );
}