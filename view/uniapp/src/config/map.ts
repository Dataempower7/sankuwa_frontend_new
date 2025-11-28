/**
 * 地图API配置
 */
/**
 * 高德地图配置
 */
export const AMAP_CONFIG = {
    // 高德地图 Web服务API Key（专用于逆地理编码等Web服务）
    key: 'c02a4c512384dc4c54b6fc0fc31d018b',
    keyName: 'sankuwa_app_web',
    
    // 逆地理编码API
    geocodeApi: 'https://restapi.amap.com/v3/geocode/regeo',
    
    // 请求超时时间
    timeout: 10000
};

// 地图相关常量
export const MAP_CONSTANTS = {
    // 坐标系类型
    coordType: 'gcj02', // 高德地图/腾讯地图使用的火星坐标系
};
