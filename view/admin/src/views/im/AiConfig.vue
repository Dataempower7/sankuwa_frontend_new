<template>
  <div class="ai-config-container">
    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span>AI客服配置</span>
          <el-button type="primary" @click="saveConfig" :loading="saving">保存配置</el-button>
        </div>
      </template>

      <el-form :model="config" label-width="140px" ref="formRef" :rules="rules">
        <!-- 基础配置 -->
        <el-divider content-position="left">基础配置</el-divider>
        
        <el-form-item label="启用AI客服" prop="enableAi">
          <el-switch v-model="config.enableAi" />
          <span class="form-tip">开启后，用户消息将自动由AI回复</span>
        </el-form-item>

        <el-form-item label="AI模型类型" prop="aiModel">
          <el-select v-model="config.aiModel" placeholder="请选择AI模型">
            <el-option label="OpenAI (GPT)" value="openai" />
            <el-option label="阿里云通义千问" value="tongyi" />
            <el-option label="百度文心一言" value="wenxin" />
            <el-option label="智谱AI" value="zhipu" />
          </el-select>
        </el-form-item>

        <el-form-item label="API地址" prop="apiUrl">
          <el-input v-model="config.apiUrl" placeholder="例如: https://api.openai.com/v1/chat/completions">
            <template #append>
              <el-button @click="testConnection">测试连接</el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="API Key" prop="apiKey">
          <el-input v-model="config.apiKey" type="password" show-password placeholder="请输入API Key" />
        </el-form-item>

        <el-form-item label="模型名称" prop="modelName">
          <el-input v-model="config.modelName" placeholder="例如: gpt-3.5-turbo, gpt-4" />
          <div class="form-tip">
            <div>OpenAI: gpt-3.5-turbo, gpt-4</div>
            <div>通义千问: qwen-plus, qwen-turbo</div>
          </div>
        </el-form-item>

        <!-- AI参数配置 -->
        <el-divider content-position="left">AI参数</el-divider>

        <el-form-item label="温度参数" prop="temperature">
          <el-slider v-model="config.temperature" :min="0" :max="1" :step="0.1" show-input />
          <span class="form-tip">较低的值使输出更加确定，较高的值使输出更加随机</span>
        </el-form-item>

        <el-form-item label="最大Token数" prop="maxTokens">
          <el-input-number v-model="config.maxTokens" :min="100" :max="4000" :step="100" />
          <span class="form-tip">限制AI回复的最大长度</span>
        </el-form-item>

        <el-form-item label="超时时间(秒)" prop="timeout">
          <el-input-number v-model="config.timeout" :min="5" :max="120" />
        </el-form-item>

        <!-- 对话配置 -->
        <el-divider content-position="left">对话配置</el-divider>

        <el-form-item label="系统提示词" prop="systemPrompt">
          <el-input 
            v-model="config.systemPrompt" 
            type="textarea" 
            :rows="4"
            placeholder="设定AI的角色和回复风格，例如：你是一个专业的电商客服助手..."
          />
        </el-form-item>

        <el-form-item label="保留对话上下文" prop="keepContext">
          <el-switch v-model="config.keepContext" />
          <span class="form-tip">开启后AI会记住之前的对话内容</span>
        </el-form-item>

        <el-form-item label="上下文轮数" prop="contextRounds" v-if="config.keepContext">
          <el-input-number v-model="config.contextRounds" :min="1" :max="20" />
          <span class="form-tip">保留最近N轮对话作为上下文</span>
        </el-form-item>

        <!-- 转人工配置 -->
        <el-divider content-position="left">转人工配置</el-divider>

        <el-form-item label="转人工关键词" prop="transferKeywords">
          <el-input 
            v-model="config.transferKeywords" 
            placeholder="多个关键词用逗号分隔，例如: 人工,转人工,联系客服"
          />
          <span class="form-tip">检测到这些关键词时不使用AI回复</span>
        </el-form-item>

        <!-- 工作时间配置 -->
        <el-divider content-position="left">工作时间</el-divider>

        <el-form-item label="AI工作模式" prop="workTimeMode">
          <el-radio-group v-model="config.workTimeMode">
            <el-radio :label="1">仅非工作时间</el-radio>
            <el-radio :label="2">全时段</el-radio>
            <el-radio :label="3">仅工作时间</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="工作时间段" v-if="config.workTimeMode !== 2">
          <el-time-picker
            v-model="workTimeRange"
            is-range
            format="HH:mm"
            value-format="HH:mm"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            @change="handleTimeChange"
          />
        </el-form-item>

        <el-form-item label="首次消息AI回复" prop="aiFirstMessage">
          <el-switch v-model="config.aiFirstMessage" />
          <span class="form-tip">用户首次发送消息时是否使用AI回复</span>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 使用说明 -->
    <el-card class="help-card" style="margin-top: 20px;">
      <template #header>
        <span>使用说明</span>
      </template>
      <div class="help-content">
        <h4>1. 如何获取API Key？</h4>
        <ul>
          <li><strong>OpenAI:</strong> 访问 <a href="https://platform.openai.com/api-keys" target="_blank">https://platform.openai.com/api-keys</a></li>
          <li><strong>阿里云通义千问:</strong> 访问阿里云控制台，开通灵积服务</li>
          <li><strong>百度文心一言:</strong> 访问百度智能云控制台</li>
        </ul>

        <h4>2. 工作模式说明</h4>
        <ul>
          <li><strong>仅非工作时间:</strong> 只在设定的工作时间之外使用AI回复（例如夜间无人值守）</li>
          <li><strong>全时段:</strong> 24小时都使用AI回复</li>
          <li><strong>仅工作时间:</strong> 只在设定的工作时间内使用AI回复</li>
        </ul>

        <h4>3. 注意事项</h4>
        <ul>
          <li>启用AI后，用户发送的文本消息会自动触发AI回复</li>
          <li>当用户消息包含"转人工关键词"时，会跳过AI直接等待人工处理</li>
          <li>建议合理设置温度参数和系统提示词，以获得更好的回复效果</li>
          <li>请妥善保管API Key，避免泄露</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

