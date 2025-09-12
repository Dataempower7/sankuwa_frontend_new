/**
 * 微信小程序一键导入地址功能 - 极简版
 * 只保留必要功能
 */

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

// 一键导入地址 - 优先使用微信原生地址簿
export const importAddressOneClick = async () => {
    console.log('开始一键导入地址...');
    
    try {
        // 首先尝试使用微信原生地址簿
        const addressResult = await new Promise((resolve) => {
            uni.chooseAddress({
                success: (res: any) => {
                    console.log('微信地址簿获取成功:', res);
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
                    console.log('微信地址簿获取失败:', error);
                    resolve({
                        success: false,
                        message: error.errMsg || '用户取消或没有权限'
                    });
                }
            });
        });
        
        if (addressResult.success) {
            return addressResult;
        }
        
        // 微信地址簿失败，尝试定位获取地址
        console.log('尝试使用定位服务...');
        const locationResult = await getSimpleLocation();
        
        if (locationResult.success && locationResult.address) {
            // 简单解析地址信息
            const address = locationResult.address;
            const provinceMatch = address.match(/([\u4e00-\u9fa5]{2,}(?:省|市|自治区))/);
            const cityMatch = address.match(/([\u4e00-\u9fa5]{2,}市)/);
            const districtMatch = address.match(/([\u4e00-\u9fa5]{2,}(?:区|县))/);
            
            return {
                success: true,
                type: 'location_address',
                provinceName: provinceMatch ? provinceMatch[1] : '',
                cityName: cityMatch ? cityMatch[1] : '',
                countyName: districtMatch ? districtMatch[1] : '',
                detailInfo: address,
                fullAddress: address
            };
        }
        
        return {
            success: false,
            message: '无法获取地址信息，请手动输入'
        };
        
    } catch (error) {
        console.error('一键导入地址异常:', error);
        return {
            success: false,
            message: '地址导入失败，请重试'
        };
    }
};
