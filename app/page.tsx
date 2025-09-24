export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            GitHub Trending Auto-Publisher
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            自动抓取GitHub热门项目，生成中英文内容并分发到多个平台
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-900 mb-3">
                🔄 自动化流程
              </h2>
              <ul className="text-blue-800 space-y-2">
                <li>• 每日抓取 GitHub Trending</li>
                <li>• AI生成中英文文章</li>
                <li>• 自动渲染分享卡片</li>
                <li>• 多平台同步发布</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-green-900 mb-3">
                🚀 支持平台
              </h2>
              <ul className="text-green-800 space-y-2">
                <li>• Telegram 频道</li>
                <li>• DEV.to 社区</li>
                <li>• Medium 博客</li>
                <li>• 国内平台(RPA)</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 flex gap-4">
            <a 
              href="/articles" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              📚 精选文章
            </a>
            <a 
              href="/admin" 
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              📊 管理面板
            </a>
            <a 
              href="/api/demo/publish" 
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              🧪 测试发布
            </a>
          </div>
          
          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">📈 系统状态</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">Daily</div>
                <div className="text-sm text-gray-600">抓取频率</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">Auto</div>
                <div className="text-sm text-gray-600">发布模式</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">Multi</div>
                <div className="text-sm text-gray-600">平台支持</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}