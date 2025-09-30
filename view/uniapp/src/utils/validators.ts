/**
 * 企业入驻表单校验工具函数
 * 提供各种类型的输入校验
 */

// 手机号校验
export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
};

// 邮箱校验
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

// 身份证号校验（仅支持18位）
export const validateIdCard = (idCard: string, strictMode: boolean = false): boolean => {
    if (!idCard) return false;
    const v = idCard.trim();
    // 18位身份证：地址码6位 + 出生年4位(19/20开头) + 月2位 + 日2位 + 顺序码3位 + 校验码
    const idCard18Regex = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
    if (v.length !== 18) return false;
    if (!idCard18Regex.test(v)) return false;
    
    // 如果不是严格模式，只检查格式不检查校验码
    if (!strictMode) {
        return true;
    }
    
    // 严格模式下检查校验码
    return validateIdCard18CheckCode(v);
};

// 严格模式身份证校验（包括校验码）
export const validateIdCardStrict = (idCard: string): boolean => {
    return validateIdCard(idCard, true);
};

// 宽松模式身份证校验（不检查校验码）
export const validateIdCardLoose = (idCard: string): boolean => {
    return validateIdCard(idCard, false);
};

// 18位身份证校验码验证
const validateIdCard18CheckCode = (idCard: string): boolean => {
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    
    let sum = 0;
    for (let i = 0; i < 17; i++) {
        sum += parseInt(idCard.charAt(i)) * weights[i];
    }
    
    const checkCode = checkCodes[sum % 11];
    return checkCode === idCard.charAt(17).toUpperCase();
};

// 护照号校验
export const validatePassport = (passport: string): boolean => {
    // 护照号通常为8-9位，包含字母和数字
    const passportRegex = /^[A-Za-z0-9]{6,12}$/;
    return passportRegex.test(passport);
};

// 港澳通行证校验
export const validateHkMacaoPass = (pass: string): boolean => {
    // 港澳通行证格式：字母+8位数字
    const passRegex = /^[A-Za-z]\d{8}$/;
    return passRegex.test(pass);
};

// 银行卡号校验 - 宽松版本（移除Luhn算法校验）
export const validateBankCard = (cardNumber: string): boolean => {
    // 银行卡号通常为15-20位数字，支持更宽泛的范围
    const bankCardRegex = /^\d{15,20}$/;
    return bankCardRegex.test(cardNumber);
};

// Luhn算法校验
const luhnCheck = (cardNumber: string): boolean => {
    let sum = 0;
    let alternate = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i));
        
        if (alternate) {
            digit *= 2;
            if (digit > 9) {
                digit = (digit % 10) + 1;
            }
        }
        
        sum += digit;
        alternate = !alternate;
    }
    
    return (sum % 10) === 0;
};

// 统一社会信用代码校验
export const validateUnifiedSocialCreditCode = (code: string): boolean => {
    // 统一社会信用代码为18位，由数字和大写字母组成
    const codeRegex = /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/;
    if (!codeRegex.test(code)) {
        return false;
    }
    
    // 校验码验证
    const weights = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28];
    const chars = '0123456789ABCDEFGHJKLMNPQRTUWXY';
    
    let sum = 0;
    for (let i = 0; i < 17; i++) {
        sum += chars.indexOf(code.charAt(i)) * weights[i];
    }
    
    const checkCode = 31 - (sum % 31);
    return chars.charAt(checkCode === 31 ? 0 : checkCode) === code.charAt(17);
};

