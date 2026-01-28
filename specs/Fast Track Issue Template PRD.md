# **Product Requirement Document: Fast Track Issue Templates**

| 属性 | 内容 |
| :---- | :---- |
| **Project** | Fast Track Extension \- Issue Creation Module |
| **Version** | 1.0.0 (Dev Ready) |
| **Status** | **Draft** |
| **Author** | Product Team |
| **Last Updated** | 2024-05-21 |

## **1\. 背景与问题定义 (Background & Problem)**

### **1.1 当前痛点**

目前用户通过 Fast Track 创建 Jira 工单时，虽然免去了打开网页的时间，但面临与 Jira Web 端相同的\*\*“填表地狱”\*\*：

1. **必填项冗余**：Jira 配置往往强制要求填写 Component, Version, Label, Epic Link 等字段，但对于特定的日常任务（如 "前端 Bug"），这些值往往是固定的。  
2. **上下文切换成本**：用户需要中断当前心流，去思考每一个字段该选什么。  
3. **认知负荷**：Jira Create Screen 展示了所有字段，导致视觉噪点极高。

### **1.2 解决方案：Linear-style Templates**

参考 Linear 的设计哲学，通过 **Issue Templates** 将 Jira 的复杂性封装起来。

* **核心理念**：User Input \= Jira Requirements \- Template Presets。  
* **价值主张**：将创建工单的时间从 1-2 分钟缩短至 5 秒内。

## **2\. 核心用户流程 (User Flows)**

### **Flow A: Template Management (Configuration)**

**目标**：用户预先定义好场景化的模板（一次配置，无限复用）。

* **路径优先级**：**P0 (Manual Builder)**。从现有工单提取 (Extract from Issue) 降级为 P2。  
1. 用户进入 Fast Track Settings \-\> "Issue Templates"。  
2. 点击 "Create New Template"。  
3. **Scope Selection**：选择 Jira Site \-\> Project \-\> Issue Type (必须先选定这三者，才能加载字段 Schema)。  
4. **Field Configuration**：  
   * 系统加载该 Project/Type 下的所有字段。  
   * 用户设置 **Preset Values** (预设值)。例如：Component \= Frontend, Label \= Bug。  
   * 对于未预设的字段，用户可选择是否强制显示。  
5. 保存模板，设置 Trigger Keyword (e.g., "febug").

### **Flow B: Runtime Execution (Creation)**

**目标**：用户在极短时间内完成创建。

1. **Trigger**: 用户唤起 Fast Track，输入 "febug" 或点击模板图标。  
2. **Gap Calculation (系统后台执行)**:  
   * 获取 Jira 当前实时的 CreateMeta (包含必填信息)。  
   * 计算：**需展示字段 \= (Jira 必填字段 U 用户强制展示字段) \- 模板预设字段**。  
3. **Render**: 弹出极简表单，仅展示 Title, Description 及上述计算出的“剩余字段”。  
4. **Submit**: 合并 User Input \+ Template Presets，提交给 Jira。

## **3\. 功能详细规格 (Functional Specifications)**

### **3.1 数据结构 (Data Model)**

Template 在本地存储（chrome.storage.local）中的结构定义：

interface IssueTemplate {  
  id: string;              // UUID  
  name: string;            // Display Name, e.g., "Frontend Bug"  
  trigger: string;         // Shortcut keyword  
  icon?: string;           // Optional icon  
    
  // Scope (The Anchor)  
  scope: {  
    siteUrl: string;  
    projectKey: string;  
    issueTypeId: string;  
  };

  // The Payload (Preset Values)  
  // Key: Field ID (system or custom), Value: The preset value  
  presets: Record\<string, any\>;   
    
  // UX Config  
  descriptionTemplate?: string; // Markdown template for description field  
  visibleFields?: string\[\];     // Array of field IDs to force show even if optional  
}

### **3.2 关键逻辑：字段差量计算 (The Gap Analysis)**

这是运行时最重要的算法。

**输入**：

1. Template Config (本地存储)  
2. Jira CreateMeta (API: GET /rest/api/2/issue/createmeta?expand=projects.issuetypes.fields)

