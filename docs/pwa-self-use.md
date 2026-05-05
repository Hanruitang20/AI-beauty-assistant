# BeautyShelf AI Mobile-First PWA（自用阶段）

## 当前阶段定位

本阶段仅实现 **mobile-first Web + PWA 基础能力**，目标是在 iPhone Safari 中添加到主屏幕后，以接近 App 的方式自用。

这不是 App Store 原生包，也不包含 Capacitor、React Native 或原生打包流程。

## 如何在 iPhone Safari 添加到主屏幕

1. 在本地或部署环境打开 BeautyShelf AI（建议使用 HTTPS 部署地址）。
2. 使用 iPhone Safari 打开站点首页。
3. 点击底部分享按钮（方框上箭头）。
4. 选择“添加到主屏幕”。
5. 确认名称后添加，返回桌面即可像 App 一样独立打开（standalone）。

## 本地与部署建议

- 本地调试可先在桌面浏览器模拟移动宽度（375/390/414）并检查触摸可用性。
- 真机体验建议使用可被手机访问的地址（同局域网或公网 HTTPS 域名）。
- 如需稳定长期自用，推荐部署到线上 HTTPS 域名后再添加到主屏幕。

## 后续若要上架 App Store

要进入 App Store 分发，还需要进入原生包装阶段：

1. 引入 Capacitor（或等效原生容器）；
2. 配置 iOS 工程并打包；
3. 通过 TestFlight 分发测试；
4. 完成 App Store 提交流程。

## Capacitor 阶段的重要前提

Capacitor 打包后的手机 App 不能直接运行 Next.js API Routes 的 Node 端运行时。

因此该阶段需要可公网访问的后端服务（API/数据库/鉴权服务），App 通过网络请求访问后端，而不是在手机端直接承载 Next.js 服务端逻辑。