// 企业名称校验
export const validateCompanyName = (name: string): boolean => {
    if (name.length < 2 || name.length > 100) {
        return false;
    }
    
    // 不能包含特殊符号
    const invalidChars = /[<>\/\\|:*?"]/;
    if (invalidChars.test(name)) {
        return false;
    }
    
    // 必须包含中文或英文字符
    const validChars = /[\u4e00-\u9fa5a-zA-Z]/;
    return validChars.test(name);
};

// 姓名校验
export const validatePersonName = (name: string): boolean => {
    if (name.length < 2 || name.length > 20) {
        return false;
    }
    
    // 中文姓名：2-4个中文字符，可以包含·
    const chineseNameRegex = /^[\u4e00-\u9fa5]{2,4}(·[\u4e00-\u9fa5]{2,4})?$/;
    // 英文姓名：字母和空格，长度2-20
    const englishNameRegex = /^[a-zA-Z\s]{2,20}$/;
    
    return chineseNameRegex.test(name) || englishNameRegex.test(name);
};

// 地址校验
export const validateAddress = (address: string): boolean => {
    if (address.length < 5 || address.length > 200) {
        return false;
    }
    
    // 不能全部是特殊字符
    const validAddressRegex = /[\u4e00-\u9fa5a-zA-Z0-9]/;
    return validAddressRegex.test(address);
};

// 银行名称校验
export const validateBankName = (bankName: string): boolean => {
    if (bankName.length < 2 || bankName.length > 50) {
        return false;
    }
    
    // 银行名称通常包含"银行"字样或为知名银行
    const bankKeywords = ['银行', '信用社', '邮储', '农商', '村镇', 'Bank'];
    const containsKeyword = bankKeywords.some(keyword => bankName.includes(keyword));
    
    // 或者匹配常见银行名称模式
    const bankNameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9（）()·\s]{2,50}$/;
    
    return containsKeyword && bankNameRegex.test(bankName);
};

// 营业执照注册号校验（旧版15位）
export const validateBusinessLicenseOld = (license: string): boolean => {
    const licenseRegex = /^\d{15}$/;
    return licenseRegex.test(license);
};

// 店铺名称校验
export const validateShopName = (shopName: string): boolean => {
    if (shopName.length < 2 || shopName.length > 50) {
        return false;
    }
    
    // 不能包含敏感词汇
    const sensitiveWords = ['官方', '旗舰', '专卖', '直营', '官网', '总部'];
    const containsSensitive = sensitiveWords.some(word => shopName.includes(word));
    
    if (containsSensitive) {
        return false;
    }
    
    // 基本格式校验
    const shopNameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9·\s]{2,50}$/;
    return shopNameRegex.test(shopName);
};

// 经营范围校验
export const validateBusinessScope = (scope: string): boolean => {
    if (scope.length < 5 || scope.length > 200) {
        return false;
    }
    
    // 经营范围应该包含具体的业务描述
    const scopeRegex = /[\u4e00-\u9fa5]/; // 至少包含中文
    return scopeRegex.test(scope);
};

// 客服电话校验（支持座机和手机）- 宽松版本
export const validateServicePhone = (phone: string): boolean => {
    // 手机号格式 - 支持1开头的11位数字
    const mobileRegex = /^1\d{10}$/;
    // 座机号格式 - 支持更多格式：区号+号码，可选分隔符
    const landlineRegex = /^0\d{2,3}[-\s]?\d{7,8}$/;
    // 400/800电话格式 - 支持更多客服电话格式
    const serviceRegex = /^[48]00[-\s]?\d{3}[-\s]?\d{4}$/;
    // 固定电话格式 - 支持不带区号的7-8位固定电话
    const fixedPhoneRegex = /^\d{7,8}$/;
    // 支持带分机号的电话格式
    const extensionRegex = /^0\d{2,3}[-\s]?\d{7,8}[-\s]?\d{1,6}$/;
    
    const mobileResult = mobileRegex.test(phone);
    const landlineResult = landlineRegex.test(phone);
    const serviceResult = serviceRegex.test(phone);
    const fixedResult = fixedPhoneRegex.test(phone);
    const extensionResult = extensionRegex.test(phone);
    
    const finalResult = mobileResult || landlineResult || serviceResult || fixedResult || extensionResult;
    return finalResult;
};

// 创建 uniapp 表单校验器工厂函数
export const createValidator = (validatorFn: (value: string) => boolean, errorMessage: string) => {
    return {
        validator: (rule: any, value: any, callback: any) => {
            if (!value || typeof value !== 'string') {
                callback(errorMessage);
                return false;
            }
            
            if (!validatorFn(value.trim())) {
                callback(errorMessage);
                return false;
            }
            
            return true;
        },
        message: errorMessage,
        trigger: ['blur', 'change']
    };
};

// 证件类型对应的校验函数映射
export const getDocumentValidator = (documentType: number) => {
    switch (documentType) {
        case 1: // 大陆身份证（使用严格模式，包含校验码）
            return validateIdCardStrict;
        case 2: // 护照
            return validatePassport;
        case 3:
        case 4:
        case 5: // 各种通行证
            return validateHkMacaoPass;
        default:
            return () => true; // 未知类型暂时通过
    }
};
