/**
 * APP 权限请求工具
 * 用于处理 APP 平台的各种权限请求
 */

/**
 * 请求相册权限
 * @returns Promise<boolean> 返回是否获得权限
 */
export async function requestPhotosPermission(): Promise<boolean> {
    // 运行时判断是否为 APP-PLUS 平台
    if (typeof plus === 'undefined') {
        // 非 APP 平台直接返回 true
        return true;
    }

    try {
        // 检查当前相册权限状态
        const result = await new Promise<boolean>((resolve, reject) => {
            plus.android.requestPermissions(
                ['android.permission.READ_EXTERNAL_STORAGE', 'android.permission.WRITE_EXTERNAL_STORAGE'],
                (resultObj: any) => {
                    let hasPermission = true;
                    for (let i = 0; i < resultObj.granted.length; i++) {
                        if (resultObj.granted[i] === 'android.permission.READ_EXTERNAL_STORAGE' ||
                            resultObj.granted[i] === 'android.permission.WRITE_EXTERNAL_STORAGE') {
                            // 权限已授予
                            continue;
                        }
                    }
                    // 检查是否有权限被拒绝
                    if (resultObj.deniedAlways && resultObj.deniedAlways.length > 0) {
                        // 权限被永久拒绝，需要引导用户去设置
                        uni.showModal({
                            title: '权限申请',
                            content: '需要相册权限，请前往设置中开启',
                            confirmText: '去设置',
                            success: (res) => {
                                if (res.confirm) {
                                    plus.runtime.openURL('app-settings://');
                                }
                            }
                        });
                        hasPermission = false;
                    } else if (resultObj.deniedPresent && resultObj.deniedPresent.length > 0) {
                        // 权限被暂时拒绝
                        hasPermission = false;
                    }
                    resolve(hasPermission);
                },
                (error: any) => {
                    console.error('权限请求失败:', error);
                    reject(error);
                }
            );
        });
        
        return result;
    } catch (error) {
        console.error('请求相册权限异常:', error);
        return false;
    }
}

/**
 * 请求相机权限
 * @returns Promise<boolean> 返回是否获得权限
 */
export async function requestCameraPermission(): Promise<boolean> {
    if (typeof plus === 'undefined') {
        return true;
    }

    try {
        const result = await new Promise<boolean>((resolve, reject) => {
            plus.android.requestPermissions(
                ['android.permission.CAMERA'],
                (resultObj: any) => {
                    let hasPermission = true;
                    
                    if (resultObj.deniedAlways && resultObj.deniedAlways.length > 0) {
                        uni.showModal({
                            title: '权限申请',
                            content: '需要相机权限，请前往设置中开启',
                            confirmText: '去设置',
                            success: (res) => {
                                if (res.confirm) {
                                    plus.runtime.openURL('app-settings://');
                                }
                            }
                        });
                        hasPermission = false;
                    } else if (resultObj.deniedPresent && resultObj.deniedPresent.length > 0) {
                        hasPermission = false;
                    }
                    resolve(hasPermission);
                },
                (error: any) => {
                    console.error('权限请求失败:', error);
                    reject(error);
                }
            );
        });
        
        return result;
    } catch (error) {
        console.error('请求相机权限异常:', error);
        return false;
    }
}

/**
 * 请求录音权限
 * @returns Promise<boolean> 返回是否获得权限
 */
export async function requestRecordPermission(): Promise<boolean> {
    if (typeof plus === 'undefined') {
        return true;
    }

    try {
        const result = await new Promise<boolean>((resolve, reject) => {
            plus.android.requestPermissions(
                ['android.permission.RECORD_AUDIO'],
                (resultObj: any) => {
                    let hasPermission = true;
                    
                    if (resultObj.deniedAlways && resultObj.deniedAlways.length > 0) {
                        uni.showModal({
                            title: '权限申请',
                            content: '需要录音权限，请前往设置中开启',
                            confirmText: '去设置',
                            success: (res) => {
                                if (res.confirm) {
                                    plus.runtime.openURL('app-settings://');
                                }
                            }
                        });
                        hasPermission = false;
                    } else if (resultObj.deniedPresent && resultObj.deniedPresent.length > 0) {
                        hasPermission = false;
                    }
                    resolve(hasPermission);
                },
                (error: any) => {
                    console.error('权限请求失败:', error);
                    reject(error);
                }
            );
        });
        
        return result;
    } catch (error) {
        console.error('请求录音权限异常:', error);
        return false;
    }
}
