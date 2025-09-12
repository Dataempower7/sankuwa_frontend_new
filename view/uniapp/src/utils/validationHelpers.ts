/**
 * 实时校验反馈工具
 * 为用户提供友好的输入提示和错误反馈
 */

import {
    validatePhone,
    validateEmail,
    validateIdCard,
    validateBankCard,
    validateUnifiedSocialCreditCode,
    validatePersonName,
    validateCompanyName,
    validateAddress,
    validateBankName,
    validateShopName,
    validateBusinessScope,
    validateServicePhone
} from './validators';

// 校验状态枚举
export enum ValidationStatus {
    EMPTY = 'empty',      // 未输入
    VALID = 'valid',      // 有效
    INVALID = 'invalid',  // 无效
    WARNING = 'warning'   // 警告（格式正确但可能有问题）
}

// 校验结果接口
export interface ValidationResult {
    status: ValidationStatus;
    message: string;
    suggestions?: string[];
}

// 手机号校验反馈
export const validatePhoneWithFeedback = (phone: string): ValidationResult => {
    if (!phone) {
        return {
            status: ValidationStatus.EMPTY,
            message: '请输入手机号码'
        };
    }

    if (phone.length < 11) {
        return {
            status: ValidationStatus.INVALID,
            message: '手机号码长度不足',
            suggestions: ['手机号码应为11位数字']
        };
    }

    if (phone.length > 11) {
        return {
            status: ValidationStatus.INVALID,
            message: '手机号码过长',
            suggestions: ['手机号码应为11位数字']
        };
    }

    if (!validatePhone(phone)) {
        const firstDigit = phone.charAt(0);
        if (firstDigit !== '1') {
            return {
                status: ValidationStatus.INVALID,
                message: '手机号码格式错误',
                suggestions: ['手机号码应以1开头']
            };
        }
        
        const secondDigit = phone.charAt(1);
        if (!'3456789'.includes(secondDigit)) {
            return {
                status: ValidationStatus.INVALID,
                message: '手机号码格式错误',
                suggestions: ['第二位数字应为3、4、5、6、7、8、9中的一个']
            };
        }

        return {
            status: ValidationStatus.INVALID,
            message: '请输入有效的手机号码'
        };
    }

    return {
        status: ValidationStatus.VALID,
        message: '手机号码格式正确'
    };
};

// 邮箱校验反馈
export const validateEmailWithFeedback = (email: string): ValidationResult => {
    if (!email) {
        return {
            status: ValidationStatus.EMPTY,
            message: '请输入邮箱地址'
        };
    }

    if (!email.includes('@')) {
        return {
            status: ValidationStatus.INVALID,
            message: '邮箱地址缺少@符号',
            suggestions: ['邮箱格式：example@domain.com']
        };
    }

    const parts = email.split('@');
    if (parts.length !== 2) {
        return {
            status: ValidationStatus.INVALID,
            message: '邮箱地址格式错误',
            suggestions: ['邮箱格式：example@domain.com']
        };
    }

    const [localPart, domainPart] = parts;
    
    if (localPart.length === 0) {
        return {
            status: ValidationStatus.INVALID,
            message: '邮箱用户名不能为空',
            suggestions: ['邮箱格式：example@domain.com']
        };
    }

    if (!domainPart.includes('.')) {
        return {
            status: ValidationStatus.INVALID,
            message: '邮箱域名格式错误',
            suggestions: ['域名应包含点号，如：gmail.com']
        };
    }

    if (!validateEmail(email)) {
        return {
            status: ValidationStatus.INVALID,
            message: '邮箱地址格式不正确',
            suggestions: ['请检查邮箱格式是否正确']
        };
    }

    return {
        status: ValidationStatus.VALID,
        message: '邮箱地址格式正确'
    };
};

// 身份证校验反馈
export const validateIdCardWithFeedback = (idCard: string): ValidationResult => {
    if (!idCard) {
        return {
            status: ValidationStatus.EMPTY,
            message: '请输入身份证号码'
        };
    }

    if (idCard.length !== 15 && idCard.length !== 18) {
        return {
            status: ValidationStatus.INVALID,
            message: '身份证号码长度错误',
            suggestions: ['身份证号码应为15位或18位']
        };
    }

    if (!validateIdCard(idCard)) {
        if (idCard.length === 18) {
            const checkCode = idCard.charAt(17);
            if (!/[0-9Xx]/.test(checkCode)) {
                return {
                    status: ValidationStatus.INVALID,
                    message: '身份证校验码错误',
                    suggestions: ['最后一位应为数字或字母X']
                };
            }
        }

        return {
            status: ValidationStatus.INVALID,
            message: '身份证号码格式不正确',
            suggestions: ['请检查身份证号码是否输入正确']
        };
    }

    return {
        status: ValidationStatus.VALID,
        message: '身份证号码格式正确'
    };
};

// 银行卡校验反馈
export const validateBankCardWithFeedback = (bankCard: string): ValidationResult => {
    if (!bankCard) {
        return {
            status: ValidationStatus.EMPTY,
            message: '请输入银行卡号'
        };
    }

    if (!/^\d+$/.test(bankCard)) {
        return {
            status: ValidationStatus.INVALID,
            message: '银行卡号只能包含数字',
            suggestions: ['请输入纯数字银行卡号']
        };
    }

    if (bankCard.length < 16) {
        return {
            status: ValidationStatus.INVALID,
            message: '银行卡号长度不足',
            suggestions: ['银行卡号通常为16-19位数字']
        };
    }

    if (bankCard.length > 19) {
        return {
            status: ValidationStatus.INVALID,
            message: '银行卡号过长',
            suggestions: ['银行卡号通常为16-19位数字']
        };
    }

    if (!validateBankCard(bankCard)) {
        return {
            status: ValidationStatus.INVALID,
            message: '银行卡号校验失败',
            suggestions: ['请检查银行卡号是否正确']
        };
    }

    return {
        status: ValidationStatus.VALID,
        message: '银行卡号格式正确'
    };
};