**算法逻辑**：

function computeVisibleFields(template, jiraMeta) {  
  const visibleFields \= \[\];  
    
  // 1\. 总是显示 Summary (除非被魔改，一般不建议预设 Summary)  
  visibleFields.push(jiraMeta.fields\['summary'\]);

  // 2\. 遍历 Jira 返回的所有字段  
  for (const fieldId in jiraMeta.fields) {  
    const fieldSchema \= jiraMeta.fields\[fieldId\];  
    const isPreset \= template.presets.hasOwnProperty(fieldId);  
    const isRequired \= fieldSchema.required;  
      
    // 逻辑核心：  
    // 如果字段是必填的，且没有预设值 \-\> 必须显示  
    if (isRequired && \!isPreset) {  
      visibleFields.push(fieldSchema);  
      continue;  
    }  
      
    // 如果用户配置强制显示 (即使是选填，或者已有预设值但允许覆盖)  
    if (template.visibleFields.includes(fieldId)) {  
       visibleFields.push(fieldSchema);  
    }  
  }  
    
  return visibleFields;  
}

### **3.3 复杂字段处理 (Field Handling Guidelines)**

| 字段类型 (Schema Type) | UI 组件 | 处理逻辑 |
| :---- | :---- | :---- |
| string, textarea | Input, Textarea | 直接映射。 |
| number | Input (type=number) | 校验数字格式。 |
| option, priority, resolution | Combobox (Single) | 从 allowedValues 加载选项。 |
| array (Labels, Components) | Combobox (Multi) | 支持多选，Tag 样式展示。 |
| user (Assignee, Reporter) | User Search Input | 需调用 User Search API，支持模糊搜索。 |
| **cascadingselect** | **Dual Combobox** | **难点**：渲染两个联动下拉框。Parent 选定后，Child 的 options 从 Parent 的 children 属性获取。 |
| date, datetime | Date Picker | 使用原生或简易 Date Picker。 |

### **3.4 异常流程与兜底 (Error Handling)**

**场景：Jira 后端校验失败**

由于 Jira 有些校验逻辑（如 ScriptRunner Validators）不在 CreateMeta 中返回，API 可能会拒绝提交。

* **策略**：Optimistic UI \+ Reactive Recovery。  
* **行为**：  
  1. 用户点击 Submit。  
  2. 若 API 返回 400 错误：  
     * 解析错误响应体 errors: { "customfield\_10021": "Reason..." }。  
     * **不要关闭弹窗**。  
     * 动态将报错的字段（customfield\_10021）追加到当前表单底部，标红显示错误信息。  
     * 用户填写修正后再次提交。

## **4\. 开发阶段规划 (Phasing)**

### **Phase 1: MVP (Core Value)**

* **目标**：跑通主流程，支持基础字段。  
* **Scope**：  
  * Template CRUD 页面 (Project/Type 选择器 \+ 预设值表单)。  
  * 运行时 Gap Calculation 逻辑。  
  * 支持字段类型：String, Number, Single Select, Priority, Description。  
  * 不支持复杂 Custom Fields 和 Cascading Selects。

### **Phase 2: Robustness (Jira Compatibility)**

* **目标**：兼容真实的复杂 Jira 环境。  
* **Scope**：  
  * 支持 Cascading Select (级联菜单)。  
  * 支持 Multi-select (Components, Versions)。  
  * 实现 "Reactive Recovery" 错误处理机制。

### **Phase 3: Intelligence (Context Aware) \- \[Deprioritized\]**

* **Scope**：  
  * 根据选中的网页文本自动填充 Description。

## **5\. UI/UX 要求**

* **Keyboard First**：整个创建流程（打开 \-\> 填写 \-\> 提交）必须能仅用键盘完成。  
* **Loading State**：获取 CreateMeta 可能耗时 (1-2s)，需展示骨架屏 (Skeleton)，避免界面闪烁。  
* **Visual Noise**：预设值的字段在运行时默认**不展示**，但提供 "Show all fields" 折叠面板以供查阅。