// 表单数据
const config = reactive({
  enableAi: false,
  aiModel: 'openai',
  apiUrl: 'https://api.openai.com/v1/chat/completions',
  apiKey: '',
  modelName: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 1000,
  systemPrompt: '你是一个专业的电商客服助手，请礼貌、专业地回答用户的问题。',
  keepContext: true,
  contextRounds: 5,
  transferKeywords: '人工,转人工,联系客服',
  workTimeMode: 2,
  workStartTime: '09:00',
  workEndTime: '18:00',
  aiFirstMessage: true,
  timeout: 30
})

const workTimeRange = ref<[string, string]>(['09:00', '18:00'])
const formRef = ref()
const saving = ref(false)

// 表单验证规则
const rules = {
  apiUrl: [{ required: true, message: '请输入API地址', trigger: 'blur' }],
  apiKey: [{ required: true, message: '请输入API Key', trigger: 'blur' }],
  modelName: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
}

// 加载配置
const loadConfig = async () => {
  try {
    const res = await request.get('/im/config/ai/detail')
    Object.assign(config, res.data)
    workTimeRange.value = [config.workStartTime, config.workEndTime]
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

// 保存配置
const saveConfig = async () => {
  try {
    await formRef.value.validate()
    saving.value = true
    await request.post('/im/config/ai/update', config)
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 测试连接
const testConnection = async () => {
  try {
    const res = await request.post('/im/config/ai/test', config)
    ElMessage.success(res.data || '连接测试成功')
  } catch (error: any) {
    ElMessage.error(error.message || '连接测试失败')
  }
}

// 时间范围变化
const handleTimeChange = (value: [string, string]) => {
  if (value) {
    config.workStartTime = value[0]
    config.workEndTime = value[1]
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<style scoped lang="scss">
.ai-config-container {
  padding: 20px;

  .config-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .form-tip {
    margin-left: 10px;
    color: #909399;
    font-size: 12px;
    
    div {
      margin-top: 5px;
    }
  }

  .help-card {
    .help-content {
      h4 {
        margin-top: 15px;
        margin-bottom: 10px;
        color: #409eff;
      }

      ul {
        margin: 0;
        padding-left: 20px;
        
        li {
          margin: 5px 0;
          line-height: 1.6;
        }
      }

      a {
        color: #409eff;
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>
