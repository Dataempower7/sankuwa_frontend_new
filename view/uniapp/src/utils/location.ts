/**
 * 高德地图位置服务工具
 */

const AMAP_API_KEY = '5e67872c28ec5cefc13a85c4fae27c6a';

// GPS定位获取经纬度
export const getGPSLocation = async () => {
    return new Promise((resolve) => {
        uni.getLocation({
            type: 'gcj02', // 使用国测局坐标系，与高德地图一致
            geocode: true,
            isHighAccuracy: true, // 开启高精度定位
            success: (res) => {
                resolve({
                    success: true,
                    latitude: res.latitude,
                    longitude: res.longitude,
                    accuracy: res.accuracy,
                    address: res.address || ''
                });
            },
            fail: (error) => {
                console.error('GPS定位失败:', error);
                resolve({
                    success: false,
                    message: error.errMsg || 'GPS定位失败'
                });
            }
        });
    });
};

// 高德地图逆地理编码 - 根据经纬度获取详细地址
export const getAddressByLocation = async (longitude: number, latitude: number) => {
    try {
        const response = await uni.request({
            url: 'https://restapi.amap.com/v3/geocode/regeo',
            method: 'GET',
            data: {
                key: AMAP_API_KEY,
                location: `${longitude},${latitude}`,
                output: 'json',
                radius: 1000,
                extensions: 'all'
            },
            timeout: 10000
        });

        if (response.statusCode === 200 && response.data) {
            const data = response.data as any;
            if (data.status === '1' && data.regeocode) {
                const regeocode = data.regeocode;
                const addressComponent = regeocode.addressComponent;

                return {
                    success: true,
                    province: addressComponent.province,
                    city: addressComponent.city,
                    district: addressComponent.district,
                    township: addressComponent.township,
                    street: addressComponent.streetNumber?.street || '',
                    streetNumber: addressComponent.streetNumber?.number || '',
                    formatted_address: regeocode.formatted_address,
                    addressComponent: addressComponent
                };
            } else {
                return {
                    success: false,
                    message: data.info || '地址解析失败'
                };
            }
        } else {
            return {
                success: false,
                message: '网络请求失败'
            };
        }
    } catch (error) {
        console.error('逆地理编码失败:', error);
        return {
            success: false,
            message: '地址解析异常'
        };
    }
};

// 获取用户当前位置 - 使用GPS定位 + 高德地图解析
export const getCurrentLocation = async () => {
    try {
        // 首先尝试GPS定位
        const gpsResult: any = await getGPSLocation();

        if (gpsResult.success) {
            // GPS定位成功，使用高德地图获取详细地址
            const addressResult = await getAddressByLocation(gpsResult.longitude, gpsResult.latitude);

            if (addressResult.success) {
                return {
                    success: true,
                    type: 'gps',
                    province: addressResult.province,
                    city: addressResult.city,
                    district: addressResult.district,
                    township: addressResult.township,
                    street: addressResult.street,
                    streetNumber: addressResult.streetNumber,
                    formatted_address: addressResult.formatted_address,
                    location: `${gpsResult.longitude},${gpsResult.latitude}`,
                    accuracy: gpsResult.accuracy
                };
            } else {
                // 高德地图解析失败，返回GPS基本信息
                return {
                    success: true,
                    type: 'gps_basic',
                    province: '',
                    city: '',
                    district: '',
                    formatted_address: gpsResult.address || '当前位置',
                    location: `${gpsResult.longitude},${gpsResult.latitude}`,
                    accuracy: gpsResult.accuracy
                };
            }
        } else {
            // GPS定位失败
            return {
                success: false,
                message: gpsResult.message || 'GPS定位失败'
            };
        }
    } catch (error) {
        console.error('获取当前位置失败:', error);
        return {
            success: false,
            message: '定位服务异常'
        };
    }
};

// 格式化地址信息为标准格式
export const formatLocationToAddress = (locationData: any) => {
    const { province, city, district, township, street, streetNumber, formatted_address, type } = locationData;

    // 构建地区数组
    const regions = [];
    if (province && province !== city) {
        regions.push(province);
    }
    if (city) {
        regions.push(city);
    }
    if (district) {
        regions.push(district);
    }

    // 构建详细地址
    let detailAddress = '';
    if (type === 'gps' && (township || street || streetNumber)) {
        // GPS定位获取的详细地址
        const addressParts = [];
        if (township) addressParts.push(township);
        if (street) addressParts.push(street);
        if (streetNumber) addressParts.push(streetNumber);
        detailAddress = addressParts.join('');
    } else if (formatted_address) {
        // 从完整地址中提取详细地址部分
        let detail = formatted_address;
        if (province) detail = detail.replace(province, '');
        if (city) detail = detail.replace(city, '');
        if (district) detail = detail.replace(district, '');
        detailAddress = detail.trim();
    }

    return {
        regions,
        detail: detailAddress || '',
        fullAddress: formatted_address || `${province || ''}${city || ''}${district || ''}${detailAddress}`,
        type: type || 'unknown'
    };
};