// 统一社会信用代码校验反馈
export const validateSocialCreditCodeWithFeedback = (code: string): ValidationResult => {
    if (!code) {
        return {
            status: ValidationStatus.EMPTY,
            message: '请输入统一社会信用代码'
        };
    }

    if (code.length !== 18) {
        return {
            status: ValidationStatus.INVALID,
            message: '统一社会信用代码长度错误',
            suggestions: ['统一社会信用代码应为18位']
        };
    }

    if (!/^[0-9A-HJ-NPQRTUWXY]+$/.test(code)) {
        return {
            status: ValidationStatus.INVALID,
            message: '统一社会信用代码包含无效字符',
            suggestions: ['只能包含数字和特定字母（不包含I、O、S、V、Z）']
        };
    }

    if (!validateUnifiedSocialCreditCode(code)) {
        return {
            status: ValidationStatus.INVALID,
            message: '统一社会信用代码校验失败',
            suggestions: ['请检查代码是否正确']
        };
    }

    return {
        status: ValidationStatus.VALID,
        message: '统一社会信用代码格式正确'
    };
};

// 姓名校验反馈
export const validatePersonNameWithFeedback = (name: string): ValidationResult => {
    if (!name) {
        return {
            status: ValidationStatus.EMPTY,
            message: '请输入姓名'
        };
    }

    if (name.length < 2) {
        return {
            status: ValidationStatus.INVALID,
            message: '姓名过短',
            suggestions: ['姓名至少需要2个字符']
        };
    }

    if (name.length > 20) {
        return {
            status: ValidationStatus.INVALID,
            message: '姓名过长',
            suggestions: ['姓名不能超过20个字符']
        };
    }

    if (!validatePersonName(name)) {
        return {
            status: ValidationStatus.INVALID,
            message: '姓名格式不正确',
            suggestions: ['请输入有效的中文或英文姓名']
        };
    }

    return {
        status: ValidationStatus.VALID,
        message: '姓名格式正确'
    };
};

// 企业名称校验反馈
export const validateCompanyNameWithFeedback = (name: string): ValidationResult => {
    if (!name) {
        return {
            status: ValidationStatus.EMPTY,
            message: '请输入企业名称'
        };
    }

    if (name.length < 2) {
        return {
            status: ValidationStatus.INVALID,
            message: '企业名称过短',
            suggestions: ['企业名称至少需要2个字符']
        };
    }

    if (name.length > 100) {
        return {
            status: ValidationStatus.INVALID,
            message: '企业名称过长',
            suggestions: ['企业名称不能超过100个字符']
        };
    }

    // 检查是否包含企业类型后缀
    const companySuffixes = ['有限公司', '股份有限公司', '合伙企业', '个体工商户', '个人独资企业'];
    const hasSuffix = companySuffixes.some(suffix => name.includes(suffix));
    
    if (!validateCompanyName(name)) {
        return {
            status: ValidationStatus.INVALID,
            message: '企业名称格式不正确',
            suggestions: ['企业名称不能包含特殊符号']
        };
    }

    if (!hasSuffix) {
        return {
            status: ValidationStatus.WARNING,
            message: '建议在企业名称后添加企业类型',
            suggestions: ['如：有限公司、股份有限公司等']
        };
    }

    return {
        status: ValidationStatus.VALID,
        message: '企业名称格式正确'
    };
};

// 地址校验反馈
export const validateAddressWithFeedback = (address: string): ValidationResult => {
    if (!address) {
        return {
            status: ValidationStatus.EMPTY,
            message: '请输入地址'
        };
    }

    if (address.length < 5) {
        return {
            status: ValidationStatus.INVALID,
            message: '地址信息过短',
            suggestions: ['请提供详细的地址信息']
        };
    }

    if (address.length > 200) {
        return {
            status: ValidationStatus.INVALID,
            message: '地址信息过长',
            suggestions: ['地址不能超过200个字符']
        };
    }

    if (!validateAddress(address)) {
        return {
            status: ValidationStatus.INVALID,
            message: '地址格式不正确',
            suggestions: ['请输入有效的地址信息']
        };
    }

    return {
        status: ValidationStatus.VALID,
        message: '地址格式正确'
    };
};

// 通用校验反馈生成器
export const createValidationFeedback = (
    value: string,
    validator: (value: string) => boolean,
    options: {
        emptyMessage: string;
        validMessage: string;
        invalidMessage: string;
        suggestions?: string[];
        minLength?: number;
        maxLength?: number;
    }
): ValidationResult => {
    if (!value) {
        return {
            status: ValidationStatus.EMPTY,
            message: options.emptyMessage
        };
    }

    if (options.minLength && value.length < options.minLength) {
        return {
            status: ValidationStatus.INVALID,
            message: `输入内容过短，至少需要${options.minLength}个字符`,
            suggestions: options.suggestions
        };
    }

    if (options.maxLength && value.length > options.maxLength) {
        return {
            status: ValidationStatus.INVALID,
            message: `输入内容过长，不能超过${options.maxLength}个字符`,
            suggestions: options.suggestions
        };
    }

    if (!validator(value)) {
        return {
            status: ValidationStatus.INVALID,
            message: options.invalidMessage,
            suggestions: options.suggestions
        };
    }

    return {
        status: ValidationStatus.VALID,
        message: options.validMessage
    };
};
