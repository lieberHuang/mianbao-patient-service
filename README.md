# 眠宝患者服务小程序预览

公开预览：https://lieberhuang.github.io/mianbao-patient-service/

本仓库包含当前 HTML 原型，首页、健康记录、眠宝帮你、权益中心和我的，以及所有二级页面。

## 在线版

根目录为 GitHub Pages 静态网站，无需安装依赖。所有页面可在电脑和手机打开。患者记录、左侧说明编辑及右侧修改意见保存在当前设备浏览器，刷新后保留，但不跨设备同步，也不提交到 GitHub。网站未连接真实医疗、保险申请或 AI 服务。

语音输入依赖浏览器的 SpeechRecognition 支持及麦克风权限，可能使用浏览器平台的识别服务；不支持时可使用文字或系统键盘听写。

## 本地版

`local-preview/` 保存原始本地项目。运行：

```bash
cd local-preview
python3 server.py
```

然后访问 http://127.0.0.1:8765/ 。本地版保存左侧说明与右侧意见会写回该目录的 index.html。

## 更新发布

推送根目录静态文件到 main 后，GitHub Pages 自动更新。业务代码与样式变更须同时维护在线版和 local-preview 版本；在线版通过浏览器存储代替 Python 保存接口。
