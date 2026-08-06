# CyberSWAT 门户 PRD（v0.1 — 构思收集阶段）

> 状态：demo 已完成（https://cyberswat.cn），本文件为整体 PRD 演进文档
> 原则：先完整性后取舍，构思全部记录，再逐条评审（可行性/优先级/依赖）

## 1. 定位
中国人民公安大学网络特警队（CyberSWAT）官方门户。

## 2. 现状（demo 已实现）
- 主站：首页（Hero/数据/部门/荣誉精选/友链）、/about、/honors（38条筛选）、/departments、/departments/:slug 占位、/news 占位
- 部署：Docker + CF Tunnel，cyberswat.cn 已上线
- 8 部门子域 slug 已定：attack/forensics/modeling/algorithm/bigdata/dev/ai/pr

## 3. 核心架构（已定）
- 主站 = 资讯 + 风采 + 介绍（聚合层）
- 部门子站 = 各部门独立 PRD 独立部署（子域）

## 4. 构思池（用户逐条补充，每条记录：构思 / 背景 / 问题点 / 评审结论）

<!-- 用户抛构思时逐条追加 -->

## 5. 待评审问题

## 6. 里程碑
- [x] M0: demo 上线（2026-08-06）
- [ ] M1: PRD 定稿
- [ ] M2: 主站完整版
- [ ] M3: 子站体系
