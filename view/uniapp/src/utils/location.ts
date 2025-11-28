/**
 * H5/APP 一键导入地址功能
 * 使用定位 + 高德地图逆地理编码API
 */

import { AMAP_CONFIG } from '@/config/map';

/**
 * 高德地图逆地理编码 - 将坐标转换为详细地址
 * @param longitude 经度
 * @param latitude 纬度
 * @returns 地址信息
 */
const getAddressByAMap = async (longitude: number, latitude: number) => {
    try {
        const url = `${AMAP_CONFIG.geocodeApi}?key=${AMAP_CONFIG.key}&location=${longitude},${latitude}&extensions=all&output=json`;
        
        console.log('调用高德地图API:', url);
        
        const response = await new Promise<any>((resolve, reject) => {
            uni.request({
                url,
                method: 'GET',
                timeout: AMAP_CONFIG.timeout,
                success: (res) => {
                    console.log('高德地图API响应:', res);
                    resolve(res.data);
                },
                fail: (error) => {
                    console.error('高德地图API请求失败:', error);
                    reject(error);
                }
            });
        });
        
        if (response.status === '1' && response.regeocode) {
            const { addressComponent, formatted_address, roads, pois } = response.regeocode;
            
            return {
                success: true,
                provinceName: addressComponent.province || '',
                cityName: addressComponent.city || addressComponent.province || '',
                countyName: addressComponent.district || '',
                townName: addressComponent.township || '',
                streetName: addressComponent.streetNumber?.street || '',
                streetNumber: addressComponent.streetNumber?.number || '',
                formattedAddress: formatted_address || '',
                // 附近道路信息
                nearbyRoad: roads && roads.length > 0 ? roads[0].name : '',
                // 附近POI（兴趣点）
                nearbyPoi: pois && pois.length > 0 ? pois[0].name : '',
                // 完整地址组件
                addressComponent,
                // 原始响应
                raw: response.regeocode
            };
        }
        
        return {
            success: false,
            message: response.info || '地址解析失败'
        };
    } catch (error: any) {
        console.error('高德地图API异常:', error);
        return {
            success: false,
            message: error.message || '网络请求失败'
        };
    }
};

// 最基本的定位获取功能
export const getSimpleLocation = async () => {
    return new Promise((resolve) => {
        uni.getLocation({
            type: 'gcj02',
            success: (res: any) => {
                console.log('定位成功:', res);
                resolve({
                    success: true,
                    latitude: res.latitude,
                    longitude: res.longitude,
                    accuracy: res.accuracy || 0,
                    address: res.address || ''
                });
            },
            fail: (error: any) => {
                console.error('定位失败:', error);
                resolve({
                    success: false,
                    message: error.errMsg || '定位失败'
                });
            }
        });
    });
};

/**
 * 一键导入地址 - 自动判断平台
 * 微信小程序：优先使用微信原生地址簿
 * H5/APP：使用定位 + 高德地图逆地理编码
 */
export const importAddressOneClick = async () => {
    console.log('🌍 开始一键导入地址...');
    
    // 获取当前运行平台
    // #ifdef MP-WEIXIN
    const platform = 'mp-weixin';
    // #endif
    // #ifdef H5
    const platform = 'h5';
    // #endif
    // #ifdef APP-PLUS
    const platform = 'app';
    // #endif
    // #ifndef MP-WEIXIN || H5 || APP-PLUS
    const platform = 'unknown';
    // #endif
    
    console.log('📱 当前平台:', platform);
    
    try {
        // 微信小程序：优先尝试使用微信原生地址簿
        // #ifdef MP-WEIXIN
        console.log('🔵 尝试使用微信地址簿...');
        const wechatAddressResult: any = await new Promise((resolve) => {
            uni.chooseAddress({
                success: (res: any) => {
                    console.log('✅ 微信地址簿获取成功:', res);
                    resolve({
                        success: true,
                        type: 'wechat_address',
                        userName: res.userName,
                        telNumber: res.telNumber,
                        provinceName: res.provinceName,
                        cityName: res.cityName,
                        countyName: res.countyName,
                        detailInfo: res.detailInfo,
                        nationalCode: res.nationalCode,
                        postalCode: res.postalCode
                    });
                },
                fail: (error: any) => {
                    console.log('⚠️ 微信地址簿获取失败:', error.errMsg);
                    resolve({
                        success: false,
                        message: error.errMsg || '用户取消或没有权限'
                    });
                }
            });
        });
        
        // 如果微信地址簿获取成功，直接返回
        if (wechatAddressResult.success) {
            console.log('🎉 微信地址簿导入成功');
            return wechatAddressResult;
        }
        
        console.log('⚠️ 微信地址簿失败，尝试使用定位服务...');
        // #endif
        
        // H5/APP 或 微信地址簿失败：使用定位 + 高德地图
        console.log('📍 正在获取定位...');
        const locationResult: any = await getSimpleLocation();
        
        if (!locationResult.success) {
            console.error('❌ 定位失败:', locationResult.message);
            return {
                success: false,
                message: locationResult.message || '定位失败，请检查定位权限'
            };
        }
        
        console.log('✅ 定位成功:', locationResult);
        
        // 使用高德地图逆地理编码获取详细地址
        console.log('🗺️ 正在解析地址...');
        const amapResult = await getAddressByAMap(
            locationResult.longitude,
            locationResult.latitude
        );
        
        if (!amapResult.success) {
            console.error('❌ 地址解析失败:', amapResult.message);
            return {
                success: false,
                message: amapResult.message || '地址解析失败，请重试'
            };
        }
        
        console.log('✅ 地址解析成功:', amapResult);
        
        // 构建详细地址信息
        let detailAddress = '';
        
        // 优先使用 街道+门牌号
        if (amapResult.streetName && amapResult.streetNumber) {
            detailAddress = `${amapResult.streetName}${amapResult.streetNumber}`;
        } 
        // 其次使用附近POI
        else if (amapResult.nearbyPoi) {
            detailAddress = `${amapResult.nearbyPoi}附近`;
        } 
        // 最后使用附近道路
        else if (amapResult.nearbyRoad) {
            detailAddress = `${amapResult.nearbyRoad}附近`;
        }
        // 兜底使用乡镇名称
        else if (amapResult.townName) {
            detailAddress = amapResult.townName;
        }
        
        // 构建地区数组
        const regions = [
            amapResult.provinceName,
            amapResult.cityName,
            amapResult.countyName
        ].filter(Boolean);
        
        // 返回完整地址信息
        const result = {
            success: true,
            type: 'amap_location',
            regions,
            detail: detailAddress,
            fullAddress: amapResult.formattedAddress,
            provinceName: amapResult.provinceName,
            cityName: amapResult.cityName,
            countyName: amapResult.countyName,
            townName: amapResult.townName,
            streetName: amapResult.streetName,
            streetNumber: amapResult.streetNumber,
            nearbyPoi: amapResult.nearbyPoi,
            nearbyRoad: amapResult.nearbyRoad,
            latitude: locationResult.latitude,
            longitude: locationResult.longitude
        };
        
        console.log('🎉 定位导入地址成功:', result);
        return result;
        
    } catch (error: any) {
        console.error('❌ 一键导入地址异常:', error);
        return {
            success: false,
            message: error.message || '地址导入失败，请重试'
        };
    }
};
